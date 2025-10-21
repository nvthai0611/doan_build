-- AlterTable
ALTER TABLE "class_sessions" ALTER COLUMN "status" SET DEFAULT 'happening';

-- AlterTable
ALTER TABLE "enrollments" ALTER COLUMN "status" SET DEFAULT 'not_been_updated';

-- AlterTable
ALTER TABLE "fee_structures" ALTER COLUMN "period" SET DEFAULT 'per_session';
