"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Child } from "../../../../services/parent/child-management/child.types"
import { useQuery } from "@tanstack/react-query"
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

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải báo cáo tiến độ…</div>
  }
  if (isError) {
    return <div className="text-sm text-red-600">Không thể tải báo cáo tiến độ.</div>
  }

  // Group reports by period (1 report = 1 subject per class now)
  const rawReports = ((reports as any)?.data as ProgressReportDto[] | undefined) || (reports as ProgressReportDto[] | undefined) || []

  const groupedByPeriod = rawReports.reduce((acc, r: ProgressReportDto) => {
    const key = r.periodLabel
    if (!acc[key]) {
      acc[key] = {
        period: r.periodLabel,
        date: new Date(r.periodEnd).toLocaleDateString('vi-VN'),
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
      averageScore: avgScore,
      attendanceRate: avgAttendance,
      subjects: group.subjects,
      teachers: Array.from(group.teachers).join(', ')
    }
  })

  if (!progressReports.length) {
    return <div className="text-sm text-muted-foreground">Chưa có báo cáo tiến độ nào.</div>
  }

  return (
    <div className="space-y-6">
      {progressReports.map((report, idx) => (
        <Card key={idx}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Báo cáo tiến độ - {report.period}</CardTitle>
                <CardDescription>
                  Ngày lập: {report.date}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Tải xuống PDF
              </Button>
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

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Nhận xét chung</h4>
              <p className="text-sm">
                {report.subjects.length > 0 && report.subjects[0].overallComment
                  ? report.subjects[0].overallComment
                  : '—'}
              </p>
              {report.teachers && (
                <p className="text-sm text-muted-foreground mt-2">Giáo viên phụ trách: {report.teachers}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
