-- CreateTable
CREATE TABLE "holiday_periods" (
    "id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "note" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_period_sessions" (
    "holiday_period_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "linked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_period_sessions_pkey" PRIMARY KEY ("holiday_period_id","session_id")
);

-- CreateIndex
CREATE INDEX "idx_hps_session" ON "holiday_period_sessions"("session_id");

-- CreateIndex
CREATE INDEX "idx_hps_holiday" ON "holiday_period_sessions"("holiday_period_id");

-- AddForeignKey
ALTER TABLE "holiday_period_sessions" ADD CONSTRAINT "holiday_period_sessions_holiday_period_id_fkey" FOREIGN KEY ("holiday_period_id") REFERENCES "holiday_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_period_sessions" ADD CONSTRAINT "holiday_period_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
