// View types
export type ViewType = "month" | "week" | "day" | "list"

// Session status
export type SessionStatus = "happening" | "end" | "has_not_happened" | "day_off" | "teacher_absent" | "postponed"

// Student status
export type StudentStatus = "present" | "absent" | "late"

// Month names
export const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2", 
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
] as const

// Day names
export const DAY_NAMES = [
  "Chủ Nhật",
  "Thứ Hai", 
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy"
] as const

// Subject colors mapping
export const SUBJECT_COLORS: { [key: string]: string } = {
  "Toán học": "bg-purple-500 text-white",
  "Vật lý": "bg-blue-500 text-white", 
  "Hóa học": "bg-green-500 text-white",
  "Tiếng Anh": "bg-yellow-500 text-white",
  "Ngữ văn": "bg-pink-500 text-white",
} as const

// Status colors mapping
export const STATUS_COLORS: { [key: string]: string } = {
  "end": "bg-green-100 text-green-800 border-green-200",
  "postponed": "bg-red-100 text-red-800 border-red-200", 
  "happening": "bg-blue-100 text-blue-800 border-blue-200",
} as const

// Student status text mapping
export const STUDENT_STATUS_TEXT: { [key: string]: string } = {
  "present": "Có mặt",
  "absent": "Vắng mặt",
  "late": "Đi muộn",
} as const

// Available years
export const AVAILABLE_YEARS = [2024, 2025, 2026] as const
