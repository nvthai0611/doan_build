import { useState, useEffect } from 'react'
import { classService } from '../../../../../services/center-owner/class-management/class.service'
import { Class, ClassStats, GetClassesParams } from '../../../../../services/center-owner/class-management/class.types'

export interface UseTeacherClassesReturn {
  classes: Class[]
  stats: ClassStats | null
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  refetch: () => void
}

export const useTeacherClasses = (
  teacherId: string,
  status: string = 'all',
  search: string = '',
  page: number = 1,
  limit: number = 10
): UseTeacherClassesReturn => {
  const [classes, setClasses] = useState<Class[]>([])
  const [stats, setStats] = useState<ClassStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchClasses = async () => {
    if (!teacherId) return
    setLoading(true)
    setError(null)
    try {
      const params: GetClassesParams = {
        teacherId,
        status,
        search,
        page,
        limit
      }

      const response = await classService.getTeacherClasses(params)
      setClasses(response.data)
      // setStats(response.stats)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Không thể tải danh sách lớp học')
      
      // Fallback to mock data
      setClasses(getMockClasses(teacherId, status, search))
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchClasses()
  }

  useEffect(() => {
    fetchClasses()
  }, [teacherId, status, search, page, limit])

  return {
    classes,
    stats,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch
  }
}

// Mock data fallback
const getMockClasses = (teacherId: string, status: string, search: string): Class[] => {
  const allClasses: Class[] = [
    {
      id: 1,
      name: "Lớp Toán 12A1",
      subject: "Toán học",
      students: 25,
      schedule: "T2, T4, T6 - 19:00-21:00",
      status: "active",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      room: "Phòng 101",
      description: "Lớp học toán nâng cao cho học sinh lớp 12",
      teacherId
    },
    {
      id: 2,
      name: "Lớp Lý 11B2",
      subject: "Vật lý",
      students: 20,
      schedule: "T3, T5 - 18:00-20:00",
      status: "active",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      room: "Phòng 102",
      description: "Lớp học vật lý cơ bản cho học sinh lớp 11",
      teacherId
    },
    {
      id: 3,
      name: "Lớp Hóa 10C1",
      subject: "Hóa học",
      students: 18,
      schedule: "T2, T6 - 17:00-19:00",
      status: "completed",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      room: "Phòng 103",
      description: "Lớp học hóa học cho học sinh lớp 10",
      teacherId
    },
    {
      id: 4,
      name: "Lớp Toán 9D1",
      subject: "Toán học",
      students: 22,
      schedule: "T3, T7 - 19:30-21:30",
      status: "pending",
      startDate: "2024-10-01",
      endDate: "2025-01-31",
      room: "Phòng 104",
      description: "Lớp học toán cho học sinh lớp 9",
      teacherId
    }
  ]

  let filteredClasses = allClasses

  // Filter by status
  if (status !== "all") {
    filteredClasses = filteredClasses.filter(cls => cls.status === status)
  }

  // Filter by search
  if (search) {
    filteredClasses = filteredClasses.filter(cls =>
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.subject.toLowerCase().includes(search.toLowerCase()) ||
      cls.room.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filteredClasses
}

const getMockStats = (): ClassStats => ({
  totalClasses: 4,
  totalStudents: 85,
  activeClasses: 2,
  completedClasses: 1,
  pendingClasses: 1
})
