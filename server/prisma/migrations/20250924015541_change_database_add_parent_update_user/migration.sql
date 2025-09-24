/*
  Warnings:

  - You are about to drop the column `parent_name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parent_phone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parent_relation` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "parent_name",
DROP COLUMN "parent_phone",
DROP COLUMN "parent_relation";

-- CreateTable
CREATE TABLE "public"."parents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_parent_links" (
    "id" BIGSERIAL NOT NULL,
    "student_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "relation" TEXT,
    "primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_parent_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_user_id_key" ON "public"."parents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_parent_links_student_id_parent_id_key" ON "public"."student_parent_links"("student_id", "parent_id");

-- AddForeignKey
ALTER TABLE "public"."parents" ADD CONSTRAINT "parents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_parent_links" ADD CONSTRAINT "student_parent_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_parent_links" ADD CONSTRAINT "student_parent_links_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
