-- trigger.sql
-- Only trigger DROP / CREATE statements. Run this AFTER function.sql.

-- news_update_score: row-level trigger handles INSERT/UPDATE/DELETE on news
DROP TRIGGER IF EXISTS news_update_score ON news;
CREATE OR REPLACE TRIGGER news_update_score
AFTER INSERT OR UPDATE OR DELETE
ON news
FOR EACH ROW
EXECUTE FUNCTION trg_news_update_score();


-- news_score_update_district: row-level trigger on news_score to keep district aggregates up to date
DROP TRIGGER IF EXISTS news_score_update_district ON news_score;
CREATE OR REPLACE TRIGGER news_score_update_district
AFTER INSERT OR UPDATE OF calculated_score OR DELETE
ON news_score
FOR EACH ROW
EXECUTE FUNCTION trg_news_score_update_district();


-- news_global_recompute: statement-level trigger to recompute everything after any statement that changes news
DROP TRIGGER IF EXISTS news_global_recompute ON news;
CREATE OR REPLACE TRIGGER news_global_recompute
AFTER INSERT OR UPDATE OR DELETE
ON news
FOR EACH STATEMENT
EXECUTE FUNCTION trg_news_global_recompute();
