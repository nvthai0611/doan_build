/*
  Warnings:

  - A unique constraint covering the columns `[class_id]` on the table `teacher_feedback_analyses` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "teacher_feedback_analyses" ADD COLUMN     "analysis_type" TEXT NOT NULL DEFAULT 'feedback',
ADD COLUMN     "avg_rating" DECIMAL(3,2),
ADD COLUMN     "class_id" UUID,
ADD COLUMN     "feedback_count" INTEGER DEFAULT 0,
ADD COLUMN     "key_insights" JSONB,
ADD COLUMN     "overall_analysis" TEXT,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "sentiment_explanation" TEXT,
ADD COLUMN     "strengths" JSONB,
ADD COLUMN     "weaknesses" JSONB,
ALTER COLUMN "feedback_id" DROP NOT NULL,
ALTER COLUMN "ai_model" SET DEFAULT 'gpt-3.5-turbo';

-- CreateIndex
CREATE INDEX "idx_analysis_class" ON "teacher_feedback_analyses"("class_id");

-- CreateIndex
CREATE INDEX "idx_analysis_type" ON "teacher_feedback_analyses"("analysis_type");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_feedback_analyses_class_id_key" ON "teacher_feedback_analyses"("class_id");

-- AddForeignKey
ALTER TABLE "teacher_feedback_analyses" ADD CONSTRAINT "teacher_feedback_analyses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
