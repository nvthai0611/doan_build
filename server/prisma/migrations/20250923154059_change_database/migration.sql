/*
  Warnings:

  - You are about to alter the column `max_score` on the `assessments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to drop the column `course_id` on the `classes` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `grades` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to drop the column `url` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `payrolls` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `class_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `school_id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schools` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_parent_links` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[session_id,student_id]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,class_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assessment_id,student_id]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `alerts` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `assessments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `assessments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_score` on table `assessments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `date` on table `assessments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `materials` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `body` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `base_salary` to the `payrolls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `payrolls` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `rooms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `subjects` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."parents" DROP CONSTRAINT "parents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_parent_links" DROP CONSTRAINT "student_parent_links_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_parent_links" DROP CONSTRAINT "student_parent_links_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_school_id_fkey";

-- AlterTable
ALTER TABLE "public"."alerts" ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "processed_at" TIMESTAMPTZ(6),
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."assessments" ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "max_score" SET NOT NULL,
ALTER COLUMN "max_score" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "public"."class_sessions" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "start_time" SET DATA TYPE TEXT,
ALTER COLUMN "end_time" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "course_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fee_structure_id" UUID,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "max_students" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "subject_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."contracts" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."grades" ALTER COLUMN "score" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."materials" DROP COLUMN "url",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "file_size" BIGINT,
ADD COLUMN     "file_type" TEXT,
ADD COLUMN     "file_url" TEXT,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "scheduled_for" TIMESTAMPTZ(6),
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'general',
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "body" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."payrolls" DROP COLUMN "amount",
ADD COLUMN     "base_salary" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "bonuses" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "hourly_rate" DECIMAL(8,2),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "teaching_hours" DECIMAL(5,2),
ADD COLUMN     "total_amount" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."rooms" DROP COLUMN "location",
ADD COLUMN     "equipment" JSONB,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "class_name",
DROP COLUMN "school_id",
ADD COLUMN     "parent_name" TEXT,
ADD COLUMN     "parent_phone" TEXT,
ADD COLUMN     "parent_relation" TEXT;

-- AlterTable
ALTER TABLE "public"."subjects" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."courses";

-- DropTable
DROP TABLE "public"."parents";

-- DropTable
DROP TABLE "public"."schools";

-- DropTable
DROP TABLE "public"."student_parent_links";

-- CreateTable
CREATE TABLE "public"."class_requests" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fee_structures" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "period" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fee_records" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "discount" DECIMAL(12,2) DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" UUID NOT NULL,
    "fee_record_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "reference" TEXT,
    "paid_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leave_requests" (
    "id" UUID NOT NULL,
    "request_type" TEXT NOT NULL,
    "teacher_id" UUID,
    "student_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_changes" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "original_date" DATE NOT NULL,
    "original_time" TEXT NOT NULL,
    "new_date" DATE NOT NULL,
    "new_time" TEXT NOT NULL,
    "new_room_id" UUID,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "schedule_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_reports" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "attendance" JSONB NOT NULL,
    "grades" JSONB NOT NULL,
    "feedback" TEXT,
    "suggestions" TEXT,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendances_session_id_student_id_key" ON "public"."attendances"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_class_id_key" ON "public"."enrollments"("student_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_assessment_id_student_id_key" ON "public"."grades"("assessment_id", "student_id");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_requests" ADD CONSTRAINT "class_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_requests" ADD CONSTRAINT "class_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_records" ADD CONSTRAINT "fee_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_records" ADD CONSTRAINT "fee_records_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "public"."fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_fee_record_id_fkey" FOREIGN KEY ("fee_record_id") REFERENCES "public"."fee_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leave_requests" ADD CONSTRAINT "leave_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_changes" ADD CONSTRAINT "schedule_changes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_changes" ADD CONSTRAINT "schedule_changes_new_room_id_fkey" FOREIGN KEY ("new_room_id") REFERENCES "public"."rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_reports" ADD CONSTRAINT "student_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
