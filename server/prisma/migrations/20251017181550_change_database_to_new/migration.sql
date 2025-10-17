/*
  Warnings:

  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_grade_id_fkey";

-- DropTable
DROP TABLE "public"."Grade";

-- CreateTable
CREATE TABLE "public"."grades" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grades_level_key" ON "public"."grades"("level");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
