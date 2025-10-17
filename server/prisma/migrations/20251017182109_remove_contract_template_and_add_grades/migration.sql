/*
  Warnings:

  - You are about to drop the column `contract_end_date` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `contract_start_date` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `is_signed` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `review_notes` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_by` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `contract_uploads` table. All the data in the column will be lost.
  - You are about to drop the `contract_expiry_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contract_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."contract_expiry_notifications" DROP CONSTRAINT "contract_expiry_notifications_contract_upload_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contract_expiry_notifications" DROP CONSTRAINT "contract_expiry_notifications_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contract_expiry_notifications" DROP CONSTRAINT "contract_expiry_notifications_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contract_uploads" DROP CONSTRAINT "contract_uploads_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."contract_uploads" DROP CONSTRAINT "contract_uploads_template_id_fkey";

-- AlterTable
ALTER TABLE "public"."contract_uploads" DROP COLUMN "contract_end_date",
DROP COLUMN "contract_start_date",
DROP COLUMN "is_signed",
DROP COLUMN "notes",
DROP COLUMN "review_notes",
DROP COLUMN "reviewed_at",
DROP COLUMN "reviewed_by",
DROP COLUMN "salary",
DROP COLUMN "status",
DROP COLUMN "template_id";

-- DropTable
DROP TABLE "public"."contract_expiry_notifications";

-- DropTable
DROP TABLE "public"."contract_templates";
