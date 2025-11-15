-- AlterTable
ALTER TABLE "payrolls" ADD COLUMN     "adjustment_details" JSONB,
ADD COLUMN     "back_pay_amount" DECIMAL(12,2) DEFAULT 0,
ALTER COLUMN "bonuses" DROP NOT NULL,
ALTER COLUMN "deductions" DROP NOT NULL;
