/*
  Warnings:

  - You are about to drop the column `discount` on the `fee_records` table. All the data in the column will be lost.
  - You are about to drop the column `paid_amount` on the `fee_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fee_records" DROP COLUMN "discount",
DROP COLUMN "paid_amount",
ADD COLUMN     "scholarship" DECIMAL(12,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "scholarship_id" UUID;

-- CreateTable
CREATE TABLE "scholarships" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percent" DECIMAL(5,2) NOT NULL,
    "criteria" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_scholarship_active" ON "scholarships"("is_active");

-- CreateIndex
CREATE INDEX "idx_student_scholarship" ON "students"("scholarship_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
