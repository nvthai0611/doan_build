/*
  Warnings:

  - You are about to drop the column `grade` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_assignment_id` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the `teacher_class_assignments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student_id,class_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."enrollments" DROP CONSTRAINT "enrollments_teacher_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_class_assignments" DROP CONSTRAINT "teacher_class_assignments_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_class_assignments" DROP CONSTRAINT "teacher_class_assignments_teacher_id_fkey";

-- DropIndex
DROP INDEX "public"."enrollments_student_id_teacher_assignment_id_key";

-- AlterTable
ALTER TABLE "public"."class_sessions" ADD COLUMN     "teacher_id" UUID;

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "grade",
ADD COLUMN     "grade_id" UUID,
ADD COLUMN     "teacher_id" UUID;

-- AlterTable
ALTER TABLE "public"."enrollments" DROP COLUMN "teacher_assignment_id";

-- DropTable
DROP TABLE "public"."teacher_class_assignments";

-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_class_id_key" ON "public"."enrollments"("student_id", "class_id");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "public"."Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
