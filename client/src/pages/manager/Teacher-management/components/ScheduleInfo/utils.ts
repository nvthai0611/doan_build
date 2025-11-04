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
  return STATUS_COLORS[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 border-gray-200 dark:border-gray-700"
}

// Student utility functions
export const getStudentStatusText = (status: string): string => {
  return STUDENT_STATUS_TEXT[status] || "Chưa xác định"
}

/**
 * Tính toán text hiển thị cho session status
 * 
 * Logic:
 * 1. Nếu status === "end" -> "Đã kết thúc"
 * 2. Nếu status !== "end":
 *    - Kiểm tra session.date có phải là hôm nay không
 *    - Parse time để lấy endTime (ví dụ: "07:00-08:30" -> "08:30")
 *    - Tạo Date object với session.date + endTime
 *    - So sánh với thời gian hiện tại
 *    - Nếu endTime đã qua -> Tính số giờ đã trôi qua và hiển thị "Đã kết thúc X giờ trước"
 *    - Nếu chưa qua -> Hiển thị status text thông thường
 * 
 * @param session - Session object cần tính toán
 * @returns {string} Text hiển thị cho status
 */
export const getSessionStatusText = (session: TeachingSession): string => {
  // Nếu status là "end", hiển thị "Đã kết thúc"
  if (session.status === "end") {
    return "Đã kết thúc"
  }
  
  // Debug log (có thể xóa sau)
  // console.log('Session status:', session.status, 'Date:', session.date, 'Time:', session.time)

  // Nếu status là "day_off", hiển thị "Nghỉ học"
  if (session.status === "day_off") {
    return "Nghỉ học"
  }

  // Kiểm tra xem session có phải là hôm nay không
  const now = new Date()
  const sessionDate = new Date(session.date)
  
  // Reset time về 00:00:00 để so sánh chỉ ngày
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDateStart = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
  
  // So sánh ngày
  const isToday = todayStart.getTime() === sessionDateStart.getTime()

  // Nếu không phải hôm nay, trả về status text thông thường
  if (!isToday) {
    if (session.status === "happening") {
      return "Đang diễn ra"
    }
    return "Chưa diễn ra"
  }

  // Nếu là hôm nay, kiểm tra xem thời gian kết thúc đã qua chưa
  // Parse time string "07:00-08:30" để lấy endTime "08:30"
  const timeParts = session.time.split("-")
  if (timeParts.length !== 2) {
    // Nếu format không đúng, trả về status text thông thường
    if (session.status === "happening") {
      return "Đang diễn ra"
    }
    return "Chưa diễn ra"
  }

  const endTimeStr = timeParts[1].trim() // "08:30"
  const timeParts2 = endTimeStr.split(":")
  if (timeParts2.length !== 2) {
    // Nếu format không đúng
    if (session.status === "happening") {
      return "Đang diễn ra"
    }
    return "Chưa diễn ra"
  }

  const endHour = parseInt(timeParts2[0], 10)
  const endMinute = parseInt(timeParts2[1], 10)

  // Kiểm tra NaN
  if (isNaN(endHour) || isNaN(endMinute)) {
    if (session.status === "happening") {
      return "Đang diễn ra"
    }
    return "Chưa diễn ra"
  }

  // Tạo Date object với ngày session và thời gian kết thúc
  const endDateTime = new Date(sessionDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)

  // So sánh với thời gian hiện tại
  // Nếu thời gian kết thúc đã qua
  if (endDateTime < now) {
    // Tính số giờ đã trôi qua
    const hoursPassed = Math.floor((now.getTime() - endDateTime.getTime()) / (1000 * 60 * 60))
    
    // Hiển thị "Đã kết thúc X giờ trước"
    if (hoursPassed === 0) {
      // Nếu chưa đến 1 giờ, tính phút
      const minutesPassed = Math.floor((now.getTime() - endDateTime.getTime()) / (1000 * 60))
      if (minutesPassed === 0) {
        return "Đã kết thúc vừa xong"
      }
      return `Đã kết thúc ${minutesPassed} phút trước`
    } else if (hoursPassed === 1) {
      return "Đã kết thúc 1 giờ trước"
    } else {
      return `Đã kết thúc ${hoursPassed} giờ trước`
    }
  }

  // Nếu thời gian kết thúc chưa qua, trả về status text thông thường
  if (session.status === "happening") {
    return "Đang diễn ra"
  }
  return "Chưa diễn ra"
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


