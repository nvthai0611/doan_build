"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  Phone,
  Mail,
  User,
  Calendar,
  GraduationCap,
  Save,
  X,
} from "lucide-react"
import type { Teacher } from "../../types/teacher"
import type { CreateTeacherRequest } from "../../../../../services/center-owner/teacher-management/teacher.service"
import type { UseMutationResult } from "@tanstack/react-query"

interface GeneralInfoTabProps {
  teacher: Teacher
  accountStatus: boolean
  isVerified: boolean
  isEditDialogOpen: boolean
  editFormData: Partial<CreateTeacherRequest>
  updateTeacherMutation: UseMutationResult<any, Error, Partial<CreateTeacherRequest>, unknown>
  onAccountStatusToggle: () => void
  onEditEmployee: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  setEditFormData: (data: Partial<CreateTeacherRequest>) => void
  setIsEditDialogOpen: (open: boolean) => void
}

export default function GeneralInfoTab({
  teacher,
  accountStatus,
  isVerified,
  isEditDialogOpen,
  editFormData,
  updateTeacherMutation,
  onAccountStatusToggle,
  onEditEmployee,
  onSaveEdit,
  onCancelEdit,
  setEditFormData,
  setIsEditDialogOpen
}: GeneralInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gray-200 text-2xl">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>
                </div>
              </AvatarFallback>
            </Avatar>   
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{teacher.name}</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {teacher.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{teacher.phone}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{teacher.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{teacher.birthDate || "Chưa cập nhật"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onEditEmployee}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trạng thái tài khoản</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Trạng thái hoạt động</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {accountStatus ? "Tài khoản đang hoạt động" : "Tài khoản đã bị khóa"}
              </p>
            </div>
            <Switch
              checked={accountStatus}
              onCheckedChange={onAccountStatusToggle}
              disabled={updateTeacherMutation.isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Xác thực tài khoản</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isVerified ? "Đã xác thực" : "Chưa xác thực"}
              </p>
            </div>
            <Badge variant={isVerified ? "default" : "secondary"}>
              {isVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Professional Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thông tin chuyên môn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Môn dạy</Label>
            <div className="mt-1">
              {teacher.subjects && teacher.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa cập nhật</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Lương cơ bản</Label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {teacher.salary ? `${teacher.salary.toLocaleString()} VNĐ` : "Chưa cập nhật"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Ngày kết thúc hợp đồng</Label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {teacher.contractEnd || "Chưa cập nhật"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin giáo viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={editFormData?.fullName || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData?.email || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={editFormData?.phone || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={editFormData?.role || ""}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, role: value as "teacher" | "admin" | "center_owner" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Giáo viên</SelectItem>
                    {/* <SelectItem value="admin">Giáo vụ</SelectItem> */}
                    <SelectItem value="center_owner">Chủ trung tâm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="isActive">Trạng thái hoạt động</Label>
              <div className="mt-2">
                <Switch
                  checked={editFormData?.isActive || false}
                  onCheckedChange={(checked) =>
                    setEditFormData({ ...editFormData, isActive: checked })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onCancelEdit}
                disabled={updateTeacherMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                onClick={onSaveEdit}
                disabled={updateTeacherMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateTeacherMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
