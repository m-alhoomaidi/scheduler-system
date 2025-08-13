-- H2 requires dropping dependent constraints/indexes before dropping a column
ALTER TABLE scheduled_tasks DROP CONSTRAINT IF EXISTS idx_idempotency_key;
DROP INDEX IF EXISTS idx_idempotency_key;
ALTER TABLE scheduled_tasks DROP COLUMN idempotency_key;