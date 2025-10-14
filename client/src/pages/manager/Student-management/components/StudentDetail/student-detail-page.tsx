"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Edit, LinkIcon, Clock, Phone, Mail, Calendar } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useNavigate } from "react-router-dom"

const student = {
  user: {
    fullName: "Nguyễn Văn A",
    username: "ngan@centerup",
    email: "ngan@centerup",
    phone: "0321123321",
  },
  studentCode: "CST-75017FF5A611",
  dateOfBirth: new Date("2004-08-25"),
  gender: "Nam",
  address: "Cần Thơ",
  grade: "12",
  className: "12B1",  
}
export function StudentDetailPage() {
  const [accountStatus, setAccountStatus] = useState(true)
  const navigate = useNavigate()

  const handleAccountStatusToggle = async (checked: boolean) => {
    try {
      setAccountStatus(checked)
      
      // TODO: Gọi API để cập nhật trạng thái tài khoản
      // const response = await studentService.updateAccountStatus(student.id, checked)
      
      // Hiển thị thông báo thành công
      console.log(`Tài khoản đã được ${checked ? 'kích hoạt' : 'vô hiệu hóa'}`)
      
      // Có thể thêm toast notification ở đây
      // toast.success(`Tài khoản đã được ${checked ? 'kích hoạt' : 'vô hiệu hóa'}`)
      
    } catch (error) {
      // Rollback state nếu có lỗi
      setAccountStatus(!checked)
      
      console.error('Lỗi khi cập nhật trạng thái tài khoản:', error)
      
      // Hiển thị thông báo lỗi
      // toast.error('Có lỗi xảy ra khi cập nhật trạng thái tài khoản')
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
            <TabsTrigger
              value="report"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Báo cáo
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Lịch học
            </TabsTrigger>
            <TabsTrigger
              value="work"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Công việc
            </TabsTrigger>
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
                <Card>
                  <CardContent className="p-6">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={student?.user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gray-300">
                          {student?.user?.fullName ? 
                            student.user.fullName.charAt(0).toUpperCase() :
                            <User className="h-16 w-16 text-gray-500" />
                          }
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Account Status Toggle */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Switch
                        checked={accountStatus}
                        onCheckedChange={handleAccountStatusToggle}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                      <span className="text-sm text-foreground">
                        {accountStatus ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>

                    {/* Student Stats */}
                    <div className="space-y-4 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Tổng số lớp:</p>
                        <p className="text-xl font-semibold text-blue-600">
                          {student?.enrollments?.length || 0}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Công nợ:</p>
                        <p className="text-xl font-semibold text-red-600">
                          {student?.feeRecords?.reduce((total: number, fee: any) => 
                            total + (fee.amount - (fee.paidAmount || 0)), 0
                          ) || 0} đ
                        </p>
                      </div>
                    </div>

                    {/* Verify Button */}
                    <Button
                      variant="outline"
                      className="w-full mb-8 border-indigo-600 text-indigo-600 hover:bg-indigo-50 bg-transparent"
                    >
                      <span className="mr-2">✓</span>
                      Xác thực
                    </Button>

                    {/* Login Account Info */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Thông tin tài khoản đăng nhập</h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tên đăng nhập</p>
                          <p className="text-sm text-indigo-600">{student?.user?.username || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-indigo-600">{student?.user?.phone || 'Chưa cập nhật'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-indigo-600">{student?.user?.email || 'Chưa cập nhật'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Ngày tạo tài khoản</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-gray-600">
                              {student?.createdAt ? formatDate(student.createdAt) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">Thông tin học viên</h2>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tên học viên</p>
                        <p className="text-sm font-medium text-foreground">Raymond</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Địa chỉ email</p>
                        <p className="text-sm font-medium text-foreground">ranblameray@gmail.com</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                        <p className="text-sm font-medium text-foreground">0338899128</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Mã học viên</p>
                        <p className="text-sm font-medium text-indigo-600">CST-165CC69FBB07</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-foreground">Thông tin khách hàng</h2>
                      <Button variant="ghost" size="icon">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="mb-4 opacity-30">
                        <svg
                          width="200"
                          height="150"
                          viewBox="0 0 200 150"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect x="20" y="20" width="160" height="100" rx="8" fill="#E5E7EB" />
                          <rect x="30" y="30" width="50" height="8" rx="4" fill="#D1D5DB" />
                          <rect x="30" y="45" width="80" height="8" rx="4" fill="#D1D5DB" />
                          <rect x="30" y="60" width="60" height="8" rx="4" fill="#D1D5DB" />
                          <circle cx="150" cy="50" r="15" fill="#D1D5DB" />
                          <rect x="30" y="85" width="140" height="25" rx="4" fill="#F3F4F6" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground text-sm">Không có dữ liệu</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tab contents */}
          <TabsContent value="report">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung báo cáo</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung lịch học</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung công việc</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung hoá đơn</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tuition">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung học phí</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung học tập</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Nội dung điểm danh</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
