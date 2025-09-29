import { TeachingSession, Student } from "./types"
import { SUBJECT_COLORS, STATUS_COLORS, STUDENT_STATUS_TEXT } from "./enums"

// Calendar utility functions
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay()
}

export const isToday = (day: number, year: number, month: number): boolean => {
  const today = new Date()
  const dayDate = new Date(year, month, day)
  return today.toDateString() === dayDate.toDateString()
}

// Session utility functions
export const getSessionsForDay = (sessions: TeachingSession[], day: number, year: number, month: number): TeachingSession[] => {
  const dayDate = new Date(year, month, day)
  return sessions.filter(
    (session) =>
      session.date.getDate() === day &&
      session.date.getMonth() === dayDate.getMonth() &&
      session.date.getFullYear() === dayDate.getFullYear(),
  )
}

// Color utility functions
export const getSubjectColor = (subject: string): string => {
  return SUBJECT_COLORS[subject] || "bg-gray-500 text-white"
}

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

// Student utility functions
export const getStudentStatusText = (status: string): string => {
  return STUDENT_STATUS_TEXT[status] || "Chưa xác định"
}

// Week utility functions
export const getWeekDates = (year: number, month: number, weekStart: number = 0): Date[] => {
  const firstDayOfMonth = new Date(year, month, 1)
  const firstDayOfWeek = new Date(firstDayOfMonth)
  firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + weekStart)
  
  const weekDates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(firstDayOfWeek)
    date.setDate(firstDayOfWeek.getDate() + i)
    weekDates.push(date)
  }
  return weekDates
}

export const getSessionsForWeek = (sessions: TeachingSession[], weekDates: Date[]): TeachingSession[] => {
  return sessions.filter(session => {
    const sessionDate = session.date
    return weekDates.some(weekDate => 
      sessionDate.getDate() === weekDate.getDate() &&
      sessionDate.getMonth() === weekDate.getMonth() &&
      sessionDate.getFullYear() === weekDate.getFullYear()
    )
  })
}

export const getSessionsForTimeSlot = (sessions: TeachingSession[], day: Date, hour: number): TeachingSession[] => {
  return sessions.filter(session => {
    const sessionDate = session.date
    const sessionHour = parseInt(session.time.split(':')[0])
    return sessionDate.getDate() === day.getDate() &&
           sessionDate.getMonth() === day.getMonth() &&
           sessionDate.getFullYear() === day.getFullYear() &&
           sessionHour === hour
  })
}

export const formatWeekRange = (weekDates: Date[]): string => {
  const startDate = weekDates[0]
  const endDate = weekDates[6]
  return `${startDate.getDate()} thg ${startDate.getMonth() + 1} - ${endDate.getDate()} thg ${endDate.getMonth() + 1}, ${startDate.getFullYear()}`
}

