"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Info } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../../services"

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface ChildFormData {
  fullName: string
  gender: "MALE" | "FEMALE" | "OTHER" | ""
  birthDate: string
  schoolId: string
}

export function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const queryClient = useQueryClient()

  // Fetch schools list
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => parentChildService.getSchools(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const [formData, setFormData] = useState<ChildFormData>({
    fullName: "",
    gender: "",
    birthDate: "",
    schoolId: ""
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [lastGeneratedUsername, setLastGeneratedUsername] = useState<string>("")

  // Create student mutation
  const createChildMutation = useMutation({
    mutationFn: (data: any) => parentChildService.addChild(data),
    onSuccess: (response) => {
      const username = response?.data?.user?.username || response?.data?.username || response?.username || lastGeneratedUsername
      toast.success(`Thêm con thành công!${username ? ` Username: ${username}` : ''}`)
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
      resetForm()
      onClose()
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi thêm con'
      toast.error(errorMessage)
    }
  })

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc"
    }

    if (!formData.gender) {
      errors.gender = "Vui lòng chọn giới tính"
    }

    if (!formData.birthDate) {
      errors.birthDate = "Vui lòng chọn ngày sinh"
    }

    if (!formData.schoolId) {
      errors.schoolId = "Vui lòng chọn trường học"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    // Prepare FormData for API call
    // Parent info will be automatically determined by backend based on logged-in user
    const formDataToSend = new FormData()
    
    formDataToSend.append('fullName', formData.fullName)
    formDataToSend.append('schoolId', formData.schoolId)
    formDataToSend.append('gender', formData.gender)
    formDataToSend.append('birthDate', formData.birthDate)
    formDataToSend.append('password', '123456') // Default password

    createChildMutation.mutate(formDataToSend)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      gender: "",
      birthDate: "",
      schoolId: ""
    })
    setFormErrors({})
  }

  // Handle input change
  const handleInputChange = (field: keyof ChildFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Thêm con mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className={formErrors.fullName ? "border-red-500" : ""}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-500">{formErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Ngày sinh <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  className={formErrors.birthDate ? "border-red-500" : ""}
                />
                {formErrors.birthDate && (
                  <p className="text-sm text-red-500">{formErrors.birthDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Giới tính <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(value: any) => handleInputChange("gender", value)}>
                  <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Nam</SelectItem>
                    <SelectItem value="FEMALE">Nữ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <p className="text-sm text-red-500">{formErrors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolId">
                  Trường học <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.schoolId} onValueChange={(value) => handleInputChange("schoolId", value)}>
                  <SelectTrigger className={formErrors.schoolId ? "border-red-500" : ""}>
                    <SelectValue placeholder={schoolsLoading ? "Đang tải..." : "Chọn trường học"} />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolsLoading ? (
                      <SelectItem value="loading" disabled>Đang tải danh sách trường...</SelectItem>
                    ) : schoolsData && schoolsData.length > 0 ? (
                      schoolsData.map((school: any) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-schools" disabled>Không có dữ liệu trường học</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formErrors.schoolId && (
                  <p className="text-sm text-red-500">{formErrors.schoolId}</p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Thông tin tài khoản tự động</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Username sẽ được tạo tự động theo tài khoản của bạn</li>
                    <li>Mật khẩu mặc định: <strong>123456</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createChildMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createChildMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang thêm...
                </div>
              ) : (
                "Thêm con"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
