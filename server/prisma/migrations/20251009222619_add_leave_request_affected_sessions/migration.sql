-- CreateTable
CREATE TABLE "leave_request_affected_sessions" (
    "id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "replacement_teacher_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_request_affected_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leave_request_affected_sessions" ADD CONSTRAINT "leave_request_affected_sessions_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_request_affected_sessions" ADD CONSTRAINT "leave_request_affected_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_request_affected_sessions" ADD CONSTRAINT "leave_request_affected_sessions_replacement_teacher_id_fkey" FOREIGN KEY ("replacement_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
