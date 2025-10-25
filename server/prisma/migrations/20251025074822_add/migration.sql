/*
  Warnings:

  - You are about to drop the column `fee_record_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_fee_record_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "fee_record_id";

-- CreateTable
CREATE TABLE "FeeRecordPayment" (
    "id" UUID NOT NULL,
    "paymentId" UUID,
    "feeRecordId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "FeeRecordPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeRecordPayment_paymentId_feeRecordId_key" ON "FeeRecordPayment"("paymentId", "feeRecordId");

-- AddForeignKey
ALTER TABLE "FeeRecordPayment" ADD CONSTRAINT "FeeRecordPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeRecordPayment" ADD CONSTRAINT "FeeRecordPayment_feeRecordId_fkey" FOREIGN KEY ("feeRecordId") REFERENCES "fee_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
