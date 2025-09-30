/*
  Warnings:

  - You are about to drop the column `teacherId` on the `classes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "teacherId";
