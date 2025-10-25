-- CreateTable
CREATE TABLE "teacher_feedbacks" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "class_id" UUID,
    "student_id" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "categories" JSONB,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_feedback_analyses" (
    "id" UUID NOT NULL,
    "feedback_id" UUID NOT NULL,
    "sentiment_score" DECIMAL(5,2) NOT NULL,
    "sentiment_label" TEXT NOT NULL,
    "toxicity_score" DECIMAL(5,2),
    "key_phrases" JSONB,
    "categorized_issues" JSONB,
    "ai_summary" TEXT,
    "recommended_action" TEXT,
    "confidence_score" DECIMAL(5,2),
    "analyzed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ai_model" TEXT NOT NULL DEFAULT 'gpt-4',
    "processing_time_ms" INTEGER,

    CONSTRAINT "teacher_feedback_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_class_transfers" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "from_class_id" UUID,
    "to_class_id" UUID,
    "replacement_teacher_id" UUID,
    "reason" TEXT NOT NULL,
    "reason_detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "effective_date" DATE,
    "completed_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "feedback_summary" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_class_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_feedback_teacher" ON "teacher_feedbacks"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_feedback_parent" ON "teacher_feedbacks"("parent_id");

-- CreateIndex
CREATE INDEX "idx_feedback_class" ON "teacher_feedbacks"("class_id");

-- CreateIndex
CREATE INDEX "idx_feedback_created" ON "teacher_feedbacks"("created_at");

-- CreateIndex
CREATE INDEX "idx_analysis_feedback" ON "teacher_feedback_analyses"("feedback_id");

-- CreateIndex
CREATE INDEX "idx_analysis_sentiment" ON "teacher_feedback_analyses"("sentiment_label");

-- CreateIndex
CREATE INDEX "idx_analysis_action" ON "teacher_feedback_analyses"("recommended_action");

-- CreateIndex
CREATE INDEX "idx_transfer_teacher" ON "teacher_class_transfers"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_transfer_from_class" ON "teacher_class_transfers"("from_class_id");

-- CreateIndex
CREATE INDEX "idx_transfer_status" ON "teacher_class_transfers"("status");

-- CreateIndex
CREATE INDEX "idx_transfer_effective_date" ON "teacher_class_transfers"("effective_date");

-- AddForeignKey
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedbacks" ADD CONSTRAINT "teacher_feedbacks_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_feedback_analyses" ADD CONSTRAINT "teacher_feedback_analyses_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "teacher_feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_from_class_id_fkey" FOREIGN KEY ("from_class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_to_class_id_fkey" FOREIGN KEY ("to_class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_transfers" ADD CONSTRAINT "teacher_class_transfers_replacement_teacher_id_fkey" FOREIGN KEY ("replacement_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
