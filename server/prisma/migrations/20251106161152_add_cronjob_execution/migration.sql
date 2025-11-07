-- CreateTable
CREATE TABLE "cron_job_executions" (
    "id" UUID NOT NULL,
    "job_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "error_details" JSONB,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cron_job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cronjob_type" ON "cron_job_executions"("job_type");

-- CreateIndex
CREATE INDEX "idx_cronjob_status" ON "cron_job_executions"("status");

-- CreateIndex
CREATE INDEX "idx_cronjob_started" ON "cron_job_executions"("started_at");
