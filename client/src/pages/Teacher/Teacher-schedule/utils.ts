// Types cho Teacher Schedule
export interface ScheduleData {
  id: string
  date: string
  startTime: string
  endTime: string
  subject: string
  className: string
  room: string
  studentCount: number
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  type: "regular" | "exam" | "makeup"
  teacherId: string
  createdAt: string
  updatedAt: string
}

export interface ScheduleFilters {
  status?: string
  fromDate?: string
  toDate?: string
  search?: string
  type?: string
}


// Utility functions
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

export const formatTime = (timeString: string): string => {
  return timeString
}

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getTypeBadgeClass = (type: string): string => {
  switch (type) {
    case "regular":
      return "bg-gray-100 text-gray-800"
    case "exam":
      return "bg-orange-100 text-orange-800"
    case "makeup":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}


export const filterSchedules = (
  schedules: ScheduleData[],
  filters: ScheduleFilters
): ScheduleData[] => {
  let filtered = [...schedules]

  // Filter by status
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(schedule => schedule.status === filters.status)
  }

  // Filter by type
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter(schedule => schedule.type === filters.type)
  }

  // Filter by date range
  if (filters.fromDate) {
    filtered = filtered.filter(schedule => schedule.date >= filters.fromDate!)
  }
  if (filters.toDate) {
    filtered = filtered.filter(schedule => schedule.date <= filters.toDate!)
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(schedule =>
      schedule.subject.toLowerCase().includes(searchLower) ||
      schedule.className.toLowerCase().includes(searchLower) ||
      schedule.room.toLowerCase().includes(searchLower) ||
      (schedule.notes && schedule.notes.toLowerCase().includes(searchLower))
    )
  }

  return filtered
}
