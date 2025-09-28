/*
  Warnings:

  - You are about to drop the column `date_of_birth` on the `students` table. All the data in the column will be lost.
  - The `gender` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `teachers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "date_of_birth",
ADD COLUMN     "birth_date" DATE,
DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."Gender";

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."Gender";
