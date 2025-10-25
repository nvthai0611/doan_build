"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Phone, CalendarIcon, ChevronDown, Users, BookOpen } from "lucide-react"
import type { Child } from "../../../services/parent"

interface ChildGeneralInfoProps {
  child: Child
}

export function ChildGeneralInfo({ child }: ChildGeneralInfoProps) {
  // Helpers to compute per-class stats from the child's available data
  const computeClassStats = (classId?: string, className?: string, enrolledAt?: string) => {
    // GPA from grades
    const grades = (child.grades || []).filter(g => {
      if (classId && g.classId) return g.classId === classId
      if (className) return g.className === className
      return false
    })
    const scored = grades.filter(g => typeof g.score === 'number') as Array<Required<Pick<typeof grades[number], 'score'>> & any>
    const gpa = scored.length > 0 ? Number((scored.reduce((s, g: any) => s + (g.score ?? 0), 0) / scored.length).toFixed(1)) : null

    // Attendance rate from attendance records (by class name and after enrolledAt)
    const enrolledAtDate = enrolledAt ? new Date(enrolledAt) : null
    const atts = (child.attendances || []).filter(a => {
      const sameClass = className ? a.session?.class?.name === className : true
      const afterEnroll = enrolledAtDate ? new Date(a.session.sessionDate) >= enrolledAtDate : true
      return sameClass && afterEnroll
    })
    const totalAtt = atts.length
    const present = atts.filter(a => a.status === 'present').length
    const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : null

    // Rank/total students: not available from current data -> show null to render N/A
    const rank: number | null = null
    const totalStudents: number | null = null

    // Simple performance label based on GPA
    const performanceLabel = gpa == null ? 'N/A' : gpa >= 8 ? 'Tốt' : gpa >= 6.5 ? 'Khá' : gpa >= 5 ? 'Trung bình' : 'Yếu'

    return { gpa, attendanceRate, rank, totalStudents, performanceLabel }
  }

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={(child.user as any)?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{child.user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{child.user.fullName}</h2>
                  <Badge variant="secondary" className="mt-2">
                    Học sinh
                  </Badge>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span>{child.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{child.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{child.studentCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{child.dateOfBirth?.slice(0,10)}</span>
                    </div>
                  </div>
                </div>
                <Button>Chỉnh sửa</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Thành tích học tập</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {((child.enrollments || []).filter(enr => enr.status === 'studying' && !!enr.class?.teacher?.id && enr.class.teacher.id !== ''))
              .map((enr, idx) => {
              const stats = computeClassStats(enr.class.id, enr.class.name, enr.enrolledAt)
              return (
                <details key={enr.id} className="group" open={idx === 0}>
                  <summary className="list-none cursor-pointer select-none flex items-center justify-between px-6 py-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{enr.class.name}</span>
                      <Badge variant="secondary">{stats.performanceLabel}</Badge>
                    </div>
                    <ChevronDown className="h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-4">
                    {/* quick meta row */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>N/A</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{enr.class.subject?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{enr.class.teacher?.user?.fullName || 'Chưa có giáo viên'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold text-primary">{stats.gpa ?? 'N/A'}</div>
                        <div className="text-sm text-muted-foreground mt-1">Điểm trung bình</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold text-primary">
                          {stats.rank != null && stats.totalStudents != null ? `${stats.rank}/${stats.totalStudents}` : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Xếp hạng lớp</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-3xl font-bold text-primary">{stats.attendanceRate != null ? `${stats.attendanceRate}%` : 'N/A'}</div>
                        <div className="text-sm text-muted-foreground mt-1">Tỷ lệ điểm danh</div>
                      </div>
                    </div>
                  </div>
                </details>
              )
            })}
            {(child.enrollments || []).length === 0 && (
              <div className="px-6 py-4 text-sm text-muted-foreground">Chưa có lớp nào.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Trạng thái hoạt động</p>
              <p className="text-sm text-muted-foreground">Tài khoản đang hoạt động bình thường</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Đang hoạt động
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
