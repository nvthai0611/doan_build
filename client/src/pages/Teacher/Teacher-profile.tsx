import type React from "react"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { usePermissions } from "../../hooks/use-permission"
import { PermissionTest } from "../../components/PermissionTest/PermissionTest"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Camera } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../utils/clientAxios"
import { TeacherDto } from "../../types/dtos/teacher.dto"

export default function TeacherProfilePage() {
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole } = usePermissions()
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "Phan Ngọc Anh",
    birthDate: "2025-08-25",
    gender: "male",
    avatar: "/teacher-avatar.jpg",
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulate upload
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData((prev) => ({ ...prev, avatar: e.target?.result as string }))
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      }, 1000)
    }
  }

  const {data, isLoading, isError} = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: async () => {
      const res = await apiClient.get<TeacherDto>(`/teachers/5a6c31a5-c55d-4086-ba84-79523d151f4e`);
      console.log(res);
      return res.data
    },
  })
  
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving profile data:", formData)
  }

  const handleCancel = () => {
    // Reset form or navigate back
    setFormData({
      fullName: user?.fullName || "Phan Ngọc Anh",
      birthDate: "2025-08-25",
      gender: "male",
      avatar: "/teacher-avatar.jpg",
    })
  }

  const testPermissions = async () => {
    console.log("=== DATABASE PERMISSION TEST FOR TEACHER ROLE ===")
    console.log("Current user role:", userRole)
    console.log("Current user:", user)
    console.log("User permissions from database:", user?.permissions)
    console.log("Expected role: teacher")
    console.log("")
    
    // Test individual permissions that teacher SHOULD have
    console.log("=== TEACHER ALLOWED PERMISSIONS (FROM DATABASE) ===")
    console.log("✅ Can view students:", hasPermission("students.view"))
    console.log("✅ Can view teachers:", hasPermission("teachers.view"))
    console.log("✅ Can view courses:", hasPermission("courses.view"))
    console.log("✅ Can view schedule:", hasPermission("schedule.view"))
    console.log("✅ Can view reports:", hasPermission("reports.view"))
    console.log("✅ Can view settings:", hasPermission("settings.view"))
    console.log("✅ Can manage attendance:", hasPermission("students.attendance"))
    console.log("")
    
    // Test permissions that teacher should NOT have
    console.log("=== TEACHER RESTRICTED PERMISSIONS (FROM DATABASE) ===")
    console.log("❌ Can create students (should be false):", hasPermission("students.create"))
    console.log("❌ Can edit students (should be false):", hasPermission("students.edit"))
    console.log("❌ Can delete students (should be false):", hasPermission("students.delete"))
    console.log("❌ Can create teachers (should be false):", hasPermission("teachers.create"))
    console.log("❌ Can edit teachers (should be false):", hasPermission("teachers.edit"))
    console.log("❌ Can delete teachers (should be false):", hasPermission("teachers.delete"))
    console.log("❌ Can create courses (should be false):", hasPermission("courses.create"))
    console.log("❌ Can edit courses (should be false):", hasPermission("courses.edit"))
    console.log("❌ Can delete courses (should be false):", hasPermission("courses.delete"))
    console.log("❌ Can create schedule (should be false):", hasPermission("schedule.create"))
    console.log("❌ Can edit schedule (should be false):", hasPermission("schedule.edit"))
    console.log("❌ Can delete schedule (should be false):", hasPermission("schedule.delete"))
    console.log("❌ Can manage finance (should be false):", hasPermission("finance.create"))
    console.log("❌ Can manage users (should be false):", hasPermission("users.create"))
    console.log("")
    
    // Test multiple permissions
    console.log("=== MULTIPLE PERMISSION TESTS ===")
    console.log("Can view students OR teachers:", hasAnyPermission(["students.view", "teachers.view"]))
    console.log("Can view students AND teachers:", hasAllPermissions(["students.view", "teachers.view"]))
    console.log("Can create students AND teachers (should be false):", hasAllPermissions(["students.create", "teachers.create"]))
    console.log("Can view students AND schedule (should be true):", hasAllPermissions(["students.view", "schedule.view"]))
    console.log("")
    
    // Test role-based access
    console.log("=== ROLE VERIFICATION ===")
    const isTeacher = userRole === "teacher"
    const isCenterOwner = userRole === "center_owner"
    const isAdmin = userRole === "admin"
    console.log("Is teacher role:", isTeacher)
    console.log("Is center owner role:", isCenterOwner)
    console.log("Is admin role:", isAdmin)
    console.log("")
    
    // Test API calls
    console.log("=== API PERMISSION TESTS ===")
    try {
      const { authService } = await import("../../services/common/auth/auth.service")
      
      // Test get user permissions from API
      console.log("Testing API: getUserPermissions...")
      const apiPermissions = await authService.getUserPermissions()
      console.log("API Permissions:", apiPermissions)
      
      // Test check specific permission
      console.log("Testing API: checkPermission('students.create')...")
      const canCreateStudents = await authService.checkPermission("students.create")
      console.log("Can create students (API):", canCreateStudents)
      
      // Test check allowed permission
      console.log("Testing API: checkPermission('students.view')...")
      const canViewStudents = await authService.checkPermission("students.view")
      console.log("Can view students (API):", canViewStudents)
      
    } catch (error) {
      console.error("API Permission test failed:", error)
    }
    console.log("")
    
    // Summary
    const allowedCount = [
      hasPermission("students.view"),
      hasPermission("teachers.view"),
      hasPermission("courses.view"),
      hasPermission("schedule.view"),
      hasPermission("reports.view"),
      hasPermission("settings.view"),
      hasPermission("students.attendance")
    ].filter(Boolean).length
    
    const restrictedCount = [
      hasPermission("students.create"),
      hasPermission("students.edit"),
      hasPermission("students.delete"),
      hasPermission("teachers.create"),
      hasPermission("teachers.edit"),
      hasPermission("teachers.delete"),
      hasPermission("finance.create"),
      hasPermission("users.create")
    ].filter(Boolean).length
    
    console.log("=== SUMMARY ===")
    console.log(`✅ Allowed permissions: ${allowedCount}/7`)
    console.log(`❌ Restricted permissions: ${restrictedCount}/8`)
    console.log(`🎯 Permission system working: ${restrictedCount === 0 ? "YES" : "NO"}`)
    console.log(`📊 Database permissions loaded: ${user?.permissions ? user.permissions.length : 0} permissions`)
    
    alert(`Database Permission test completed!\n\n✅ Allowed: ${allowedCount}/7\n❌ Restricted: ${restrictedCount}/8\n📊 DB Permissions: ${user?.permissions ? user.permissions.length : 0}\n\nCheck console for detailed results.`)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/center-qn">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tài khoản</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Thông tin cá nhân</h1>
        <Button 
          onClick={testPermissions}
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          🧪 Kiểm tra quyền hạn
        </Button>
      </div>

      {/* Permission Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Vai trò & Quyền hạn hiện tại (Database)</h3>
                <p className="text-sm text-blue-700">
                  Vai trò: <span className="font-medium">{userRole || "Chưa đăng nhập"}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Quyền hạn DB: <span className="font-medium">{user?.permissions ? user.permissions.length : 0} đã tải</span>
                </p>
              <div className="flex gap-4 mt-2 text-xs text-blue-600">
                <span className={`px-2 py-1 rounded ${hasPermission("students.view") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Xem học sinh: {hasPermission("students.view") ? "✅" : "❌"}
                </span>
                <span className={`px-2 py-1 rounded ${hasPermission("teachers.view") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Xem giáo viên: {hasPermission("teachers.view") ? "✅" : "❌"}
                </span>
                <span className={`px-2 py-1 rounded ${hasPermission("courses.view") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Xem khóa học: {hasPermission("courses.view") ? "✅" : "❌"}
                </span>
                <span className={`px-2 py-1 rounded ${hasPermission("schedule.view") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  Xem lịch học: {hasPermission("schedule.view") ? "✅" : "❌"}
                </span>
              </div>
              
              {/* Database Permissions List */}
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Danh sách quyền hạn từ Database:</h4>
                {user?.permissions && user.permissions.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {user.permissions.map((permission, index) => (
                      <div key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {permission}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-purple-600">
                    Không có quyền hạn nào được tải từ database
                  </div>
                )}
              </div>

              {/* Test Center Owner Only Buttons */}
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Kiểm tra nút chỉ dành cho Chủ trung tâm:</h4>
                  <div className="space-y-2">
                    {/* Test Create Students Permission */}
                    {hasPermission("students.create") ? (
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        onClick={() => alert("❌ Nút này KHÔNG nên hiển thị cho giáo viên!")}
                      >
                        🚨 Tạo học sinh (Chỉ Chủ trung tâm)
                      </Button>
                    ) : (
                      <div className="text-sm text-green-700">
                        ✅ Nút Tạo học sinh đã được ẩn đúng cách
                      </div>
                    )}
                    
                    {/* Test Delete Students Permission */}
                    {hasPermission("students.delete") ? (
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs ml-2"
                        onClick={() => alert("❌ Nút này KHÔNG nên hiển thị cho giáo viên!")}
                      >
                        🚨 Xóa học sinh (Chỉ Chủ trung tâm)
                      </Button>
                    ) : (
                      <div className="text-sm text-green-700">
                        ✅ Nút Xóa học sinh đã được ẩn đúng cách
                      </div>
                    )}
                    
                    {/* Test Finance Permission */}
                    {hasPermission("finance.create") ? (
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs ml-2"
                        onClick={() => alert("❌ Nút này KHÔNG nên hiển thị cho giáo viên!")}
                      >
                        🚨 Quản lý tài chính (Chỉ Chủ trung tâm)
                      </Button>
                    ) : (
                      <div className="text-sm text-green-700">
                         Nút Quản lý tài chính đã được ẩn đúng cách
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Test Teacher Allowed Buttons */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Kiểm tra nút được phép cho Giáo viên:</h4>
                  <div className="space-y-2">
                    {hasPermission("students.view") ? (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => alert("✅ Giáo viên có thể xem học sinh - Đúng rồi!")}
                      >
                        ✅ Xem học sinh (Giáo viên được phép)
                      </Button>
                    ) : (
                      <div className="text-sm text-red-700">
                        ❌ Nút Xem học sinh nên hiển thị cho giáo viên
                      </div>
                    )}
                    
                    {hasPermission("schedule.view") ? (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white text-xs ml-2"
                        onClick={() => alert("✅ Giáo viên có thể xem lịch học - Đúng rồi!")}
                      >
                        ✅ Xem lịch học (Giáo viên được phép)
                      </Button>
                    ) : (
                      <div className="text-sm text-red-700">
                        ❌ Nút Xem lịch học nên hiển thị cho giáo viên
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Nhấn "Kiểm tra quyền hạn" để xem kết quả chi tiết</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Test Component */}
      <PermissionTest 
        userRole={userRole} 
        userPermissions={user?.permissions || []} 
      />

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="text-lg">
                        {formData.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="text-sm font-medium text-primary hover:text-primary/80">Cập nhật ảnh</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        *.jpeg, *.jpg, *.png, *.gif giới hạn 3.1 MB
                      </div>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6">
                  {/* User Info Header */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {formData.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{formData.fullName}</h3>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Hủy
                      </Button>
                      <Button onClick={handleSave}>Lưu</Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Ngày sinh</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Nam</SelectItem>
                          <SelectItem value="female">Nữ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input id="currentPassword" type="password" placeholder="Nhập mật khẩu hiện tại" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" type="password" placeholder="Nhập mật khẩu mới" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" type="password" placeholder="Xác nhận mật khẩu mới" />
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Hủy</Button>
                <Button>Cập nhật mật khẩu</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
