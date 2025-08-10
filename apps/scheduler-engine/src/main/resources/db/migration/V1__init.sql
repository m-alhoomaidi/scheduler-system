-- Create scheduled_tasks table and indexes
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY,
    ssuuid VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    execution_count INTEGER NOT NULL DEFAULT 0,
    last_executed_at TIMESTAMP NULL,
    status VARCHAR(50) NOT NULL
);

-- Unique index for (ssuuid, idempotency_key)
CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_key
    ON scheduled_tasks (ssuuid, idempotency_key)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ssuuid ON scheduled_tasks (ssuuid);
CREATE INDEX IF NOT EXISTS idx_created_at ON scheduled_tasks (created_at);
CREATE INDEX IF NOT EXISTS idx_deleted_at ON scheduled_tasks (deleted_at);


