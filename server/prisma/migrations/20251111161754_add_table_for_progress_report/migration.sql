-- CreateTable
CREATE TABLE "progress_reports" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "teacherId" UUID,
    "classId" UUID,
    "reportType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "periodLabel" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "averageScore" DOUBLE PRECISION,
    "attendanceRate" DOUBLE PRECISION,
    "grade" TEXT,
    "overallComment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_report_items" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "trend" TEXT,
    "comment" TEXT,
    "rank" INTEGER,

    CONSTRAINT "progress_report_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_reports_studentId_idx" ON "progress_reports"("studentId");

-- CreateIndex
CREATE INDEX "progress_reports_teacherId_idx" ON "progress_reports"("teacherId");

-- CreateIndex
CREATE INDEX "progress_report_items_reportId_idx" ON "progress_report_items"("reportId");

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_report_items" ADD CONSTRAINT "progress_report_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "progress_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
