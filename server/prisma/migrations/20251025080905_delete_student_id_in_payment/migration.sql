/*
  Warnings:

  - You are about to drop the column `student_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_student_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "student_id";
