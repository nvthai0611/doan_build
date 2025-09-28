"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PermissionGuard } from "../Auth/Permission-guard"
import { ProtectedButton } from "@/components/ui/protected-button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Calendar, Plus, Eye, BarChart3, Loader2 } from "lucide-react"
import { LoginForm } from "../Auth/Login"
import { useAuth } from "../../lib/auth"
export function CenterOwnerDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Chào buổi sáng, <span className="text-primary">{user.fullName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Tổng quan hoạt động trung tâm hôm nay</p>
        </div>
        <div className="flex gap-2">
          <ProtectedButton permission="reports.view" variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Xem báo cáo
          </ProtectedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard permission="students.view">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="teachers.view">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giáo viên</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+3</span> giáo viên mới
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="courses.view">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">5</span> khóa học đang mở
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="finance.view">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫45.2M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> so với tháng trước
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PermissionGuard permission="reports.view">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tiến độ hoàn thành công việc
              </CardTitle>
              <CardDescription>Theo dõi các mục tiêu đã đặt ra trong tháng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tuyển sinh mới</span>
                  <span>75/100</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Khóa học mới</span>
                  <span>3/5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Đào tạo giáo viên</span>
                  <span>8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="schedule.view">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lịch hôm nay
              </CardTitle>
              <CardDescription>Các hoạt động và sự kiện quan trọng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Họp phụ huynh lớp 10A</p>
                  <p className="text-xs text-muted-foreground">9:00 - 10:30</p>
                </div>
                <Badge variant="secondary">Sắp tới</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Đánh giá giáo viên</p>
                  <p className="text-xs text-muted-foreground">14:00 - 16:00</p>
                </div>
                <Badge variant="outline">Hôm nay</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Báo cáo tài chính</p>
                  <p className="text-xs text-muted-foreground">16:30 - 17:30</p>
                </div>
                <Badge variant="secondary">Quan trọng</Badge>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Quick Actions */}
      <PermissionGuard permissions={["students.create", "teachers.create", "courses.create"]} requireAll={false}>
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các tính năng thường sử dụng để quản lý trung tâm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ProtectedButton
                permission="students.create"
                variant="outline"
                className="h-20 flex-col gap-2"
                hideWhenNoAccess
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Thêm học viên</span>
              </ProtectedButton>

              <ProtectedButton
                permission="teachers.create"
                variant="outline"
                className="h-20 flex-col gap-2"
                hideWhenNoAccess
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm">Thêm giáo viên</span>
              </ProtectedButton>

              <ProtectedButton
                permission="courses.create"
                variant="outline"
                className="h-20 flex-col gap-2"
                hideWhenNoAccess
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm">Tạo khóa học</span>
              </ProtectedButton>

              <ProtectedButton
                permission="reports.view"
                variant="outline"
                className="h-20 flex-col gap-2"
                hideWhenNoAccess
              >
                <Eye className="w-6 h-6" />
                <span className="text-sm">Xem báo cáo</span>
              </ProtectedButton>
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  )
}
