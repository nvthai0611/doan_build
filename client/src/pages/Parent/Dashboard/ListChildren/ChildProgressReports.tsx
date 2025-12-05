"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, FileQuestion } from "lucide-react"
import type { Child } from "../../../../services/parent/child-management/child.types"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { parentChildProgressReportService } from "@/services/parent/child-progress/child-progress.service"
import type { ProgressReportDto } from "@/services/parent/child-progress/child-progress.types"

interface ChildProgressReportsProps {
  child: Child
}

export function ChildProgressReports({ child }: ChildProgressReportsProps) {
  const { data: reports = [], isLoading, isError } = useQuery<{ data: ProgressReportDto[] } | ProgressReportDto[], ProgressReportDto[]>({
    queryKey: ["child-progress-reports", child.id],
    queryFn: () => parentChildProgressReportService.getProgressReports(child.id),
  }) as any

  // Group reports by period (1 report = 1 subject per class now)
  const rawReports = ((reports as any)?.data as ProgressReportDto[] | undefined) || (reports as ProgressReportDto[] | undefined) || []

  const groupedByPeriod = rawReports.reduce((acc, r: ProgressReportDto) => {
    const key = r.periodLabel
    if (!acc[key]) {
      const dt = new Date(r.periodEnd)
      acc[key] = {
        period: r.periodLabel,
        date: dt.toLocaleDateString('vi-VN'),
        endTs: dt.getTime(),
        month: dt.getMonth() + 1,
        year: dt.getFullYear(),
        subjects: [],
        teachers: new Set<string>()
      }
    }

    // Each report represents one class/subject
    acc[key].subjects.push({
      name: r.class?.subject?.name || 'Chưa xác định',
      className: r.class?.name || 'Chưa xác định',
      score: r.averageScore ?? null,
      attendanceRate: r.attendanceRate ?? null,
      trend: r.trend || 'stable',
      overallComment: r.overallComment
    })

    if (r.teacher?.user?.fullName) {
      acc[key].teachers.add(r.teacher.user.fullName)
    }
    return acc
  }, {} as Record<string, any>)

  const progressReports = Object.values(groupedByPeriod).map((group: any) => {
    // Calculate overall average across all subjects in this period
    const subjectsWithScores = group.subjects.filter((s: any) => s.score !== null)
    const avgScore = subjectsWithScores.length
      ? subjectsWithScores.reduce((sum: number, s: any) => sum + s.score, 0) / subjectsWithScores.length
      : null

    // Calculate overall attendance
    const subjectsWithAttendance = group.subjects.filter((s: any) => s.attendanceRate !== null)
    const avgAttendance = subjectsWithAttendance.length
      ? subjectsWithAttendance.reduce((sum: number, s: any) => sum + s.attendanceRate, 0) / subjectsWithAttendance.length
      : null

    return {
      period: group.period,
      date: group.date,
      month: group.month,
      year: group.year,
      endTs: group.endTs,
      averageScore: avgScore,
      attendanceRate: avgAttendance,
      subjects: group.subjects,
      teachers: Array.from(group.teachers).join(', ')
    }
  })

  // Hooks must not be conditional; handle empty state later in JSX

  // Month + Year filters
  const groupsArray = useMemo(() => Object.values(groupedByPeriod) as any[], [groupedByPeriod])

  const latestGroup = useMemo(() => {
    if (!groupsArray.length) return null as any
    return groupsArray.reduce((max: any, g: any) => (max && max.endTs > g.endTs ? max : g), null)
  }, [groupsArray])

  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  useEffect(() => {
    if (!selectedMonth && latestGroup) {
      setSelectedMonth(String(latestGroup.month))
    }
  }, [latestGroup, selectedMonth])

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  }, [])

  const yearOptions = useMemo(() => {
    const set = new Set<number>()
    groupsArray
      .filter((g: any) => (selectedMonth ? String(g.month) === String(selectedMonth) : true))
      .forEach((g: any) => set.add(g.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [groupsArray, selectedMonth])

  const filteredReports = useMemo(() => {
    let list = progressReports as any[]
    if (selectedMonth) {
      list = list.filter((rep: any) => String(rep.month) === String(selectedMonth))
    }
    if (selectedYear !== "all") {
      list = list.filter((rep: any) => String(rep.year) === String(selectedYear))
    }
    // Sort by most recent first
    return list.sort((a: any, b: any) => b.endTs - a.endTs)
  }, [progressReports, selectedMonth, selectedYear])

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Đang tải báo cáo tiến độ…</h3>
              <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </div>
      )}
      {isError && !isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Không thể tải báo cáo tiến độ</h3>
              <p className="text-sm text-muted-foreground">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
          </div>
        </div>
      )}
      {!isLoading && !isError && progressReports.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileQuestion className="text-slate-400 dark:text-slate-500" size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Chưa có báo cáo tiến độ</h3>
              <p className="text-sm text-muted-foreground">Bé chưa có báo cáo tiến độ nào.</p>
            </div>
          </div>
        </div>
      )}
      {/* Lọc theo tháng và năm chỉ hiện khi có dữ liệu */}
      {progressReports.length > 0 && (
        <>
          <CardTitle>Tìm kiếm theo tháng và năm</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Tháng:</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthOptions.map((m) => (
                  <option key={m} value={String(m)}>Tháng {m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Năm:</label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {yearOptions.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}


      {/* Nếu có dữ liệu tổng thể nhưng lọc không ra kết quả thì hiện alert riêng */}
      {progressReports.length > 0 && filteredReports.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <FileQuestion className="text-amber-600 dark:text-amber-500" size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Không tìm thấy báo cáo phù hợp</h3>
              <p className="text-sm text-muted-foreground">Không có báo cáo tiến độ nào cho tháng/năm bạn đã chọn.</p>
            </div>
          </div>
        </div>
      )}

      {filteredReports.map((report: any, idx: number) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Báo cáo tiến độ - {report.period}</CardTitle>
                <CardDescription>
                  Ngày lập: {report.date}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Tiến độ theo môn học</h4>
              {report.subjects.map((subject: any, index: number) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h5 className="font-medium">{subject.name}</h5>
                      <p className="text-xs text-muted-foreground">Lớp: {subject.className}</p>
                      {subject.trend === "up" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ↑ Tiến bộ
                        </Badge>
                      )}
                      {subject.trend === "stable" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          → Ổn định
                        </Badge>
                      )}
                      {subject.trend === "down" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          ↓ Cần cải thiện
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Điểm: {subject.score !== null ? subject.score.toFixed(1) : '—'} |
                      Chuyên cần: {subject.attendanceRate ? `${subject.attendanceRate.toFixed(0)}%` : '—'}
                    </div>
                  </div>
                  {subject.overallComment && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Nhận xét:</span> {subject.overallComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
