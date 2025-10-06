"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { teacherScheduleService } from "../../../services/teacherScheduleService"
import { ScheduleData, ScheduleFilters } from "./utils"
import Loading from "../../../components/Loading/LoadingPage"
import SessionDetailModal from "./components/SessionDetailModal"
import DaySessionsModal from "./components/DaySessionsModal"

export default function TeacherSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<ScheduleData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ScheduleData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dayModalDate, setDayModalDate] = useState<string | null>(null)
  const [dayModalOpen, setDayModalOpen] = useState(false)

  // Fetch schedules for current month
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        
        const response = await teacherScheduleService.getMonthlySchedule(year, month)
        if (response) {
          setSchedules(response);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error)
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()

  }, [currentDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getDateStr = (date: Date) => {
    const [day, month, year] = date.toLocaleDateString('vi-VN').split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const getSchedulesForDate = (date: Date) => {
    const dateStr = getDateStr(date)
    return schedules.filter(schedule => (schedule.date as any).toString().split('T')[0] === dateStr)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "regular":
        return "bg-pink-200 text-pink-800"
      case "exam":
        return "bg-green-200 text-green-800"
      case "makeup":
        return "bg-yellow-200 text-yellow-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const openSession = (session: ScheduleData) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const openDayModal = (date: Date) => {
    setDayModalDate(getDateStr(date))
    setDayModalOpen(true)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatMonthYear = (date: Date) => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ]
    return `${months[date.getMonth()]}, ${date.getFullYear()}`
  }

  const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
  const days = getDaysInMonth(currentDate)
  const today = new Date()

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch dạy</h2>
            <p className="text-lg font-semibold text-gray-700 mt-1">
              {formatMonthYear(currentDate)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hôm nay
            </Button>
            <Select
              value={currentDate.getMonth().toString()}
              onValueChange={(value) => {
                const newDate = new Date(
                  currentDate.getFullYear(),
                  parseInt(value),
                  1,
                );
                setCurrentDate(newDate);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Tháng {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={(value) => {
                const newDate = new Date(
                  parseInt(value),
                  currentDate.getMonth(),
                  1,
                );
                setCurrentDate(newDate);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="p-6">
          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center font-semibold text-gray-600 dark:text-gray-300 text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="h-24"></div>;
                  }

                  const daySchedules = getSchedulesForDate(day);
                  const isToday = day.toDateString() === today.toDateString();

                  return (
                    <div
                      key={day.getDate()}
                      className={`h-24 border border-gray-200 dark:border-gray-700 p-1 ${
                        isToday ? 'bg-blue-50' : 'bg-white dark:bg-gray-800'
                      } hover:bg-gray-50 dark:bg-gray-900`}
                      onDoubleClick={() => daySchedules.length > 0 && openDayModal(day)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {daySchedules.length > 2 && (
                          <button
                            className="text-xs bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); openDayModal(day); }}
                          >
                            {daySchedules.length}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        {daySchedules.slice(0, 2).map((schedule, idx) => (
                          <button
                            key={idx}
                            className={`w-full text-left text-xs p-1 rounded truncate ${getEventColor(
                              schedule.type,
                            )}`}
                            title={`${schedule.subject} - ${schedule.className} (${schedule.startTime}-${schedule.endTime})`}
                            onClick={(e) => { e.stopPropagation(); openSession(schedule); }}
                          >
                            {schedule.className} - {schedule.startTime}-{schedule.endTime}
                          </button>
                        ))}
                        {daySchedules.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{daySchedules.length - 2} khác
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <SessionDetailModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <DaySessionsModal
        date={dayModalDate}
        sessions={dayModalDate ? schedules.filter(s => (s.date as any).toString().split('T')[0] === dayModalDate) : []}
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        onSelectSession={(s) => { setSelectedSession(s); setIsModalOpen(true); setDayModalOpen(false); }}
      />
    </div>
  );
}