/*
  Warnings:

  - Added the required column `file_name` to the `materials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "category" TEXT DEFAULT 'Other',
ADD COLUMN     "file_name" TEXT NOT NULL;
