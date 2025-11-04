"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ParentService } from "../../../../services/center-owner/parent-management/parent.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, UserPlus, Users } from "lucide-react"
import { isValidEmail, isValidPhone, sanitizeString } from "../../../../services/common/utils/validation.utils"
import { StudentFormSection } from "./StudentFormSection"
import { SchoolService } from "../../../../services/common/school/school.service"

interface CreateParentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface StudentData {
  fullName: string
  username: string
  email?: string
  studentCode?: string
  phone?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  birthDate?: string
  address?: string
  grade?: string
  schoolId: string
}

export function CreateParentModal({ isOpen, onClose, onSuccess }: CreateParentModalProps) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState< "with-students" | "parent-only" >("with-students")
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
    birthDate: ""
  })

  const [students, setStudents] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch schools for student selection
  const { data: schoolsData } = useQuery({
    queryKey: ["schools"],
    queryFn: () => SchoolService.getAllSchools(),
    staleTime: 5 * 60 * 1000
  })

  const schools = schoolsData?.data || []

  // Create parent only mutation
  const createParentMutation = useMutation({
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

  // Create parent with students mutation
  const createParentWithStudentsMutation = useMutation({
    mutationFn: ParentService.createParentWithStudents,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      queryClient.invalidateQueries({ queryKey: ["parent-status"] })
      
      // Show success with created accounts info
      const studentCount = response.data?.studentCount || 0
      toast.success(`Tạo thành công phụ huynh và ${studentCount} học sinh!`, {
        description: "Thông tin đăng nhập đã được tạo cho tất cả tài khoản."
      })
      
      handleClose()
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error?.message || "Có lỗi xảy ra khi tạo phụ huynh và học sinh"
      toast.error(message)
    }
  })

  const validateParentForm = (): boolean => {
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

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống"
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStudents = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (students.length === 0) {
        newErrors.students = "Vui lòng thêm ít nhất 1 học sinh"
        setErrors(newErrors)
        return false
    }

    students.forEach((student, index) => {
        // Validate fullName (required)
        const sanitizedName = sanitizeString(student.fullName)
        if (!sanitizedName) {
            newErrors[`students.${index}.fullName`] = "Họ và tên không được để trống"
        } else if (sanitizedName.length < 2) {
            newErrors[`students.${index}.fullName`] = "Họ và tên phải có ít nhất 2 ký tự"
        }

        // Validate username (required)
        const sanitizedUsername = sanitizeString(student.username)
        if (!sanitizedUsername) {
            newErrors[`students.${index}.username`] = "Username không được để trống"
        } else if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
            newErrors[`students.${index}.username`] = "Username phải từ 3-20 ký tự"
        } else if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
            newErrors[`students.${index}.username`] = "Username chỉ được chứa chữ, số và dấu gạch dưới"
        }

        // Validate studentCode (REQUIRED)
        // const sanitizedCode = student.studentCode?.trim().toUpperCase()
        // if (!sanitizedCode) {
        //     newErrors[`students.${index}.studentCode`] = "Mã học sinh không được để trống"
        // } else if (!/^[A-Z0-9]+$/.test(sanitizedCode)) {
        //     newErrors[`students.${index}.studentCode`] = "Mã học sinh chỉ được chứa chữ IN HOA và số"
        // } else if (sanitizedCode.length < 3) {
        //     newErrors[`students.${index}.studentCode`] = "Mã học sinh phải có ít nhất 3 ký tự"
        // }

        // Validate schoolId (required)
        if (!student.schoolId) {
            newErrors[`students.${index}.schoolId`] = "Vui lòng chọn trường học"
        }

        // Email validation (optional but if provided must be valid)
        if (student.email && student.email.trim() && !isValidEmail(student.email)) {
            newErrors[`students.${index}.email`] = "Email không hợp lệ"
        }

        // Phone validation (optional but if provided must be valid)
        if (student.phone && student.phone.trim() && !isValidPhone(student.phone)) {
            newErrors[`students.${index}.phone`] = "Số điện thoại không hợp lệ"
        }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate parent info
    if (!validateParentForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin phụ huynh")
      return
    }

    // Prepare parent data
    const parentData = {
      username: sanitizeString(formData.username),
      password: formData.password.trim(),
      fullName: sanitizeString(formData.fullName),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      birthDate: formData.birthDate || undefined
    }

    if (activeTab === "parent-only") {
      // Create parent only
      createParentMutation.mutate(parentData)
    } else {
      // Create parent with students
      if (!validateStudents()) {
        toast.error("Vui lòng kiểm tra lại thông tin học sinh")
        return
      }

      const submitData = {
        ...parentData,
        students: students.map(s => ({
          fullName: sanitizeString(s.fullName),
          username: sanitizeString(s.username),
          studentCode: s.studentCode.trim().toUpperCase(), // Convert to uppercase
          email: s.email?.trim() || undefined,
          phone: s.phone?.trim() || undefined,
          gender: s.gender || "OTHER",
          birthDate: s.birthDate || undefined,
          address: s.address?.trim() || undefined,
          grade: s.grade || undefined,
          schoolId: s.schoolId
        }))
      }

      createParentWithStudentsMutation.mutate(submitData)
    }
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
    setStudents([])
    setErrors({})
    setActiveTab("with-students")
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleErrorChange = (field: string, value: string) => {
    setErrors(prev => ({ ...prev, [field]: value }))
  }

  const isPending = createParentMutation.isPending || createParentWithStudentsMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tạo tài khoản phụ huynh mới
          </DialogTitle>
          <DialogDescription>
            Chọn tạo chỉ phụ huynh hoặc tạo kèm học sinh
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab}  onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-1">
            {/* <TabsTrigger value="parent-only" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Chỉ phụ huynh
            </TabsTrigger> */}
            <TabsTrigger value="with-students"  className="gap-2">
              <Users className="w-4 h-4" />
              Phụ huynh + Học sinh
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            <TabsContent value="parent-only" className="space-y-4">
              {/* Parent Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin phụ huynh</h3>
                
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">
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
                  <Label htmlFor="password">
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
                  <Label htmlFor="email">
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
                  <Label htmlFor="fullName">
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
                  <Label htmlFor="phone">
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

                {/* Gender & Birth Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="with-students" className="space-y-6">
              {/* Parent Form (same as above) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin phụ huynh</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username-with-students">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username-with-students"
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
                    <Label htmlFor="password-with-students">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password-with-students"
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email-with-students">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email-with-students"
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
                    <Label htmlFor="fullName-with-students">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName-with-students"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone-with-students">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone-with-students"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="0123456789"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender-with-students">Giới tính</Label>
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
                    <Label htmlFor="birthDate-with-students">Ngày sinh</Label>
                    <Input
                      id="birthDate-with-students"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Student Section */}
              <div className="border-t pt-6">
                <StudentFormSection
                  students={students}
                  onStudentsChange={setStudents}
                  errors={errors}
                  onErrorChange={handleErrorChange}
                  schools={schools}
                />
                {errors.students && (
                  <p className="text-sm text-red-500 mt-2">{errors.students}</p>
                )}
              </div>
            </TabsContent>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  activeTab === "parent-only" ? "Tạo phụ huynh" : "Tạo phụ huynh & học sinh"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
