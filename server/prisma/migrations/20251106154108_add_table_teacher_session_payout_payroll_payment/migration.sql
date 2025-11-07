/*
  Warnings:

  - You are about to drop the column `base_salary` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `payrolls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payrolls" DROP COLUMN "base_salary",
DROP COLUMN "paid_at",
ADD COLUMN     "admin_published_at" TIMESTAMP(3),
ADD COLUMN     "payroll_payment_id" BIGINT,
ADD COLUMN     "teacher_action_at" TIMESTAMP(3),
ADD COLUMN     "teacher_rejection_reason" TEXT;

-- CreateTable
CREATE TABLE "teacher_session_payouts" (
    "id" BIGSERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "payroll_id" BIGINT,
    "session_fee_per_student" DECIMAL(12,2) NOT NULL,
    "student_count" INTEGER NOT NULL,
    "total_revenue" DECIMAL(12,2) NOT NULL,
    "payout_rate" DECIMAL(5,4) NOT NULL,
    "teacher_payout" DECIMAL(12,2) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'calculated',

    CONSTRAINT "teacher_session_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_payments" (
    "id" BIGSERIAL NOT NULL,
    "teacher_id" UUID NOT NULL,
    "paid_by_user_id" UUID NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "paid_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "payroll_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_session_payouts_session_id_key" ON "teacher_session_payouts"("session_id");

-- CreateIndex
CREATE INDEX "teacher_session_payouts_teacher_id_idx" ON "teacher_session_payouts"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_session_payouts_payroll_id_idx" ON "teacher_session_payouts"("payroll_id");

-- CreateIndex
CREATE INDEX "teacher_session_payouts_status_idx" ON "teacher_session_payouts"("status");

-- CreateIndex
CREATE INDEX "payroll_payments_teacher_id_idx" ON "payroll_payments"("teacher_id");

-- CreateIndex
CREATE INDEX "payroll_payments_paid_by_user_id_idx" ON "payroll_payments"("paid_by_user_id");

-- CreateIndex
CREATE INDEX "payrolls_payroll_payment_id_idx" ON "payrolls"("payroll_payment_id");

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_payroll_payment_id_fkey" FOREIGN KEY ("payroll_payment_id") REFERENCES "payroll_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_session_payouts" ADD CONSTRAINT "teacher_session_payouts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_session_payouts" ADD CONSTRAINT "teacher_session_payouts_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_session_payouts" ADD CONSTRAINT "teacher_session_payouts_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payrolls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_payments" ADD CONSTRAINT "payroll_payments_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
