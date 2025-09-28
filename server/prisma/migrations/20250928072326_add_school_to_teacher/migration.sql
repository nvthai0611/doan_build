/*
  Warnings:

  - You are about to drop the `attendances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_parent_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_requests" DROP CONSTRAINT "class_requests_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_requests" DROP CONSTRAINT "class_requests_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."grades" DROP CONSTRAINT "grades_assessment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."grades" DROP CONSTRAINT "grades_graded_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."grades" DROP CONSTRAINT "grades_student_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_parent_links" DROP CONSTRAINT "student_parent_links_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_parent_links" DROP CONSTRAINT "student_parent_links_student_id_fkey";

-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "school_id" UUID;

-- DropTable
DROP TABLE "public"."attendances";

-- DropTable
DROP TABLE "public"."class_requests";

-- DropTable
DROP TABLE "public"."grades";

-- DropTable
DROP TABLE "public"."student_parent_links";

-- CreateTable
CREATE TABLE "public"."student_parent_relationships" (
    "id" BIGSERIAL NOT NULL,
    "student_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "relation" TEXT,
    "primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_parent_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_class_requests" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_class_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_session_attendance" (
    "id" BIGSERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "recorded_by" UUID NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_session_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_assessment_grades" (
    "id" BIGSERIAL NOT NULL,
    "assessment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "score" DECIMAL(5,2),
    "feedback" TEXT,
    "graded_by" UUID NOT NULL,
    "graded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_assessment_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schema_audit" (
    "id" SERIAL NOT NULL,
    "event_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "command_tag" TEXT,
    "object_type" TEXT,
    "object_identity" TEXT,
    "username" TEXT,
    "sql_text" TEXT,

    CONSTRAINT "schema_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_parent_relationships_student_id_parent_id_key" ON "public"."student_parent_relationships"("student_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_session_attendance_session_id_student_id_key" ON "public"."student_session_attendance"("session_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_assessment_grades_assessment_id_student_id_key" ON "public"."student_assessment_grades"("assessment_id", "student_id");

-- AddForeignKey
ALTER TABLE "public"."student_parent_relationships" ADD CONSTRAINT "student_parent_relationships_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_parent_relationships" ADD CONSTRAINT "student_parent_relationships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teachers" ADD CONSTRAINT "teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_class_requests" ADD CONSTRAINT "student_class_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_class_requests" ADD CONSTRAINT "student_class_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_session_attendance" ADD CONSTRAINT "student_session_attendance_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_session_attendance" ADD CONSTRAINT "student_session_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_session_attendance" ADD CONSTRAINT "student_session_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_assessment_grades" ADD CONSTRAINT "student_assessment_grades_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_assessment_grades" ADD CONSTRAINT "student_assessment_grades_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_assessment_grades" ADD CONSTRAINT "student_assessment_grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
