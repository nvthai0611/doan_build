"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Loading from "../../../../../components/Loading/LoadingPage"

// Import từ các file đã tách
import { ScheduleTabProps, TeachingSession } from "./types"
import { ViewType, MONTH_NAMES, DAY_NAMES } from "./enums"
import { 
  getDaysInMonth, 
  getFirstDayOfMonth, 
  isToday, 
  getSessionsForDay, 
  getSubjectColor, 
  getStatusColor, 
  getStudentStatusText,
  navigateMonth,
  navigateWeek,
  navigateDay,
  goToToday,
  getWeekDates,
  getSessionsForWeek,
  getSessionsForTimeSlot,
  formatWeekRange,
  getWeekContainingToday
} from "./utils"
import { useTeachingSessions } from "./hooks"

/**
 * ===== GIẢI THÍCH CÁCH COMPONENT HOẠT ĐỘNG =====
 * 
 * 1. DATA FLOW (Luồng dữ liệu):
 *    - useTeachingSessions hook gọi API centerOwnerTeacherService.getTeacherSchedule(teacherId, year, month)
 *    - API trả về danh sách sessions (buổi dạy) của giáo viên trong tháng
 *    - Mỗi session có: id, date, title, time, subject, class, room, teacher, students[], attendanceWarnings[]
 *    - Data được lưu vào state sessions: TeachingSession[]
 * 
 * 2. RENDER LOGIC (Logic hiển thị):
 *    Component có 4 chế độ xem (ViewType):
 *    
 *    a) MONTH VIEW (Xem theo tháng):
 *       - Tạo lịch dạng lưới 7 cột (7 ngày trong tuần) x số hàng (số tuần trong tháng)
 *       - Tính số ngày trong tháng: getDaysInMonth(year, month) -> ví dụ: 30 ngày
 *       - Tính ngày đầu tiên rơi vào thứ mấy: getFirstDayOfMonth(year, month) -> ví dụ: thứ 3 (số 2)
 *       - Tạo emptyDays[] để fill các ô trống ở đầu (từ Chủ Nhật đến ngày đầu tiên)
 *       - Mỗi ngày hiển thị sessions của ngày đó: getSessionsForDay(sessions, day, year, month)
 *       - Sessions được filter: session.date.getDate() === day && session.date.getMonth() === month
 *    
 *    b) WEEK VIEW (Xem theo tuần):
 *       - Tạo lưới 8 cột (1 cột giờ + 7 cột cho 7 ngày) x 24 hàng (24 giờ trong ngày)
 *       - Tạo weekDates[]: mảng 7 ngày trong tuần dựa trên currentWeekDate
 *       - startOfWeek = currentWeekDate - currentWeekDate.getDay() (lấy Chủ Nhật đầu tuần)
 *       - Với mỗi ô (hour, day), filter sessions: getSessionsForTimeSlot(sessions, day, hour)
 *       - Filter dựa vào: session.date === day && session.time.startsWith(hour)
 *    
 *    c) DAY VIEW (Xem theo ngày):
 *       - Chưa implement, hiện placeholder
 *    
 *    d) LIST VIEW (Xem danh sách):
 *       - Hiển thị tất cả sessions trong tháng dạng list
 *       - Không có filter theo ngày, chỉ hiển thị thông tin tóm tắt
 * 
 * 3. CALCULATION (Tính toán):
 *    - Tháng trong JavaScript: 0-11 (0 = January, 11 = December)
 *    - selectedMonth từ UI: "1"-"12" (string)
 *    - Khi tính toán: month - 1 (ví dụ: tháng 9 UI -> month 8 trong JS)
 *    - firstDay: 0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7
 *    - Ví dụ: Tháng 9/2025 bắt đầu từ thứ 2 (firstDay = 1)
 *      -> Cần 1 ô trống (Chủ Nhật) trước ngày 1
 * 
 * 4. NAVIGATION (Điều hướng):
 *    - Prev/Next buttons: Chuyển tháng/tuần/ngày dựa theo viewType
 *    - "Hôm nay" button: Về tháng/tuần/ngày hiện tại
 *    - Khi chuyển tháng: cập nhật selectedMonth, selectedYear
 *    - Khi chuyển tuần: cập nhật currentWeekDate, sau đó cập nhật selectedMonth, selectedYear
 */




