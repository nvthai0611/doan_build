/*
  Warnings:

  - You are about to drop the `FeeRecordPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FeeRecordPayment" DROP CONSTRAINT "FeeRecordPayment_feeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FeeRecordPayment" DROP CONSTRAINT "FeeRecordPayment_paymentId_fkey";

-- DropTable
DROP TABLE "public"."FeeRecordPayment";

-- CreateTable
CREATE TABLE "fee_records_payment" (
    "id" UUID NOT NULL,
    "paymentId" UUID,
    "feeRecordId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "fee_records_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fee_records_payment_paymentId_feeRecordId_key" ON "fee_records_payment"("paymentId", "feeRecordId");

-- AddForeignKey
ALTER TABLE "fee_records_payment" ADD CONSTRAINT "fee_records_payment_feeRecordId_fkey" FOREIGN KEY ("feeRecordId") REFERENCES "fee_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records_payment" ADD CONSTRAINT "fee_records_payment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
