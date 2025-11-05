"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Phone, CalendarIcon, ChevronDown, Users, BookOpen } from "lucide-react"
import type { Child } from "../../../../services/parent"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../../../utils/clientAxios"

interface ChildGeneralInfoProps {
  child: Child
}

// Helper function để xác định trạng thái học sinh
const getStudentStatus = (enrollments: any[]) => {
  const activeEnrollments = enrollments.filter((e: any) => e.status === 'studying')
  
  if (activeEnrollments.length > 0) return 'studying'
  if (enrollments.some((e: any) => e.status === 'graduated')) return 'graduated'
  if (enrollments.some((e: any) => e.status === 'stopped')) return 'stopped'
  if (enrollments.some((e: any) => e.status === 'withdrawn')) return 'withdrawn'
  return 'not_been_updated'
}

// Helper function để hiển thị thông tin trạng thái
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'studying':
      return {
        text: 'Đang học',
        description: 'Học sinh đang học tập bình thường',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
      }
    case 'graduated':
      return {
        text: 'Đã tốt nghiệp',
        description: 'Học sinh đã hoàn thành chương trình học',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    case 'stopped':
      return {
        text: 'Đã dừng học',
        description: 'Học sinh tạm ngưng học tập',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      }
    case 'withdrawn':
      return {
        text: 'Đã rút',
        description: 'Học sinh đã rút khỏi trung tâm',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
      }
    case 'not_been_updated':
    default:
      return {
        text: 'Chưa cập nhật',
        description: 'Trạng thái chưa được cập nhật',
        badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
      }
  }
}

// API để lấy xếp hạng của học sinh trong một lớp cụ thể
const getClassRanking = async (studentId: string, classId: string) => {
  try {
    const response = await apiClient.get(`/parent/student-management/children/${studentId}/class-ranking/${classId}`)
    return (response as any)?.data?.data ?? (response as any)?.data
  } catch (error) {
    console.error('Error fetching class ranking:', error)
    return null
  }
}

export function ChildGeneralInfo({ child }: ChildGeneralInfoProps) {
  // Helpers to compute per-class stats from the child's available data
  const computeClassStats = (classId?: string, className?: string, enrolledAt?: string) => {
    // GPA from grades - support multiple grade shapes
    const grades = (child.grades || []).filter((g: any) => {
      const gClassId = g.classId || g?.assessment?.class?.id
      const gClassName = g.className || g?.assessment?.class?.name
      if (classId && gClassId) return gClassId === classId
      if (className && gClassName) return gClassName === className
      return false
    })
    
  const scored = grades.filter((g: any) => g?.score !== null && typeof g?.score === 'number')
    const gpa = scored.length > 0 
      ? Number((scored.reduce((sum, g) => sum + (g.score || 0), 0) / scored.length).toFixed(1)) 
      : null

    // Attendance rate from attendance records (by class name)
    const enrolledAtDate = enrolledAt ? new Date(enrolledAt) : null
    const atts = (child.attendances || []).filter(a => {
      if (!a.session?.class?.name) return false
      const sameClass = className ? a.session.class.name === className : true
      const afterEnroll = enrolledAtDate ? new Date(a.session.sessionDate) >= enrolledAtDate : true
      return sameClass && afterEnroll
    })
    
    const totalAtt = atts.length
    const present = atts.filter(a => a.status === 'present').length
    const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : null

    // Simple performance label based on GPA
    const performanceLabel = gpa == null ? 'N/A' : gpa >= 8 ? 'Tốt' : gpa >= 6.5 ? 'Khá' : gpa >= 5 ? 'Trung bình' : 'Yếu'

    return { gpa, attendanceRate, performanceLabel }
  }

  // Component để hiển thị stats của một lớp với ranking
  const ClassStatsDisplay = ({ 
    enrollment, 
    stats 
  }: { 
    enrollment: any
    stats: { gpa: number | null, attendanceRate: number | null, performanceLabel: string }
  }) => {
    // Fetch ranking cho lớp này
    const { data: ranking } = useQuery({
      queryKey: ['class-ranking', child.id, enrollment.class.id],
      queryFn: () => getClassRanking(child.id, enrollment.class.id),
      enabled: !!child.id && !!enrollment.class.id && stats.gpa !== null,
      staleTime: 3000,
    })

    return (
      <div className="px-6 pb-4">
        {/* quick meta row */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{ranking?.totalStudents ?? 'N/A'} học sinh</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{enrollment.class.subject?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{enrollment.class.teacher?.user?.fullName || 'Chưa có giáo viên'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">{stats.gpa ?? 'N/A'}</div>
            <div className="text-sm text-muted-foreground mt-1">Điểm trung bình</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {ranking?.rank && ranking?.totalStudents 
                ? `${ranking.rank}/${ranking.totalStudents}` 
                : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Xếp hạng lớp</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">
              {stats.attendanceRate != null ? `${stats.attendanceRate}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Tỷ lệ điểm danh</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary/10 shadow-lg">
              <AvatarImage src={(child.user as any)?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-white">
                {child.user?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {child.user.fullName}
                  </h2>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    🎓 Học sinh
                  </Badge>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 gap-x-8">
                    <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-base">📧</span>
                      </div>
                      <span className="font-medium truncate">{child.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{child.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{child.studentCode}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{child.dateOfBirth?.slice(0,10)}</span>
                    </div>
                  </div>
                </div>
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
                  <ClassStatsDisplay enrollment={enr} stats={stats} />
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
          <CardTitle>Trạng thái học tập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Trạng thái hiện tại</p>
              <p className="text-sm text-muted-foreground">
                {getStatusDisplay(getStudentStatus(child.enrollments || [])).description}
              </p>
            </div>
            <Badge variant="outline" className={getStatusDisplay(getStudentStatus(child.enrollments || [])).badgeClass}>
              {getStatusDisplay(getStudentStatus(child.enrollments || [])).text}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
