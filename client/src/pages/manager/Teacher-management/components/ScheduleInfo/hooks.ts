import { useState, useEffect } from "react"
import { centerOwnerTeacherService } from "../../../../../services/center-owner/teacher-management/teacher.service"
import { TeachingSession, UseTeachingSessionsReturn } from "./types"

// Hook để gọi API lịch dạy
export const useTeachingSessions = (teacherId: string, year: number, month: number): UseTeachingSessionsReturn => {
  const [sessions, setSessions] = useState<TeachingSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
          if (!teacherId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await centerOwnerTeacherService.getTeacherSchedule(teacherId, year, month)
        
        if (response.data && (response.data as any).sessions) {
          const formattedSessions: TeachingSession[] = (response.data as any).sessions.map((session: any) => ({
            id: session.id, // Giữ nguyên ID từ API (UUID string)
            classId: session.classId, // Lấy classId từ API
            date: new Date(session.date),
            title: session.title,
            time: session.time,
            subject: session.subject,
            class: session.class,
            room: session.room,
            hasAlert: session.hasAlert,
            status: session.status,
            isSubstitute: session.isSubstitute,
            teacher: session.teacher,
            originalTeacher: session.originalTeacher,
            substituteTeacher: session.substituteTeacher,
            students: session.students || [],
            attendanceWarnings: session.attendanceWarnings || [],
            description: session.description,
            materials: session.materials || [],
            cancellationReason: session.cancellationReason
          }))
          setSessions(formattedSessions)
        } else {
          // Không có dữ liệu
          setSessions([])
        }
      } catch (err) {
        console.error('Error fetching schedule:', err)
        setSessions([])
        setError('Không thể tải dữ liệu từ server')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [teacherId, year, month])

  return { sessions, loading, error }
}
