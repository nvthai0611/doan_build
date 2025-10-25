-- CreateTable
CREATE TABLE "session_requests" (
    "id" UUID NOT NULL,
    "request_type" TEXT NOT NULL,
    "teacher_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "session_date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "room_id" UUID,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_by" UUID NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
