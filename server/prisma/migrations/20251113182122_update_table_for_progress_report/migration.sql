/*
  Warnings:

  - You are about to drop the `progress_report_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."progress_report_items" DROP CONSTRAINT "progress_report_items_reportId_fkey";

-- AlterTable
ALTER TABLE "progress_reports" ADD COLUMN     "trend" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';

-- DropTable
DROP TABLE "public"."progress_report_items";
