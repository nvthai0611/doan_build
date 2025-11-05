"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ParentService } from "../../../../services/center-owner/parent-management/parent.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Search, X, Link, Unlink } from "lucide-react"
import { isValidEmail, isValidPhone, sanitizeString } from "../../../../services/common/utils/validation.utils"

interface EditParentModalProps {
  isOpen: boolean
  onClose: () => void
  parentId: string | null
  parentData?: any
}

export function EditParentModal({ isOpen, onClose, parentId, parentData }: EditParentModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("info")
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    relationshipType: "OTHER" as "FATHER" | "MOTHER" | "OTHER"
  })

  // Student search state
  const [studentCode, setStudentCode] = useState("")
  const [searchedStudent, setSearchedStudent] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && parentData) {
      setFormData({
        fullName: parentData.user?.fullName || "",
        email: parentData.user?.email || "",
        phone: parentData.user?.phone || "",
        relationshipType: parentData.relationshipType || "OTHER"
      })
    }
  }, [isOpen, parentData])

  // Update parent mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => ParentService.updateParent(parentId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-detail"] })
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      toast.success("Cập nhật thông tin phụ huynh thành công!")
      handleClose()
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật"
      toast.error(message)
    }
  })

  // Link student mutation
  const linkStudentMutation = useMutation({
    mutationFn: (studentId: string) => ParentService.linkStudentToParent(parentId!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      queryClient.invalidateQueries({ queryKey: ["parent-detail"] })
      toast.success("Liên kết học sinh thành công!")
      setStudentCode("")
      setSearchedStudent(null)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi liên kết học sinh"
      toast.error(message)
    }
  })

  // Unlink student mutation
  const unlinkStudentMutation = useMutation({
    mutationFn: (studentId: string) => ParentService.unlinkStudentFromParent(parentId!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      queryClient.invalidateQueries({ queryKey: ["parent-detail"] })
      toast.success("Hủy liên kết học sinh thành công!")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi hủy liên kết"
      toast.error(message)
    }
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // FullName validation
    if (formData.fullName) {
      const sanitizedFullName = sanitizeString(formData.fullName)
      if (!sanitizedFullName) {
        newErrors.fullName = "Họ và tên không được để trống"
      } else if (sanitizedFullName.length < 2) {
        newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự"
      }
    }

    // Email validation
    if (formData.email) {
      if (!isValidEmail(formData.email)) {
        newErrors.email = "Email không hợp lệ (VD: example@gmail.com)"
      }
    }

    // Phone validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)"
    }

    // RelationshipType validation
    if (!formData.relationshipType || !["FATHER", "MOTHER", "OTHER"].includes(formData.relationshipType)) {
      newErrors.relationshipType = "Mối quan hệ không hợp lệ"
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
      fullName: formData.fullName ? sanitizeString(formData.fullName) : undefined,
      email: formData.email ? formData.email.trim() : undefined,
      phone: formData.phone ? formData.phone.trim() : undefined,
      relationshipType: formData.relationshipType
    }

    updateMutation.mutate(submitData)
  }

  const handleSearchStudent = async () => {
    if (!studentCode.trim()) {
      toast.error("Vui lòng nhập mã học sinh")
      return
    }

    setIsSearching(true)
    try {
      const result = await ParentService.searchStudentByCode(studentCode.trim())
      setSearchedStudent(result)
      toast.success("Tìm thấy học sinh!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không tìm thấy học sinh")
      setSearchedStudent(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLinkStudent = () => {
    if (!searchedStudent) return
    linkStudentMutation.mutate(searchedStudent.id)
  }

  const handleUnlinkStudent = (studentId: string) => {
    unlinkStudentMutation.mutate(studentId)
  }

  const handleClose = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      relationshipType: "OTHER"
    })
    setErrors({})
    setStudentCode("")
    setSearchedStudent(null)
    setActiveTab("info")
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (!parentId) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Chỉnh sửa thông tin phụ huynh</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin hoặc quản lý học sinh của phụ huynh
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="students">Quản lý học sinh</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="example@gmail.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Số điện thoại
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


              {/* Relationship Type */}
              <div className="space-y-2">
                <Label htmlFor="relationshipType" className="text-sm font-medium">
                  Mối quan hệ <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.relationshipType}
                  onValueChange={(value: "FATHER" | "MOTHER" | "OTHER") => 
                    handleInputChange("relationshipType", value)
                  }
                >
                  <SelectTrigger className={errors.relationshipType ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FATHER">Bố</SelectItem>
                    <SelectItem value="MOTHER">Mẹ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
                {errors.relationshipType && (
                  <p className="text-sm text-red-500">{errors.relationshipType}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab 2: Student Management */}
          <TabsContent value="students" className="space-y-4 mt-4">
            {/* Search Student Section */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-3">Tìm và liên kết học sinh</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã học sinh (VD: HV000001)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
                />
                <Button
                  onClick={handleSearchStudent}
                  disabled={isSearching}
                  variant="outline"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Searched Student Result */}
              {searchedStudent && (
                <div className="mt-4 border rounded-lg p-3 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{searchedStudent.user?.fullName}</p>
                      <p className="text-sm text-gray-500">
                        Mã: {searchedStudent.studentCode} | Lớp: {searchedStudent.grade}
                      </p>
                      {searchedStudent.parent && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Đã có phụ huynh: {searchedStudent.parent.user?.fullName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleLinkStudent}
                        disabled={linkStudentMutation.isPending || !!searchedStudent.parent}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Link className="w-4 h-4 mr-1" />
                        Liên kết
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchedStudent(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Students List */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Học sinh hiện tại</h3>
              {parentData?.students && parentData.students.length > 0 ? (
                <div className="space-y-2">
                  {parentData.students.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div>
                        <p className="font-medium">{student.user?.fullName}</p>
                        <p className="text-sm text-gray-500">Mã: {student.studentCode}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnlinkStudent(student.id)}
                        disabled={unlinkStudentMutation.isPending}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Unlink className="w-4 h-4 mr-1" />
                        Hủy liên kết
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có học sinh nào được liên kết
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
