-- DropForeignKey
ALTER TABLE "public"."student_session_attendance" DROP CONSTRAINT "student_session_attendance_recorded_by_fkey";

-- AddForeignKey
ALTER TABLE "student_session_attendance" ADD CONSTRAINT "student_session_attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