export const getWeekContainingToday = (): { month: string, year: string } => {
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  
  // Lấy tuần chứa ngày hôm nay
  const weekDates = getWeekDates(todayYear, todayMonth)
  
  // Kiểm tra xem ngày hôm nay có trong tuần này không
  const isTodayInWeek = weekDates.some(date => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
  
  if (isTodayInWeek) {
    return {
      month: (todayMonth + 1).toString(),
      year: todayYear.toString()
    }
  }
  
  // Nếu không, tìm tuần chứa ngày hôm nay
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  return {
    month: (startOfWeek.getMonth() + 1).toString(),
    year: startOfWeek.getFullYear().toString()
  }
}

// Navigation utility functions
export const navigateMonth = (
  direction: "prev" | "next",
  selectedMonth: string,
  selectedYear: string,
  setSelectedMonth: (month: string) => void,
  setSelectedYear: (year: string) => void
): void => {
  const currentMonth = Number.parseInt(selectedMonth)
  const currentYear = Number.parseInt(selectedYear)

  if (direction === "prev") {
    if (currentMonth === 1) {
      setSelectedMonth("12")
      setSelectedYear((currentYear - 1).toString())
    } else {
      setSelectedMonth((currentMonth - 1).toString())
    }
  } else {
    if (currentMonth === 12) {
      setSelectedMonth("1")
      setSelectedYear((currentYear + 1).toString())
    } else {
      setSelectedMonth((currentMonth + 1).toString())
    }
  }
}

export const navigateWeek = (
  direction: "prev" | "next",
  selectedMonth: string,
  selectedYear: string,
  setSelectedMonth: (month: string) => void,
  setSelectedYear: (year: string) => void
): void => {
  const currentMonth = Number.parseInt(selectedMonth)
  const currentYear = Number.parseInt(selectedYear)
  
  // Lấy tuần hiện tại dựa trên tháng/năm
  const weekDates = getWeekDates(currentYear, currentMonth - 1)
  const startOfCurrentWeek = new Date(weekDates[0])
  
  let targetDate: Date
  
  if (direction === "prev") {
    // Lùi 7 ngày từ ngày đầu tuần
    targetDate = new Date(startOfCurrentWeek)
    targetDate.setDate(targetDate.getDate() - 7)
  } else {
    // Tiến 7 ngày từ ngày đầu tuần
    targetDate = new Date(startOfCurrentWeek)
    targetDate.setDate(targetDate.getDate() + 7)
  }
  
  const newMonth = targetDate.getMonth() + 1
  const newYear = targetDate.getFullYear()
  
  setSelectedMonth(newMonth.toString())
  setSelectedYear(newYear.toString())
}

export const navigateDay = (
  direction: "prev" | "next",
  selectedMonth: string,
  selectedYear: string,
  setSelectedMonth: (month: string) => void,
  setSelectedYear: (year: string) => void
): void => {
  const currentMonth = Number.parseInt(selectedMonth)
  const currentYear = Number.parseInt(selectedYear)
  
  // Tạo ngày hiện tại để tính toán
  const currentDate = new Date(currentYear, currentMonth - 1, 1)
  
  if (direction === "prev") {
    // Lùi 1 ngày
    currentDate.setDate(currentDate.getDate() - 1)
  } else {
    // Tiến 1 ngày
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  setSelectedMonth((currentDate.getMonth() + 1).toString())
  setSelectedYear(currentDate.getFullYear().toString())
}

export const goToToday = (
  setSelectedMonth: (month: string) => void,
  setSelectedYear: (year: string) => void,
  setCurrentDate: (date: Date) => void
): void => {
  const today = new Date()
  setSelectedMonth((today.getMonth() + 1).toString())
  setSelectedYear(today.getFullYear().toString())
  setCurrentDate(today)
}

// Mock data generator
export const getMockSessions = (year: number, month: number): TeachingSession[] => {
  const sessions: TeachingSession[] = [
    // Tháng 9/2025 (month = 8)
    {
      id: 1,
      date: new Date(2025, 8, 2),
      title: "Buổi 1",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10A",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "1", name: "Nguyễn Văn A", status: "present" },
        { id: "2", name: "Trần Thị B", status: "absent" },
        { id: "3", name: "Lê Văn C", status: "present" },
      ],
      attendanceWarnings: [
        "*Có 2 học viên chưa điểm danh*",
        "*Có 2 học viên chưa được chấm điểm tiểu chí buổi học*",
        "*Có 1 giáo viên chưa điểm danh*",
      ],
      description: "Phương học: Chưa cập nhật",
      materials: ["Sách giáo khoa Toán 10", "Bài tập thực hành"],
    },
    {
      id: 2,
      date: new Date(2025, 8, 2),
      title: "Buổi 2",
      time: "14:00-16:00",
      subject: "Vật lý",
      class: "11B",
      room: "P102",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "4", name: "Phạm Văn D", status: "present" },
        { id: "5", name: "Hoàng Thị E", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Thí nghiệm vật lý",
    },
    {
      id: 3,
      date: new Date(2025, 8, 3),
      title: "Buổi 3",
      time: "10:00-12:00",
      subject: "Hóa học",
      class: "12A",
      room: "P103",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "6", name: "Vũ Văn F", status: "late" },
        { id: "7", name: "Đỗ Thị G", status: "present" },
        { id: "8", name: "Bùi Văn H", status: "absent" },
      ],
      attendanceWarnings: ["*Có 1 học viên đi muộn*", "*Có 1 học viên vắng mặt*"],
      description: "Phương học: Thí nghiệm hóa học",
    },
    {
      id: 4,
      date: new Date(2025, 8, 4),
      title: "Buổi 2",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10B",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "9", name: "Cao Văn I", status: "present" },
        { id: "10", name: "Lý Thị K", status: "present" },
      ],
      attendanceWarnings: ["*Có 1 giáo viên chưa điểm danh*"],
      description: "Phương học: Chưa cập nhật",
    },
    {
      id: 5,
      date: new Date(2025, 8, 11),
      title: "Buổi 4",
      time: "10:00-12:00",
      subject: "Vật lý",
      class: "11A",
      room: "P102",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "11", name: "Mai Văn L", status: "present" },
        { id: "12", name: "Tô Thị M", status: "present" },
        { id: "13", name: "Hồ Văn N", status: "absent" },
      ],
      attendanceWarnings: ["*Có 1 học viên vắng mặt*"],
      description: "Phương học: Lý thuyết và thực hành",
    },
    {
      id: 6,
      date: new Date(2025, 8, 18),
      title: "Buổi 5",
      time: "14:00-16:00",
      subject: "Tiếng Anh",
      class: "12B",
      room: "P104",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "14", name: "Đinh Văn O", status: "present" },
        { id: "15", name: "Võ Thị P", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Giao tiếp tiếng Anh",
    },
    {
      id: 7,
      date: new Date(2025, 8, 23),
      title: "Buổi 6",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10B",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "16", name: "Phan Văn Q", status: "present" },
        { id: "17", name: "Dương Thị R", status: "late" },
      ],
      attendanceWarnings: ["*Có 1 học viên đi muộn*"],
      description: "Phương học: Giải bài tập nâng cao",
    },
    {
      id: 8,
      date: new Date(2025, 8, 25),
      title: "Buổi 7",
      time: "10:00-12:00",
      subject: "Vật lý",
      class: "11A",
      room: "P102",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "18", name: "Lương Văn S", status: "present" },
        { id: "19", name: "Chu Thị T", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Ôn tập kiểm tra",
    },
    {
      id: 9,
      date: new Date(2025, 8, 30),
      title: "Buổi 8",
      time: "14:00-16:00",
      subject: "Hóa học",
      class: "12A",
      room: "P103",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "20", name: "Trịnh Văn U", status: "present" },
        { id: "21", name: "Đặng Thị V", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Thí nghiệm tổng hợp",
    },
  ]

  return sessions.filter((session) => session.date.getFullYear() === year && session.date.getMonth() === month)
}
