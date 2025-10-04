/*
  Warnings:

  - A unique constraint covering the columns `[student_id,teacher_assignment_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."enrollments_student_id_class_id_key";

-- AlterTable
ALTER TABLE "public"."enrollments" ADD COLUMN     "teacher_assignment_id" UUID;

-- AlterTable
ALTER TABLE "public"."teacher_class_assignments" ADD COLUMN     "current_students" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_students" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_teacher_assignment_id_key" ON "public"."enrollments"("student_id", "teacher_assignment_id");

-- AddForeignKey
ALTER TABLE "public"."enrollments" ADD CONSTRAINT "enrollments_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "public"."teacher_class_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
