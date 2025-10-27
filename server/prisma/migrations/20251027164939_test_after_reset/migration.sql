-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "cancellation_reason" TEXT;

-- AlterTable
ALTER TABLE "teacher_feedbacks" ALTER COLUMN "status" SET DEFAULT 'approved';
