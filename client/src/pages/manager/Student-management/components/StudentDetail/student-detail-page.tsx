"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { useStudentDetail, useUpdateStudentStatus, useToggleStudentStatus } from "../../hooks/useStudents"

// Import components
import {
  StudentSidebar,
  StudentInfoCard,
  StudentParentInfoCard,
  StudentScheduleTab,
  StudentAttendanceTab,
  StudentGradesTab,
  StudentTuitionTab
} from "./components"
import Loading from "../../../../../components/Loading/LoadingPage"

export function StudentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [accountStatus, setAccountStatus] = useState(true)

  // Use custom hooks
  const { 
    data: student, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useStudentDetail(id)

  const updateStatusMutation = useUpdateStudentStatus()
  const toggleStatusMutation = useToggleStudentStatus()

  // Update local account status when student data changes
  useEffect(() => {
    if (student?.user?.isActive !== undefined) {
      setAccountStatus(student.user.isActive)
    }
  }, [student?.user?.isActive])

  const handleAccountStatusToggle = (checked: boolean) => {
    if (!id || updateStatusMutation.isPending) return
    
    setAccountStatus(checked) // Immediate UI feedback
    updateStatusMutation.mutate({ 
      studentId: id, 
      isActive: checked 
    })
  }

  const handleToggleStatus = () => {
    if (!id || toggleStatusMutation.isPending) return
    
    setAccountStatus(!accountStatus) // Immediate UI feedback
    toggleStatusMutation.mutate(id)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Loading/>
    )
  }

  if (isError || !student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {isError 
              ? `Lỗi: ${(error as any)?.message || 'Không thể tải thông tin học viên'}` 
              : 'Không tìm thấy thông tin học viên'
            }
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Chi tiết học viên {student?.user?.fullName || 'N/A'}
          </h1>
          <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/center-qn')} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/center-qn/students')} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Danh sách tài khoản học viên
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Chi tiết học viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Thông tin chung
            </TabsTrigger>
            {/* <TabsTrigger
              value="report"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Báo cáo
            </TabsTrigger> */}
            <TabsTrigger
              value="schedule"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Lịch học
            </TabsTrigger>
            {/* <TabsTrigger
              value="work"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Công việc
            </TabsTrigger> */}
            <TabsTrigger
              value="invoice"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Hoá đơn
            </TabsTrigger>
            <TabsTrigger
              value="tuition"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Học phí
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Học tập
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Điểm danh
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                <StudentSidebar
                  student={student}
                  accountStatus={accountStatus}
                  onAccountStatusToggle={handleAccountStatusToggle}
                  formatDate={formatDate}
                  isUpdatingStatus={updateStatusMutation.isPending || toggleStatusMutation.isPending}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <StudentInfoCard student={student} onUpdate={() => refetch()} />
                <StudentParentInfoCard student={student} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng báo cáo đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <StudentScheduleTab student={student} />
          </TabsContent>

          <TabsContent value="work">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng quản lý công việc đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng quản lý hóa đơn đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tuition">
            <StudentTuitionTab student={student} />
          </TabsContent>

          <TabsContent value="learning">
            <StudentGradesTab student={student} />
          </TabsContent>

          <TabsContent value="attendance">
            <StudentAttendanceTab student={student} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
