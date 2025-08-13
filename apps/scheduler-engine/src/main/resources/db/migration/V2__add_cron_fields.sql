-- Add CRON expression and next execution time fields to scheduled_tasks
ALTER TABLE scheduled_tasks 
ADD COLUMN cron_expression VARCHAR(50) NOT NULL DEFAULT '*/5 * * * * *',
ADD COLUMN next_execution_time TIMESTAMP;

-- Set initial next execution time for existing tasks (if any)
UPDATE scheduled_tasks 
SET next_execution_time = NOW() + INTERVAL '5 seconds'
WHERE next_execution_time IS NULL;
