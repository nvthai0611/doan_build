-- AlterTable
ALTER TABLE "contract_uploads" ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "status" TEXT DEFAULT 'active';
