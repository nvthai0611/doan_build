"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useQuery } from "@tanstack/react-query"
import { teacherDashboardService } from "@/services/teacher/dashboard.service"
import { useAuth } from "@/lib/auth"
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher-dashboard-stats'],
    queryFn: () => teacherDashboardService.getStats(),
  })

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['teacher-today-sessions'],
    queryFn: () => teacherDashboardService.getTodaySessions(),
  })

  const getStatusBadge = (status: string, startTime: string) => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    if (status === 'end') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Hoàn thành
        </Badge>
      )
    }
    
    if (currentTime >= startTime && status === 'happening') {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Đang diễn ra
        </Badge>
      )
    }
    
    return <Badge variant="outline">Sắp tới</Badge>
  }

  const getSessionStyle = (status: string, startTime: string) => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    if (status === 'end') {
      return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
    }
    
    if (currentTime >= startTime && status === 'happening') {
      return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    }
    
    return "bg-muted"
  }

  const formatDate = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
    const now = new Date()
    return `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Chào buổi sáng, <span className="text-primary">{user?.fullName || 'Giáo viên'}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Lịch dạy và công việc hôm nay</p>
        </div>        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học viên của tôi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Trên {stats?.totalClasses || 0} lớp học</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiết học hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.todaySessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stats?.completedSessions || 0}</span> tiết đã hoàn thành
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lịch dạy hôm nay
            </CardTitle>
            <CardDescription>{formatDate()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có buổi học nào hôm nay
              </div>
            ) : (
              sessions?.map((session) => (
                <div
                  key={session.id}
                  onClick={() => navigate(`/teacher/session-details/${session.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getSessionStyle(session.status, session.startTime)}`}
                >
                  {session.status === 'end' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{session.className} - {session.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.startTime} - {session.endTime} • {session.roomName}
                    </p>
                  </div>
                  {getStatusBadge(session.status, session.startTime)}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>      
    </div>
  )
}
