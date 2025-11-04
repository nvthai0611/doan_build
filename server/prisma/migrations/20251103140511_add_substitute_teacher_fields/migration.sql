-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "substitute_end_date" DATE,
ADD COLUMN     "substitute_teacher_id" UUID;

-- AlterTable
ALTER TABLE "teacher_class_transfers" ADD COLUMN     "substitute_end_date" DATE;

-- CreateIndex
CREATE INDEX "idx_session_substitute_end_date" ON "class_sessions"("substitute_end_date");

-- CreateIndex
CREATE INDEX "idx_transfer_substitute_end_date" ON "teacher_class_transfers"("substitute_end_date");

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_substitute_teacher_id_fkey" FOREIGN KEY ("substitute_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
