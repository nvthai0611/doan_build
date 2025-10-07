/*
  Warnings:

  - You are about to drop the column `birth_date` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `birth_date` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `contract_end` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `hire_date` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `teachers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "birth_date",
DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "public"."teachers" DROP COLUMN "birth_date",
DROP COLUMN "contract_end",
DROP COLUMN "gender",
DROP COLUMN "hire_date",
DROP COLUMN "salary";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "birth_date" DATE,
ADD COLUMN     "gender" "public"."Gender";
