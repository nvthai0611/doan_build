/*
  Warnings:

  - A unique constraint covering the columns `[grade_id,subject_id]` on the table `fee_structures` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "fee_amount" DECIMAL(12,2),
ADD COLUMN     "fee_currency" TEXT DEFAULT 'VND',
ADD COLUMN     "fee_locked_at" TIMESTAMPTZ(6),
ADD COLUMN     "fee_period" TEXT;

-- AlterTable
ALTER TABLE "fee_records" ADD COLUMN     "class_id" UUID;

-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN     "grade_id" UUID,
ADD COLUMN     "subject_id" UUID;

-- CreateTable
CREATE TABLE "class_fee_histories" (
    "id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "period" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "reason" TEXT,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,

    CONSTRAINT "class_fee_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_fee_records_class_id" ON "fee_records"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_fee_by_grade_subject" ON "fee_structures"("grade_id", "subject_id");

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_records" ADD CONSTRAINT "fee_records_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_fee_histories" ADD CONSTRAINT "class_fee_histories_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
