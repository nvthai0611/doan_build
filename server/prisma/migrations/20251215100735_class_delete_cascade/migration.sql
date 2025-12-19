-- DropForeignKey
ALTER TABLE "public"."progress_reports" DROP CONSTRAINT "progress_reports_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."schedule_changes" DROP CONSTRAINT "schedule_changes_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."session_requests" DROP CONSTRAINT "session_requests_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_class_requests" DROP CONSTRAINT "student_class_requests_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_class_transfers" DROP CONSTRAINT "teacher_class_transfers_from_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_class_transfers" DROP CONSTRAINT "teacher_class_transfers_to_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_feedbacks" DROP CONSTRAINT "teacher_feedbacks_class_id_fkey";

-- AddForeignKey
ALTER TABLE "student_class_requests" ADD CONSTRAINT "student_class_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_changes" ADD CONSTRAINT "schedule_changes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_from_class_id_fkey" FOREIGN KEY ("from_class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_to_class_id_fkey" FOREIGN KEY ("to_class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
