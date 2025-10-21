-- AlterTable
ALTER TABLE "student_session_attendance" ADD COLUMN     "is_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sent_at" TIMESTAMPTZ(6);
