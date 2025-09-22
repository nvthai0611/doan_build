/*
  Warnings:

  - You are about to drop the column `center_id` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `center_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `center_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `center_id` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `center_id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `center_id` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the `center_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `centers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."alerts" DROP CONSTRAINT "alerts_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."center_users" DROP CONSTRAINT "center_users_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."center_users" DROP CONSTRAINT "center_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rooms" DROP CONSTRAINT "rooms_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_center_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_center_id_fkey";

-- AlterTable
ALTER TABLE "public"."alerts" DROP COLUMN "center_id";

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "center_id";

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "center_id";

-- AlterTable
ALTER TABLE "public"."rooms" DROP COLUMN "center_id",
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "center_id",
ADD COLUMN     "class_name" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "school_id" UUID;

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "center_id";

-- DropTable
DROP TABLE "public"."center_users";

-- DropTable
DROP TABLE "public"."centers";

-- CreateTable
CREATE TABLE "public"."schools" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
