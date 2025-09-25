"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
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
  const [formData, setFormData] = useState({
    fullName: user?.name || "Phan Ngọc Anh",
    birthDate: "2025-08-25",
    gender: "male",
    avatar: user?.avatar || "/teacher-avatar.jpg",
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
      fullName: user?.name || "Phan Ngọc Anh",
      birthDate: "2025-08-25",
      gender: "male",
      avatar: user?.avatar || "/teacher-avatar.jpg",
    })
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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Thông tin cá nhân</h1>
      </div>

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
                          .map((n) => n[0])
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
                          .map((n) => n[0])
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
