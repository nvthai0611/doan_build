/*
  Warnings:

  - You are about to drop the `teacher_assignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_class_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_teacher_id_fkey";

-- DropTable
DROP TABLE "public"."teacher_assignments";

-- CreateTable
CREATE TABLE "public"."teacher_class_assignments" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "recurring_schedule" JSONB,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "semester" TEXT,
    "academic_year" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_class_assignments_class_id_start_date_key" ON "public"."teacher_class_assignments"("class_id", "start_date");

-- AddForeignKey
ALTER TABLE "public"."teacher_class_assignments" ADD CONSTRAINT "teacher_class_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_class_assignments" ADD CONSTRAINT "teacher_class_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
