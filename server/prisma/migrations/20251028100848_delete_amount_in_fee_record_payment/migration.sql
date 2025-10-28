/*
  Warnings:

  - You are about to drop the column `amount` on the `fee_records_payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `fee_records_payment` table. All the data in the column will be lost.
  - You are about to drop the column `feeRecordId` on the `fee_records_payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `fee_records_payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payment_id,fee_record_id]` on the table `fee_records_payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."fee_records_payment" DROP CONSTRAINT "fee_records_payment_feeRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."fee_records_payment" DROP CONSTRAINT "fee_records_payment_paymentId_fkey";

-- DropIndex
DROP INDEX "public"."fee_records_payment_paymentId_feeRecordId_key";

-- AlterTable
ALTER TABLE "fee_records_payment" DROP COLUMN "amount",
DROP COLUMN "createdAt",
DROP COLUMN "feeRecordId",
DROP COLUMN "paymentId",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fee_record_id" UUID,
ADD COLUMN     "payment_id" UUID,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "fee_records_payment_payment_id_fee_record_id_key" ON "fee_records_payment"("payment_id", "fee_record_id");

-- AddForeignKey
ALTER TABLE "fee_records_payment" ADD CONSTRAINT "fee_records_payment_fee_record_id_fkey" FOREIGN KEY ("fee_record_id") REFERENCES "fee_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records_payment" ADD CONSTRAINT "fee_records_payment_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