/**
 * Component ScheduleTab - Hiển thị lịch dạy của giáo viên
 * 
 * Props:
 * @param {string} teacherId - ID của giáo viên cần xem lịch
 * @param {Date} currentDate - Ngày hiện tại đang xem
 * @param {string} selectedMonth - Tháng đang chọn (format: "1"-"12")
 * @param {string} selectedYear - Năm đang chọn (format: "2024", "2025")
 * @param {Function} setCurrentDate - Function để cập nhật ngày hiện tại
 * @param {Function} setSelectedMonth - Function để cập nhật tháng đang chọn
 * @param {Function} setSelectedYear - Function để cập nhật năm đang chọn
 * 
 * Returns: JSX Element - Render lịch dạy với 4 chế độ xem: tháng, tuần, ngày, danh sách
 */
export default function ScheduleTab({
  teacherId,
  currentDate,
  selectedMonth,
  selectedYear,
  setCurrentDate,
  setSelectedMonth,
  setSelectedYear,
}: ScheduleTabProps) {
  // State quản lý session đang được chọn để hiển thị trong dialog chi tiết
  const [selectedSession, setSelectedSession] = useState<TeachingSession | null>(null)
  
  // State quản lý trạng thái mở/đóng của dialog chi tiết session
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // State quản lý chế độ xem: "month" | "week" | "day" | "list"
  const [viewType, setViewType] = useState<ViewType>("month")
  
  // State quản lý ngày hiện tại của tuần đang xem (chỉ dùng cho week view)
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date())

  /**
   * Xử lý thay đổi chế độ xem (month/week/day/list)
   * Đặc biệt: Khi chuyển sang week view, reset về tuần hiện tại
   */
  const handleViewTypeChange = (newViewType: ViewType) => {
    setViewType(newViewType)
    
    // Khi chuyển sang chế độ tuần, hiển thị tuần có ngày hôm nay
    if (newViewType === "week") {
      setCurrentWeekDate(new Date())
    }
  }
  
  /**
   * Custom hook fetch dữ liệu lịch dạy từ API
   * 
   * Gọi API: centerOwnerTeacherService.getTeacherSchedule(teacherId, year, month)
   * 
   * Returns:
   * @returns {TeachingSession[]} sessions - Mảng các buổi dạy trong tháng
   * @returns {boolean} loading - Trạng thái đang load
   * @returns {string|null} error - Thông báo lỗi (nếu có)
   * 
   * Auto re-fetch khi teacherId, year, hoặc month thay đổi
   */
  const { sessions, loading, error } = useTeachingSessions(
    teacherId, 
    Number.parseInt(selectedYear), 
    Number.parseInt(selectedMonth) 
  )

  /**
   * Tính toán số ngày trong tháng đang xem
   * 
   * Ví dụ: Tháng 9/2025 có 30 ngày -> daysInMonth = 30
   * 
   * Note: Phải -1 vì JavaScript month bắt đầu từ 0
   */
  const daysInMonth = getDaysInMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  
  /**
   * Tính toán ngày đầu tiên của tháng rơi vào thứ mấy
   * 
   * Returns: 0-6 (0 = Chủ Nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
   * 
   * Ví dụ: 1/9/2025 rơi vào Thứ 2 -> firstDay = 1
   * 
   * Dùng để tính số ô trống cần thêm ở đầu lịch
   */
  const firstDay = getFirstDayOfMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  
  /**
   * Tạo mảng các ngày trong tháng [1, 2, 3, ..., 30]
   * 
   * Dùng để render các ô ngày trong calendar grid
   */
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  /**
   * Tạo mảng các ô trống ở đầu calendar
   * 
   * Ví dụ: Nếu ngày 1 rơi vào Thứ 2 (firstDay = 1)
   * -> Cần 1 ô trống (Chủ Nhật) -> emptyDays = [0]
   * 
   * Dùng để align ngày 1 đúng vị trí thứ trong tuần
   */
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  /**
   * Xử lý khi user click vào một session
   * 
   * @param {TeachingSession} session - Session được click
   * @returns void
   * 
   * Action: Lưu session vào state và mở dialog để hiển thị chi tiết
   */
  const handleSessionClick = (session: TeachingSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true)
  }

  /**
   * Lấy icon tương ứng với trạng thái điểm danh của học viên
   * 
   * @param {string} status - Trạng thái: "present" | "absent" | "late"
   * @returns {JSX.Element|null} Icon component hoặc null
   * 
   * Mapping:
   * - "present" -> CheckCircle màu xanh
   * - "absent" -> XCircle màu đỏ
   * - "late" -> Clock màu vàng
   */
  const getStudentStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  /**
   * Xử lý navigation (Prev/Next buttons)
   * 
   * @param {("prev" | "next")} direction - Hướng di chuyển
   * @returns void
   * 
   * Logic:
   * - Month view: Chuyển sang tháng trước/sau (navigateMonth)
   * - Week view: Lùi/tiến 7 ngày từ currentWeekDate
   *   + Cập nhật currentWeekDate
   *   + Cập nhật selectedMonth, selectedYear theo tuần mới
   * - Day view: Chuyển sang ngày trước/sau (navigateDay)
   * - List view: Giống month view
   */
  const handleNavigation = (direction: "prev" | "next") => {
    switch (viewType) {
      case "month":
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      case "week":
        // Navigation cho tuần sử dụng currentWeekDate
        const newWeekDate = new Date(currentWeekDate)
        if (direction === "prev") {
          newWeekDate.setDate(newWeekDate.getDate() - 7)
        } else {
          newWeekDate.setDate(newWeekDate.getDate() + 7)
        }
        setCurrentWeekDate(newWeekDate)
        setSelectedMonth((newWeekDate.getMonth() + 1).toString())
        setSelectedYear(newWeekDate.getFullYear().toString())
        break
      case "day":
        navigateDay(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      case "list":
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      default:
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
    }
  }

  /**
   * Lấy thông tin hiển thị ở header dựa vào viewType
   * 
   * @returns {string} Text hiển thị ở header
   * 
   * Format:
   * - Month: "Tháng 9, 2025"
   * - Week: "2 thg 9 - 8 thg 9, 2025" (từ ngày đầu tuần đến cuối tuần)
   * - Day: "Thứ Hai, 1 tháng 9, 2025"
   * - List: "Tháng 9, 2025"
   * 
   * Week calculation:
   * - startOfWeek = currentWeekDate - currentWeekDate.getDay() (lấy Chủ Nhật đầu tuần)
   * - Tạo mảng 7 ngày từ startOfWeek
   * - Format: formatWeekRange(weekDates)
   */
  const getDisplayInfo = () => {
    switch (viewType) {
      case "month":
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
      case "week":
        // Tạo tuần dựa trên currentWeekDate
        const startOfWeek = new Date(currentWeekDate)
        startOfWeek.setDate(currentWeekDate.getDate() - currentWeekDate.getDay())
        
        const weekDates: Date[] = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)
          weekDates.push(date)
        }
        return formatWeekRange(weekDates)
      case "day":
        const currentDate = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1, 1);
        return currentDate.toLocaleDateString("vi-VN", { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case "list":
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
      default:
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
    }
  }

  /**
   * Router function để render view tương ứng với viewType
   * 
   * @returns {JSX.Element} Component view tương ứng
   * 
   * Routing:
   * - "month" -> renderMonthView() - Lịch dạng tháng (calendar grid)
   * - "week" -> renderWeekView() - Lịch dạng tuần (time grid)
   * - "day" -> renderDayView() - Lịch dạng ngày (chưa implement)
   * - "list" -> renderListView() - Danh sách sessions
   */
  const renderView = () => {
    switch (viewType) {
      case "month":
        return renderMonthView()
      case "week":
        return renderWeekView()
      case "day":
        return renderDayView()
      case "list":
        return renderListView()
      default:
        return renderMonthView()
    }
  }

  /**
   * Render Month View - Hiển thị lịch dạng tháng (calendar grid)
   * 
   * @returns {JSX.Element} Calendar grid với các sessions
   * 
   * Cấu trúc:
   * - Grid 7 cột (7 ngày trong tuần: CN, T2, T3, T4, T5, T6, T7)
   * - Row 1: Header với tên các ngày trong tuần (DAY_NAMES)
   * - Row 2+: Các ngày trong tháng
   * 
   * Logic render:
   * 1. Render emptyDays[] - Các ô trống ở đầu (align ngày 1 đúng thứ)
   *    Ví dụ: Nếu ngày 1 là Thứ 3, cần 2 ô trống (CN, T2)
   * 
   * 2. Render days[] - Các ngày trong tháng (1, 2, 3, ..., 30)
   *    Với mỗi ngày:
   *    - Lấy daySessions = getSessionsForDay(sessions, day, year, month)
   *      + Filter các sessions có date.getDate() === day
   *    - Check isCurrentDay = isToday(day, year, month)
   *      + Highlight ngày hôm nay với màu blue
   *    - Hiển thị tối đa 3 sessions đầu tiên
   *    - Nếu có > 3 sessions, hiển thị "+X buổi khác"
   *    - Mỗi session hiển thị: title, time, subject (với màu tương ứng)
   *    - Click vào session -> handleSessionClick() -> Mở dialog chi tiết
   * 
   * 3. Alerts:
   *    - Nếu session có hasAlert = true, hiển thị icon AlertTriangle
   *    - Nếu ngày có > 1 session, hiển thị badge với số lượng
   */
  const renderMonthView = () => (
    <Card>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAY_NAMES.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
              {day}
            </div>
          ))}

          {/* Empty days for first week */}
          {emptyDays.map((day) => (
            <div key={`empty-${day}`} className="p-2 min-h-[120px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const daySessions = getSessionsForDay(sessions, day, Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
            const isCurrentDay = isToday(day, Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
            const hasMultipleSessions = daySessions.length > 1
            const hasHoliday = daySessions.some(s => s.status === 'day_off')

            return (
              <div
                key={day}
                className={`p-2 min-h-[120px] border transition-colors ${
                  hasHoliday 
                    ? "bg-orange-50/50 border-orange-200 dark:bg-orange-950/20" 
                    : isCurrentDay 
                      ? "bg-blue-50 border-blue-300" 
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                } ${!hasHoliday && "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium ${
                        hasHoliday
                          ? "text-orange-600 font-bold"
                          : isCurrentDay 
                            ? "text-blue-600 bg-blue-100 px-2 py-1 rounded-full" 
                            : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {day}
                    </span>
                    {hasHoliday && <span className="text-xs">🏖️</span>}
                  </div>
                  <div className="flex items-center space-x-1">
                    {daySessions.some((s) => s.hasAlert) && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                    {hasMultipleSessions && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {daySessions.length}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {daySessions.slice(0, 3).map((session) => {
                    const isDayOff = session.status === 'day_off';
                    return (
                      <div
                        key={session.id}
                        className={`text-xs p-2 rounded transition-all ${
                          isDayOff 
                            ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 text-orange-800 shadow-sm' 
                            : `${getSubjectColor(session.subject)} cursor-pointer hover:opacity-80`
                        }`}
                        title={isDayOff ? `Nghỉ lễ${session.cancellationReason ? `: ${session.cancellationReason}` : ''}` : `${session.title} - ${session.time} - ${session.room}`}
                        onClick={() => !isDayOff && handleSessionClick(session)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate flex items-center gap-1">
                            {isDayOff && <span className="text-base">🏖️</span>}
                            <span>{isDayOff ? 'Nghỉ lễ' : session.title}</span>
                          </span>
                          {session.hasAlert && !isDayOff && <AlertTriangle className="w-3 h-3 text-orange-300" />}
                        </div>
                        <div className="text-xs opacity-90 truncate mt-0.5">
                          {isDayOff ? (session.cancellationReason || 'Ngày nghỉ') : session.time}
                        </div>
                      </div>
                    );
                  })}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">+{daySessions.length - 3} buổi khác</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  /**
   * Render Week View - Hiển thị lịch dạng tuần (time grid)
   * Cấu trúc:
   * - Grid 8 cột x 24 hàng
   *   + Cột 1: Giờ (0 giờ, 1 giờ, ..., 23 giờ)
   *   + Cột 2-8: 7 ngày trong tuần (CN, T2, T3, T4, T5, T6, T7)
   *   + 24 hàng: 24 giờ trong ngày (0-23)
   * 
   * Logic calculation:
   * 1. Tạo weekDates[]:
   *    - startOfWeek = currentWeekDate - currentWeekDate.getDay()
   *      + getDay() trả về: 0 (CN), 1 (T2), ..., 6 (T7)
   *      + Ví dụ: Nếu currentWeekDate = 9/9/2025 (Thứ 3), getDay() = 2
   *      + startOfWeek = 9/9 - 2 = 7/9/2025 (Chủ Nhật)
   *    - Tạo mảng 7 ngày: [7/9, 8/9, 9/9, 10/9, 11/9, 12/9, 13/9]
   * 
   * 2. Filter sessions:
   *    - weekSessions = getSessionsForWeek(sessions, weekDates)
   *      + Filter các sessions có date nằm trong weekDates[]
   * 
   * 3. Render grid:
   *    - Với mỗi ô (hour, day):
   *      + hourSessions = getSessionsForTimeSlot(weekSessions, day, hour)
   *      + Filter các sessions có:
   *        * session.date === day
   *        * session.time bắt đầu với hour (ví dụ: "08:00-10:00" -> hour = 8)
   *      + Hiển thị sessions trong ô (absolute position để overlap nếu có nhiều sessions)
   *      + Click vào session -> handleSessionClick() -> Mở dialog chi tiết
   * 
   * 4. Style:
   *    - Mỗi session có màu tương ứng với subject (getSubjectColor)
   *    - Sessions được position absolute với top offset để tránh overlap
   */
  const renderWeekView = () => {
    // Tạo tuần dựa trên currentWeekDate
    const startOfWeek = new Date(currentWeekDate)
    startOfWeek.setDate(currentWeekDate.getDate() - currentWeekDate.getDay())
    
    const weekDates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    
    const weekSessions = getSessionsForWeek(sessions, weekDates)
    const timeSlots = Array.from({ length: 24 }, (_, i) => i) // 0-23 hours

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          {/* Time column header */}
          <div className="bg-gray-50 dark:bg-gray-900 p-2 border-r border-b">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Giờ</div>
          </div>
          
          {/* Day headers */}
          {weekDates.map((date, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 border-b">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                {DAY_NAMES[date.getDay()]}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Time slots and sessions */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time slot label */}
              <div className="bg-gray-50 dark:bg-gray-900 p-2 border-r border-b text-xs text-gray-500 dark:text-gray-400 text-center">
                {hour.toString().padStart(2, '0')} giờ
              </div>
              
              {/* Day columns for this hour */}
              {weekDates.map((date, dayIndex) => {
                const hourSessions = getSessionsForTimeSlot(weekSessions, date, hour)
                
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="min-h-[60px] border-b border-r bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 transition-colors relative"
                  >
                    {hourSessions.map((session, sessionIndex) => {
                      const isDayOff = session.status === 'day_off';
                      return (
                        <div
                          key={session.id}
                          className={`absolute inset-1 rounded text-xs p-1 transition-all ${
                            isDayOff 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 text-orange-800 shadow-sm' 
                              : `${getSubjectColor(session.subject)} cursor-pointer hover:opacity-80`
                          }`}
                          title={isDayOff ? `Nghỉ lễ${session.cancellationReason ? `: ${session.cancellationReason}` : ''}` : `${session.title} - ${session.time} - ${session.room}`}
                          onClick={() => !isDayOff && handleSessionClick(session)}
                          style={{
                            top: `${sessionIndex * 20}px`,
                            height: '36px',
                            fontSize: '12px'
                          }}
                        >
                          <div className="truncate font-medium flex items-center gap-0.5">
                            {isDayOff && <span>🏖️</span>}
                            <span>{isDayOff ? 'Nghỉ lễ' : session.title}</span>
                          </div>
                          <div className="truncate opacity-90 text-[10px]">
                            {isDayOff ? (session.cancellationReason || 'Ngày nghỉ') : session.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Render Day View - Hiển thị lịch dạng ngày (chưa implement)
   * TODO: Implement day view
   * - Hiển thị chi tiết các sessions trong 1 ngày cụ thể
   * - Có thể hiển thị dạng timeline với giờ cụ thể
   * - Cho phép xem chi tiết từng session
   */
  const renderDayView = () => (
    <Card>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Mai rồi tao làm</p>
        </div>
      </CardContent>
    </Card>
  )

  /**
   * Render List View - Hiển thị danh sách các sessions
   * Cấu trúc:
   * - Header: Tiêu đề với tháng/năm + button "Thêm buổi dạy"
   * - Body: Danh sách các sessions (không filter theo ngày)
   * 
   * Logic render:
   * 1. Nếu sessions.length === 0:
   *    - Hiển thị empty state với icon CalendarDays
   *    - Message: "Không có buổi dạy nào trong tháng này"
   * 
   * 2. Nếu có sessions:
   *    - Render mỗi session dạng card ngang với thông tin:
   *      + Ngày: session.date.toLocaleDateString("vi-VN")
   *      + Subject: Badge với màu tương ứng (getSubjectColor)
   *      + Title: Tên buổi học
   *      + Time: Giờ bắt đầu - kết thúc (với icon Clock)
   *      + Room: Phòng học (với icon MapPin)
   *      + Status: Badge với trạng thái (completed/cancelled/scheduled)
   *      + Alert: Icon AlertTriangle nếu hasAlert = true
   *    - Click vào session -> handleSessionClick() -> Mở dialog chi tiết
   * 
   * 3. Style:
   *    - Hover: shadow-md để highlight
   *    - Cursor pointer để indicate clickable
   */
  const renderListView = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Danh sách buổi dạy - {MONTH_NAMES[Number.parseInt(selectedMonth) - 1]} {selectedYear}
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm buổi dạy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Không có buổi dạy nào trong tháng này</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800"
                onClick={() => handleSessionClick(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium">{session.date.toLocaleDateString("vi-VN")}</span>
                    </div>
                    <Badge className={`${getSubjectColor(session.subject)} px-2 py-1`}>{session.subject}</Badge>
                    <span className="text-sm font-medium">{session.title}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {session.time}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {session.room}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.hasAlert && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      <Badge
                        variant={session.status === "end" ? "default" : session.status === "day_off" ? "outline" : "secondary"}
                        className={getStatusColor(session.status)}
                      >
                        {session.status === "end"
                          ? "Hoàn thành"
                          : session.status === "day_off"
                            ? "Nghỉ học"
                            : session.status === "happening"
                              ? "Đang diễn ra"
                              : "Chưa diễn ra"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  /**
   * ===== LOADING STATE =====
   */
  if (loading) {
    return (
      <Loading />
    )
  }

  /**
   * ===== ERROR STATE =====
   * Khi có lỗi fetch data từ API (error !== null)
   * 
   * Fallback behavior:
   * - Hiển thị notification màu orange với message lỗi
   * - Vẫn hiển thị calendar UI (với data mock nếu có)
   * - User vẫn có thể interact với calendar bình thường
   * 
   * Note: useTeachingSessions hook tự động fallback về mock data khi có lỗi
   */
  if (error) {
    return (
      <div className="space-y-6">
        {/* Error notification */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-orange-700 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Calendar với dữ liệu fallback */}
        <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Lịch dạy</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={viewType} onValueChange={handleViewTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToToday(setSelectedMonth, setSelectedYear, setCurrentDate)}>
                Hôm nay
              </Button>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          {renderView()}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selectedSession.title}</DialogTitle>
                  <Badge className={`${getSubjectColor(selectedSession.subject)} px-3 py-1`}>
                    {selectedSession.subject}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedSession.class} - {selectedSession.room}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Ngày diễn ra:</strong> {selectedSession.date.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Thời gian bắt đầu:</strong> {selectedSession.time.split("-")[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Thời gian kết thúc:</strong> {selectedSession.time.split("-")[1]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Giáo viên phụ trách:</strong> {selectedSession.teacher}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedSession.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả buổi học:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSession.description}</p>
                  </div>
                )}

                {/* Students */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Học viên ({selectedSession.students.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSession.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStudentStatusIcon(student.status)}
                          <span className="text-xs text-gray-600 dark:text-gray-300">{getStudentStatusText(student.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {selectedSession.attendanceWarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cảnh báo điểm danh
                    </h4>
                    <div className="space-y-2">
                      {selectedSession.attendanceWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-orange-700">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Vào lớp
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Vào buổi</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

        </div>
      </div>
    )
  }

  /**
   * ===== NORMAL STATE (SUCCESS) =====
   * 
   * Khi fetch data thành công (loading = false && error = null)
   * 
   * @returns {JSX.Element} Full calendar UI với các controls
   * 
   * Cấu trúc:
   * 1. Calendar Header Card:
   *    - Title: "Lịch dạy"
   *    - Controls:
   *      + Select: Chọn view type (Tháng/Tuần/Ngày/Danh sách)
   *      + Prev button: Chuyển sang tháng/tuần/ngày trước
   *      + Next button: Chuyển sang tháng/tuần/ngày sau
   *      + "Hôm nay" button: Về tháng/tuần/ngày hiện tại
   *    - Display info: Hiển thị thông tin tháng/tuần/ngày đang xem
   *    - View content: Render view tương ứng (renderView())
   * 
   * 2. Session Details Dialog:
   *    - Mở khi user click vào session
   *    - Hiển thị thông tin chi tiết:
   *      + Header: title, subject badge, class, room
   *      + Session info: Ngày, thời gian bắt đầu/kết thúc, giáo viên
   *      + Description: Mô tả buổi học (nếu có)
   *      + Students list: Danh sách học viên với avatar và trạng thái điểm danh
   *        * Avatar với fallback (initials)
   *        * Status icon: CheckCircle (có mặt), XCircle (vắng), Clock (muộn)
   *      + Attendance warnings: Cảnh báo điểm danh (nếu có)
   *        * Background màu orange để highlight
   *      + Action buttons: "Vào lớp", "Vào buổi"
   */
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Lịch dạy</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={viewType} onValueChange={handleViewTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToToday(setSelectedMonth, setSelectedYear, setCurrentDate)}>
                Hôm nay
              </Button>
              {/* <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            {getDisplayInfo()}
          </div>
        </CardHeader>
        <CardContent>
          {renderView()}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selectedSession.title}</DialogTitle>
                  <Badge className={`${getSubjectColor(selectedSession.subject)} px-3 py-1`}>
                    {selectedSession.subject}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedSession.class} - {selectedSession.room}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Ngày diễn ra:</strong> {selectedSession.date.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Thời gian bắt đầu:</strong> {selectedSession.time.split("-")[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Thời gian kết thúc:</strong> {selectedSession.time.split("-")[1]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm">
                      <strong>Giáo viên phụ trách:</strong> {selectedSession.teacher}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedSession.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả buổi học:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSession.description}</p>
                  </div>
                )}

                {/* Students */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Học viên ({selectedSession.students.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSession.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStudentStatusIcon(student.status)}
                          <span className="text-xs text-gray-600 dark:text-gray-300">{getStudentStatusText(student.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {selectedSession.attendanceWarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cảnh báo điểm danh
                    </h4>
                    <div className="space-y-2">
                      {selectedSession.attendanceWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-orange-700">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Vào lớp
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Vào buổi</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
