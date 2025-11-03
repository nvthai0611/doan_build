-- AlterTable
ALTER TABLE "contract_uploads" ADD COLUMN     "student_id" UUID,
ADD COLUMN     "subjectIds" TEXT[];

-- AlterTable
ALTER TABLE "student_class_requests" ADD COLUMN     "contract_upload_id" UUID;

-- CreateIndex
CREATE INDEX "idx_contract_upload_student" ON "contract_uploads"("student_id");

-- AddForeignKey
ALTER TABLE "student_class_requests" ADD CONSTRAINT "student_class_requests_contract_upload_id_fkey" FOREIGN KEY ("contract_upload_id") REFERENCES "contract_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_uploads" ADD CONSTRAINT "contract_uploads_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
