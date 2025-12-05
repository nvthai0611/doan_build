"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookMarked, ArrowRight, ChevronDown, Calendar, Clock } from "lucide-react"
import { parentOverviewService } from "../../../../services"
import type { UpcomingLesson, ActiveClass } from "../../../../services"

export function ParentOverview() {
  const navigate = useNavigate()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("Hôm nay")
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  const timeFilterOptions = ["Hôm qua", "Hôm nay", "Ngày mai"]

  // Convert UI filter to YYYY-MM-DD
  const getDateFromFilter = (filter: string): string => {
    const today = new Date()
    if (filter === "Hôm qua") {
      const d = new Date(today)
      d.setDate(today.getDate() - 1)
      return d.toISOString().split("T")[0]
    }
    if (filter === "Ngày mai") {
      const d = new Date(today)
      d.setDate(today.getDate() + 1)
      return d.toISOString().split("T")[0]
    }
    return today.toISOString().split("T")[0]
  }

  // Fetch overview data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["parent-overview", selectedTimeFilter],
    queryFn: () => parentOverviewService.getOverview(getDateFromFilter(selectedTimeFilter)),
    staleTime: 3000,
    refetchOnWindowFocus: true,
  })

  const parentName = data?.parentName || "Phụ huynh"
  const upcomingLessons = (data?.upcomingLessons || []) as UpcomingLesson[]
  const activeCourses = (data?.activeClasses || []) as ActiveClass[]

  // Time-based greeting
  const getTimeGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 5 && hour < 11) return "sáng"
    if (hour >= 11 && hour < 13) return "trưa"
    if (hour >= 13 && hour < 18) return "chiều"
    if (hour >= 18 && hour < 22) return "tối"
    return "đêm"
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Chưa diễn ra":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Đang diễn ra":
        return "bg-green-50 text-green-700 border-green-200"
      case "Đã kết thúc":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "Nghỉ học":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getAttendanceBadgeColor = (status: string) => {
    switch (status) {
      case "Có mặt":
        return "bg-green-50 text-green-700"
      case "Vắng":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Welcome Section - Hero */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-white/70">👋</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600">
                  <span>Chào buổi {getTimeGreeting()}, </span>
                  <span>{parentName}</span>
                </h1>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Hot + Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Có gì hot!</h2>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                {selectedTimeFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                {timeFilterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedTimeFilter(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedTimeFilter === option ? "bg-blue-50 text-primary font-medium" : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons Tab */}
          <div className="border-b border-border">
            <button className="w-full py-3 font-medium text-primary border-b-2 border-primary text-center">
              Buổi học
            </button>
          </div>

          {/* Upcoming Lessons */}
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground px-1">Đang tải buổi học...</p>}
            {isError && <p className="text-sm text-red-600 px-1">Không tải được dữ liệu.</p>}
            {!isLoading && !isError && upcomingLessons.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">Không có buổi học nào.</p>
            )}
            {upcomingLessons.map((classItem, idx) => {
              const rowId = `${classItem.className}-${idx}`
              const expanded = expandedClass === rowId
              return (
                <Card
                  key={rowId}
                  className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setExpandedClass(expanded ? null : rowId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{classItem.className}</h4>
                          <span className="text-xs text-muted-foreground">{classItem.room} - </span>
                          <h4 className="flex items-center gap-1 text-sm text-muted-foreground">{classItem.studentName}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{classItem.time}</p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                              <BookMarked className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Môn học</p>
                              <p className="font-medium">{classItem.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <BookMarked className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Giáo viên</p>
                              {(classItem as any).substituteTeacher ? (
                                <>
                                  <p className="font-medium">
                                    {(classItem as any).originalTeacher}
                                  </p>
                                  <p className="text-xs text-amber-700 mt-0.5">
                                    <span className="font-medium">Thay thế:</span> {(classItem as any).substituteTeacher.fullName}
                                  </p>
                                  <p className="text-xs text-amber-600 mt-0.5">
                                    {(classItem as any).substituteTeacher.from && (classItem as any).substituteTeacher.until && (
                                      <span className="text-[10px]">
                                        ({(classItem as any).substituteTeacher.from} → {(classItem as any).substituteTeacher.until})
                                      </span>
                                    )}
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium">{classItem.teacher}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                              <BookMarked className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phòng học</p>
                              <p className="font-medium">{classItem.room}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                            <Badge className={`${getStatusBadgeColor(classItem.status)} text-xs font-medium`}>
                              {classItem.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Điểm danh:</span>
                            <Badge className={`${getAttendanceBadgeColor(classItem.attendanceStatus)} text-xs font-medium`}>
                              {classItem.attendanceStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right column: Active Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lớp học đang diễn ra</h2>
            <Button 
              variant="link" 
              className="text-primary font-medium"
              onClick={() => navigate('/parent/classes')}
            >
              Xem Tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {activeCourses.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">Chưa có lớp học nào.</p>
            )}
            {activeCourses.map((c) => (
              <Card key={`${c.id}-${c.studentName}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{c.name} - {c.studentName}</h3>
                        {(c as any).substituteTeacher ? (
                          <>
                            <p className="text-sm text-muted-foreground mt-1">
                              {c.subject} • {(c as any).originalTeacher}
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              <span className="font-medium">Thay thế:</span> {c.teacher}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              {(c as any).substituteTeacher.from} → {(c as any).substituteTeacher.until}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">{c.subject} • {c.teacher}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Phòng: {c.room}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Tiến độ</p>
                        <p className="text-lg font-bold">{Math.round(c.progress)}%</p>
                      </div>
                    </div>
                    
                    {/* Schedule Info */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Lịch học</p>
                    </div>
                    <p className="text-sm">{c.schedule}</p>

                    {/* Next Class Info */}
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Buổi học kế tiếp</p>
                      <p className="text-sm font-medium mt-1">{c.nextClass}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
