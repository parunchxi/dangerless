CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO app_settings(key, value)
VALUES ('decay_half_life_days', '7');

CREATE FUNCTION get_setting_float(p_key TEXT, p_default FLOAT)
RETURNS FLOAT
LANGUAGE plpgsql AS $$
DECLARE v TEXT;
BEGIN
  SELECT value INTO v
  FROM app_settings
  WHERE key = p_key;
  RETURN COALESCE(v::FLOAT, p_default);
END;
$$;

CREATE FUNCTION recency_factor(p_date TIMESTAMPTZ)
RETURNS FLOAT
LANGUAGE sql AS $$
  WITH params AS (
    SELECT get_setting_float('decay_half_life_days', 7.0) AS hl
  )
  SELECT
    CASE
      WHEN p_date IS NULL THEN 0
      ELSE
        0.5 ^ (
          (EXTRACT(EPOCH FROM (now() - p_date)) / 86400.0)
          / (SELECT hl FROM params)
        )
    END
$$;

