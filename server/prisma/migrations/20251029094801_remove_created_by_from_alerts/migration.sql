/*
  Warnings:

  - You are about to drop the column `created_by` on the `alerts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."alerts" DROP CONSTRAINT "alerts_created_by_fkey";

-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "created_by";
