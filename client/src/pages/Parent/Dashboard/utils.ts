/**
 * Utility functions for Parent Dashboard components
 */

/**
 * Format date to string in Vietnamese format
 */
export function getDateString(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Get session display name from session data
 */
export function getSessionDisplayName(session: any): string {
  if (!session) return 'N/A'
  
  // If session has class and subject information
  if (session.class?.subject?.name) {
    return `${session.class.subject.name} - ${session.class.name || 'Lớp học'}`
  }
  
  // If session has subject information
  if (session.subject?.name) {
    return session.subject.name
  }
  
  // If session has class name
  if (session.class?.name) {
    return session.class.name
  }
  
  // Fallback to session name or ID
  return session.name || session.id || 'Buổi học'
}

/**
 * Format time string
 */
export function formatTime(timeString: string): string {
  if (!timeString) return 'N/A'
  
  // If time is already in HH:MM format
  if (timeString.includes(':')) {
    return timeString
  }
  
  // If time is in HHMM format, add colon
  if (timeString.length === 4) {
    return `${timeString.slice(0, 2)}:${timeString.slice(2)}`
  }
  
  return timeString
}

/**
 * Get day of week in Vietnamese
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  return days[date.getDay()]
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get start and end of week
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  start.setDate(diff)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  return { start, end }
}

/**
 * Get start and end of month
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  
  return { start, end }
}
