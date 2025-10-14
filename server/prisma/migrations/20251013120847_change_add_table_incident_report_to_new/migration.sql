-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "actionsTaken" TEXT,
    "studentsInvolved" TEXT,
    "witnessesPresent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "class_id" UUID,
    "reported_by" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
