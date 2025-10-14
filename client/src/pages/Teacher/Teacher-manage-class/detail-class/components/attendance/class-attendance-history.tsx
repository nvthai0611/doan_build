"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentAttendanceRow } from "./student-attendance-row"
import { AttendanceStatusBadge } from "./attendance-status-badge"
import {
  calculateAttendanceStats,
  formatSessionDate,
  formatSessionTime,
  ATTENDANCE_STATUS_CONFIG,
} from "../../lib/attendance-utils"
import { Search, Download, Filter, Calendar, RefreshCw } from "lucide-react"

interface ClassAttendanceHistoryProps {
  classId: string
  className: string
  students: any[]
  attendanceRecords: any[]
  onRefresh?: () => void // Add refresh callback
}

export function ClassAttendanceHistory({
  classId,
  className,
  students,
  attendanceRecords,
  onRefresh,
}: any) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "rate">("name")
  // Calculate attendance summaries
  const attendanceSummaries = useMemo(() => {
    return calculateAttendanceStats(students, attendanceRecords)
  }, [students, attendanceRecords])

  // Filter and sort students
  const filteredSummaries = useMemo(() => {
    let filtered = attendanceSummaries

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((summary) => {
        const fullName = summary.student.user.fullName?.toLowerCase() || ""
        const studentCode = summary.student.studentCode?.toLowerCase() || ""
        const email = summary.student.user.email.toLowerCase()
        const query = searchQuery.toLowerCase()
        return fullName.includes(query) || studentCode.includes(query) || email.includes(query)
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((summary) => {
        const statusCount = summary.stats[statusFilter as keyof typeof summary.stats]
        return typeof statusCount === "number" && statusCount > 0
      })
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.student.user.fullName || ""
        const nameB = b.student.user.fullName || ""
        return nameA.localeCompare(nameB)
      } else {
        const rateA = a.stats.total > 0 ? a.stats.present / a.stats.total : 0
        const rateB = b.stats.total > 0 ? b.stats.present / b.stats.total : 0
        return rateB - rateA
      }
    })

    return filtered
  }, [attendanceSummaries, searchQuery, statusFilter, sortBy])

  // Sort sessions by date
  const sortedSessions = useMemo(() => {
    return [...attendanceRecords]
      .sort((a, b) => new Date(a.session.sessionDate).getTime() - new Date(b.session.sessionDate).getTime())
      .map((record) => record.session)
  }, [attendanceRecords])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const total = attendanceSummaries.reduce((sum, s) => sum + s.stats.total, 0)
    const present = attendanceSummaries.reduce((sum, s) => sum + s.stats.present, 0)
    const absent = attendanceSummaries.reduce((sum, s) => sum + s.stats.absent, 0)
    const late = attendanceSummaries.reduce((sum, s) => sum + s.stats.late, 0)
    const excused = attendanceSummaries.reduce((sum, s) => sum + s.stats.excused, 0)

    return { total, present, absent, late, excused }
  }, [attendanceSummaries])

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Exporting attendance data...")
  }

  // Add refresh button if onRefresh is provided
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lịch sử điểm danh</h1>
          <p className="text-muted-foreground">{className}</p>
        </div>
        {onRefresh && (
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        )}
      </div>

      {/* Show message if no data */}
      {attendanceRecords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chưa có dữ liệu điểm danh</p>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số buổi</CardDescription>
            <CardTitle className="text-3xl">{sortedSessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5">
              <span className="text-green-600">✓</span> Có mặt
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{overallStats.present}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5">
              <span className="text-red-600">✗</span> Vắng
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{overallStats.absent}</CardTitle>
          </CardHeader>
        </Card>
        {/* <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5">
              <span className="text-orange-600">⏰</span> Muộn
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">{overallStats.late}</CardTitle>
          </CardHeader>
        </Card> */}
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5">
              <span className="text-blue-600">📝</span> Có phép
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{overallStats.excused}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm học sinh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="present">Có mặt</SelectItem>
                  <SelectItem value="absent">Vắng</SelectItem>
                  <SelectItem value="excused">Có phép</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "rate")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Theo tên</SelectItem>
                  <SelectItem value="rate">Theo tỷ lệ</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          {/* <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">Chú thích:</span>
            <div className="flex items-center gap-3">
              {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <AttendanceStatusBadge status={status} size="sm" />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div> */}

          {/* Session Headers */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex items-center gap-2 sm:gap-4 mb-2 pb-2 border-b border-border">
                <div className="w-48 sm:w-56 md:w-64 flex-shrink-0">
                  <p className="text-sm font-medium">Học sinh</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 text-center">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-xs font-medium text-green-600 truncate">Có mặt</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-xs font-medium text-red-600 truncate">Vắng</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-xs font-medium text-blue-600 truncate">Có phép</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-xs font-medium text-muted-foreground truncate">Tỷ lệ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Rows */}
              <div className="space-y-0">
                {filteredSummaries.length > 0 ? (
                  filteredSummaries.map((summary) => (
                    <StudentAttendanceRow key={summary.student.id} summary={summary} sessions={sortedSessions} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Không tìm thấy học sinh nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chi tiết các buổi học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedSessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{formatSessionDate(session.sessionDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSessionTime(session.startTime, session.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.status === "completed" ? "default" : "secondary"}>{session.status}</Badge>
                  {session.notes && <p className="text-xs text-muted-foreground max-w-xs truncate">{session.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
