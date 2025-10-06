import { useState, useEffect } from "react"
import { centerOwnerTeacherService } from "../../../../../services/center-owner/teacher-management/teacher.service"
import { TeachingSession, UseTeachingSessionsReturn } from "./types"
import { getMockSessions } from "./utils"

// Hook để gọi API lịch dạy
export const useTeachingSessions = (teacherId: string, year: number, month: number): UseTeachingSessionsReturn => {
  console.log(year, month);
  
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
            id: parseInt(session.id.replace(/-/g, '').substring(0, 8), 16),
            date: new Date(session.date),
            title: session.title,
            time: session.time,
            subject: session.subject,
            class: session.class,
            room: session.room,
            hasAlert: session.hasAlert,
            status: session.status,
            teacher: session.teacher,
            students: session.students || [],
            attendanceWarnings: session.attendanceWarnings || [],
            description: session.description,
            materials: session.materials || []
          }))
          setSessions(formattedSessions)
        } else {
          // Fallback to mock data nếu API không trả về dữ liệu
          setSessions(getMockSessions(year, month))
        }
      } catch (err) {
        console.error('Error fetching schedule:', err)
        // Fallback to mock data khi có lỗi
        setSessions(getMockSessions(year, month))
        setError('Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [teacherId, year, month])

  return { sessions, loading, error }
}
