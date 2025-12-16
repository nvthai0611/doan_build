-- AlterTable
ALTER TABLE "fee_records" ALTER COLUMN "status" SET DEFAULT 'calculated';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';
