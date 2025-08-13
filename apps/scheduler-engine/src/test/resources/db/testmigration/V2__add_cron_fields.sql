ALTER TABLE scheduled_tasks 
ADD COLUMN cron_expression VARCHAR(50) NOT NULL DEFAULT '0/5 * * * * *';

ALTER TABLE scheduled_tasks 
ADD COLUMN next_execution_time TIMESTAMP;

UPDATE scheduled_tasks 
SET next_execution_time = DATEADD('SECOND', 5, CURRENT_TIMESTAMP)
WHERE next_execution_time IS NULL;
