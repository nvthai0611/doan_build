/*
  Warnings:

  - You are about to drop the column `method` on the `payments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('bank_transfer', 'cash');

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "method",
ADD COLUMN     "payment_method" "PaymentMethod";
