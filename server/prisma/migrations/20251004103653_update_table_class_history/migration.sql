-- AlterTable
ALTER TABLE "public"."enrollments" ADD COLUMN     "completed_at" TIMESTAMPTZ(6),
ADD COLUMN     "completion_notes" TEXT,
ADD COLUMN     "completion_status" TEXT,
ADD COLUMN     "final_grade" TEXT;

-- AlterTable
ALTER TABLE "public"."teacher_class_assignments" ADD COLUMN     "actual_end_date" DATE,
ADD COLUMN     "completion_notes" TEXT,
ADD COLUMN     "completion_status" TEXT,
ADD COLUMN     "final_student_count" INTEGER;

-- CreateTable
CREATE TABLE "public"."class_histories" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "teacher_assignment_id" UUID NOT NULL,
    "snapshot_date" TIMESTAMPTZ(6) NOT NULL,
    "snapshot_type" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "class_name_normalized" TEXT NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "teacher_name_normalized" TEXT NOT NULL,
    "teacher_id" UUID NOT NULL,
    "subject_name" TEXT NOT NULL,
    "subject_name_normalized" TEXT NOT NULL,
    "subject_id" UUID NOT NULL,
    "student_count" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "actual_end_date" DATE,
    "semester" TEXT,
    "academic_year" TEXT,
    "grade" TEXT,
    "average_attendance_rate" DECIMAL(5,2),
    "completion_rate" DECIMAL(5,2),
    "average_grade" DECIMAL(5,2),
    "total_sessions" INTEGER,
    "completed_sessions" INTEGER,
    "search_tags" TEXT,
    "enrollment_details" JSONB,
    "schedule_details" JSONB,
    "assessment_details" JSONB,
    "created_by" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_histories_class_name_normalized_idx" ON "public"."class_histories"("class_name_normalized");

-- CreateIndex
CREATE INDEX "class_histories_teacher_name_normalized_idx" ON "public"."class_histories"("teacher_name_normalized");

-- CreateIndex
CREATE INDEX "class_histories_subject_name_normalized_idx" ON "public"."class_histories"("subject_name_normalized");

-- CreateIndex
CREATE INDEX "class_histories_teacher_id_academic_year_semester_idx" ON "public"."class_histories"("teacher_id", "academic_year", "semester");

-- CreateIndex
CREATE INDEX "class_histories_subject_id_academic_year_idx" ON "public"."class_histories"("subject_id", "academic_year");

-- CreateIndex
CREATE INDEX "class_histories_snapshot_date_idx" ON "public"."class_histories"("snapshot_date");

-- CreateIndex
CREATE INDEX "class_histories_academic_year_semester_completion_rate_idx" ON "public"."class_histories"("academic_year", "semester", "completion_rate");

-- CreateIndex
CREATE INDEX "class_histories_search_tags_idx" ON "public"."class_histories"("search_tags");

-- AddForeignKey
ALTER TABLE "public"."class_histories" ADD CONSTRAINT "class_histories_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_histories" ADD CONSTRAINT "class_histories_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "public"."teacher_class_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
