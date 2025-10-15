"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ParentService } from "../../../../services/center-owner/parent-management/parent.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { isValidEmail, isValidPhone, sanitizeString } from "../../../../services/common/utils/validation.utils"

interface CreateParentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateParentModal({ isOpen, onClose, onSuccess }: CreateParentModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
    birthDate: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Create parent mutation
  const createMutation = useMutation({
    mutationFn: ParentService.createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      queryClient.invalidateQueries({ queryKey: ["parent-status"] })
      toast.success("Tạo phụ huynh thành công!")
      handleClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error?.message || "Có lỗi xảy ra khi tạo phụ huynh"
      toast.error(message)
    }
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Username validation
    const sanitizedUsername = sanitizeString(formData.username)
    if (!sanitizedUsername) {
      newErrors.username = "Username không được để trống"
    } else if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
      newErrors.username = "Username phải từ 3-20 ký tự"
    } else if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      newErrors.username = "Username chỉ được chứa chữ, số và dấu gạch dưới"
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu không được để trống"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    // FullName validation
    const sanitizedFullName = sanitizeString(formData.fullName)
    if (!sanitizedFullName) {
      newErrors.fullName = "Họ và tên không được để trống"
    } else if (sanitizedFullName.length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự"
    }

    // Phone validation (required)
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống"
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    const submitData = {
      ...formData,
      username: sanitizeString(formData.username),
      fullName: sanitizeString(formData.fullName),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      birthDate: formData.birthDate || undefined
    }

    createMutation.mutate(submitData)
  }

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      gender: "OTHER",
      birthDate: ""
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tạo tài khoản phụ huynh mới</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để tạo tài khoản phụ huynh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="username123"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="parent@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="0123456789"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Gender & Birth Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">
                Giới tính
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "MALE" | "FEMALE" | "OTHER") => 
                  handleInputChange("gender", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-sm font-medium">
                Ngày sinh
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo phụ huynh"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
