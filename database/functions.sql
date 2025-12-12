-- function.sql
-- All functions (including trigger functions) live here.
-- Run this file BEFORE trigger.sql.

CREATE OR REPLACE FUNCTION compute_news_score(p_news_id UUID)
RETURNS FLOAT
LANGUAGE sql AS $$
  WITH 
  n AS (
    SELECT *
    FROM news
    WHERE id = p_news_id
  ),
  cs AS (
    SELECT base_score
    FROM category_score
    WHERE id = (SELECT category_id FROM n)
  ),
  sev AS (
    SELECT severity_weight
    FROM news_severity
    WHERE id = (SELECT severity_id FROM n)
  )
  SELECT
    CASE
      WHEN (SELECT status FROM n) <> 'Published'
           OR (SELECT base_score FROM cs) IS NULL
           OR (SELECT severity_weight FROM sev) IS NULL
      THEN 0
      ELSE
        LEAST(100,GREATEST(0,(
              (SELECT base_score FROM cs)
              * (SELECT severity_weight FROM sev)
              * recency_factor((SELECT date FROM n))
              * 5.0
            )
          )
        )
    END
$$;


CREATE OR REPLACE FUNCTION upsert_news_score(p_news_id UUID)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_score FLOAT;
BEGIN
  v_score := compute_news_score(p_news_id);

  INSERT INTO news_score (id, calculated_score, calculated_at)
  VALUES (p_news_id, v_score, now())
  ON CONFLICT (id)
  DO UPDATE
  SET calculated_score = EXCLUDED.calculated_score,
      calculated_at    = now();
END;
$$;


-- Risk-level classifier (used by district recompute)
CREATE OR REPLACE FUNCTION classify_risk_level(p_score FLOAT)
RETURNS text
LANGUAGE sql AS $$
  SELECT
    CASE
      WHEN p_score IS NULL OR p_score < 25 THEN 'Low'
      WHEN p_score < 50 THEN 'Moderate'
      WHEN p_score < 75 THEN 'High'
      ELSE 'Critical'
    END
$$;


-- Function to recompute one district
CREATE OR REPLACE FUNCTION recompute_district(p_district TEXT)
RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_score FLOAT;
BEGIN
  -- Average across all PUBLISHED news in that district
  SELECT
    COALESCE(AVG(ns.calculated_score), 0)
  INTO v_score
  FROM news n
  JOIN news_score ns ON ns.id = n.id
  WHERE n.district = p_district
    AND n.status   = 'Published';

  UPDATE district_zone
  SET risk_score = v_score,
      risk_level = classify_risk_level(v_score)
  WHERE district = p_district;
END;
$$;


-- Trigger function invoked by news_score inserts/updates/deletes to update district
CREATE OR REPLACE FUNCTION trg_news_score_update_district()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_district TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- For DELETE, NEW is null; get district from OLD via news join (if needed).
    SELECT district INTO v_district FROM news WHERE id = OLD.id;
  ELSE
    SELECT district INTO v_district FROM news WHERE id = NEW.id;
  END IF;

  IF v_district IS NOT NULL THEN
    PERFORM recompute_district(v_district);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


-- Trigger function fired on news (row-level) to upsert score and recompute district(s)
CREATE OR REPLACE FUNCTION trg_news_update_score()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$ 
DECLARE
  v_old_district TEXT;
  v_new_district TEXT;
BEGIN
  -- DELETE: use OLD, NEVER call upsert_news_score
  IF TG_OP = 'DELETE' THEN
    v_old_district := OLD.district;

    IF v_old_district IS NOT NULL THEN
      PERFORM recompute_district(v_old_district);
    END IF;

    RETURN OLD;
  END IF;

  -- INSERT or UPDATE: use NEW
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Recompute this news score
    IF NEW.id IS NOT NULL THEN
      PERFORM upsert_news_score(NEW.id);
    END IF;

    v_new_district := NEW.district;
    v_old_district := COALESCE(OLD.district, NEW.district);

    -- If district changed (on UPDATE), recompute both
    IF TG_OP = 'UPDATE' AND OLD.district IS DISTINCT FROM NEW.district THEN
      IF OLD.district IS NOT NULL THEN
        PERFORM recompute_district(OLD.district);
      END IF;
      IF NEW.district IS NOT NULL THEN
        PERFORM recompute_district(NEW.district);
      END IF;
    ELSE
      -- INSERT or same district UPDATE
      IF v_new_district IS NOT NULL THEN
        PERFORM recompute_district(v_new_district);
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- Fallback (should never hit)
  RETURN NULL;
END;
$$;


-- Recompute scores for all news (clears and recalculates)
CREATE OR REPLACE FUNCTION recompute_all_news_scores()
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Drop all existing scores to avoid stale / orphaned rows
  DELETE FROM news_score;

  -- Reinsert fresh scores for every news row
  INSERT INTO news_score (id, calculated_score, calculated_at)
  SELECT
    n.id,
    compute_news_score(n.id) AS calculated_score,
    now() AS calculated_at
  FROM news n;
END;
$$;


-- Recompute all districts using existing news_score rows
CREATE OR REPLACE FUNCTION recompute_all_districts()
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  -- Update districts that have at least one published news
  UPDATE district_zone dz
  SET
    risk_score = COALESCE(sub.avg_score, 0),
    risk_level = classify_risk_level(COALESCE(sub.avg_score, 0))
  FROM (
    SELECT
      n.district,
      AVG(ns.calculated_score) AS avg_score
    FROM news n
    JOIN news_score ns ON ns.id = n.id
    WHERE n.status = 'Published'
      AND n.district IS NOT NULL
    GROUP BY n.district
  ) sub
  WHERE dz.district = sub.district;

  -- Districts with NO published news at all → reset to 0 / Low
  UPDATE district_zone dz
  SET
    risk_score = 0,
    risk_level = classify_risk_level(0)
  WHERE NOT EXISTS (
    SELECT 1
    FROM news n
    JOIN news_score ns ON ns.id = n.id
    WHERE n.status = 'Published'
      AND n.district = dz.district
  );
END;
$$;


-- Trigger function for global recompute (statement-level)
CREATE OR REPLACE FUNCTION trg_news_global_recompute()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM recompute_all_news_scores();
  PERFORM recompute_all_districts();
  RETURN NULL;
END;
$$;
