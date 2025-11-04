"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Search, Check, AlertCircle, User, Mail, Phone, Calendar, MapPin, GraduationCap, FileText, Upload } from "lucide-react"
import { toast } from "sonner"
import { centerOwnerStudentService } from "../../../../services/center-owner/student-management/student.service"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"

interface CreateStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CreateStudentFormData {
  fullName: string
  username: string
  phone: string
  gender: "MALE" | "FEMALE" | "OTHER" | ""
  birthDate: string
  address: string
  grade: string
  parentEmail: string  // Keep this for form input (search field)
  schoolId: string
  password: string
  applicationFile: File | null  // Đơn xin học thêm
  subjectIds: string[]  // Các môn học được chọn
}

interface ParentInfo {
  id: string
  user: {
    id: string
    fullName: string
    email: string
    phone: string
    isActive: boolean
  }
  students: Array<{
    id: string
    studentCode: string
    user: {
      fullName: string
      email: string
    }
  }>
}

export function CreateStudentModal({ isOpen, onClose, onSuccess }: CreateStudentModalProps) {
  const queryClient = useQueryClient()

  // Fetch schools list
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => centerOwnerStudentService.getSchools(),
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch subjects list
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await fetch('/api/shared/public/classes/subjects')
      if (!response.ok) throw new Error('Failed to fetch subjects')
      const data = await response.json()
      return data.data || []
    },
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  })

  const [formData, setFormData] = useState<CreateStudentFormData>({
    fullName: "",
    username: "",
    phone: "",
    gender: "",
    birthDate: "",
    address: "",
    grade: "",
    parentEmail: "",
    schoolId: "",
    password: "",
    applicationFile: null,
    subjectIds: []
  })

  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null)
  const [parentSearchLoading, setParentSearchLoading] = useState(false)
  const [parentSearched, setParentSearched] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<CreateStudentFormData>>({})

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: (data: any) => centerOwnerStudentService.createStudentAccount(data),
    onSuccess: (response) => {
      toast.success("Tạo tài khoản học viên thành công!")
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student-count-by-status'] })
      resetForm()
      onClose()
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi tạo tài khoản học viên'
      toast.error(errorMessage)
    }
  })

  // Search parent by email
  const searchParentByEmail = async (email: string) => {
    if (!email.trim()) {
      setParentInfo(null)
      setParentSearched(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Email không đúng định dạng")
      return
    }

    setParentSearchLoading(true)
    try {
      const response = await centerOwnerStudentService.findParentByEmail(email)
      
      setParentInfo(response)
      setParentSearched(true)
      
      if (response) {
        toast.success("Tìm thấy thông tin phụ huynh!")
      } else {
        toast.info("Không tìm thấy phụ huynh với email này")
      }
    } catch (error: any) {
      toast.error("Có lỗi khi tìm kiếm phụ huynh")
      setParentInfo(null)
      setParentSearched(true)
    } finally {
      setParentSearchLoading(false)
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CreateStudentFormData> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ tên là bắt buộc"
    }

    if (!formData.username.trim()) {
      errors.username = "Username là bắt buộc"
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(formData.username)) {
        errors.username = "Username chỉ chứa chữ cái, số và dấu gạch dưới, từ 3-20 ký tự"
      }
    }

    if (!formData.schoolId) {
      errors.schoolId = "Vui lòng chọn trường học"
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ"
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

    // Prepare FormData for file upload
    const formDataToSend = new FormData()
    
    // Add all fields
    formDataToSend.append('fullName', formData.fullName)
    formDataToSend.append('username', formData.username)
    formDataToSend.append('schoolId', formData.schoolId)
    
    if (formData.gender) formDataToSend.append('gender', formData.gender)
    if (formData.phone) formDataToSend.append('phone', formData.phone)
    if (formData.birthDate) formDataToSend.append('birthDate', formData.birthDate)
    if (formData.address) formDataToSend.append('address', formData.address)
    if (formData.grade) formDataToSend.append('grade', formData.grade)
    if (formData.password) formDataToSend.append('password', formData.password)
    if (parentInfo?.id) formDataToSend.append('parentId', parentInfo.id)
    
    // Add subjectIds as JSON array
    if (formData.subjectIds.length > 0) {
      formDataToSend.append('subjectIds', JSON.stringify(formData.subjectIds))
    }
    
    // Add application file if exists
    if (formData.applicationFile) {
      formDataToSend.append('applicationFile', formData.applicationFile)
    }

    createStudentMutation.mutate(formDataToSend)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      username: "",
      phone: "",
      gender: "",
      birthDate: "",
      address: "",
      grade: "",
      parentEmail: "",
      schoolId: "",
      password: "",
      applicationFile: null,
      subjectIds: []
    })
    setParentInfo(null)
    setParentSearched(false)
    setFormErrors({})
  }

  // Handle input change
  const handleInputChange = (field: keyof CreateStudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB")
        return
      }
      
      // Validate file type (PDF, JPG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file PDF, JPG hoặc PNG")
        return
      }
      
      setFormData(prev => ({ ...prev, applicationFile: file }))
      toast.success("Đã chọn file: " + file.name)
    }
  }

  // Remove file
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, applicationFile: null }))
  }

  // Handle subject selection
  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }))
  }

  // Handle parent email change with debounce
  useEffect(() => {
    if (formData.parentEmail && formData.parentEmail !== parentInfo?.user?.email) {
      const timer = setTimeout(() => {
        searchParentByEmail(formData.parentEmail)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.parentEmail])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Tạo tài khoản học viên mới
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
                  placeholder="Nhập họ và tên học viên"
                  className={formErrors.fullName ? "border-red-500" : ""}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-500">{formErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="student001"
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500">{formErrors.username}</p>
                )}
                <p className="text-xs text-gray-500">
                  Chỉ sử dụng chữ cái, số và dấu gạch dưới, từ 3-20 ký tự
                </p>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0123456789"
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select value={formData.gender} onValueChange={(value: any) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
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

              <div className="space-y-2">
                <Label htmlFor="grade">Lớp</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  placeholder="VD: 10A1, 11B2..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Nhập địa chỉ chi tiết"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Thông tin tài khoản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu (tùy chọn)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mặc định: 123456"
                />
                <p className="text-xs text-gray-500">
                  Để trống để sử dụng mật khẩu mặc định: 123456
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin phụ huynh (tùy chọn)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email phụ huynh</Label>
              <div className="relative">
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="parent@example.com"
                />
                {parentSearchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Nhập email phụ huynh để tự động liên kết (nếu có trong hệ thống)
              </p>
            </div>

            {/* Parent Search Result */}
            {parentSearched && (
              <div className="mt-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                {parentInfo ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Tìm thấy phụ huynh</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Họ tên:</strong> {parentInfo.user.fullName}</p>
                      <p><strong>Email:</strong> {parentInfo.user.email}</p>
                      {parentInfo.user.phone && (
                        <p><strong>SĐT:</strong> {parentInfo.user.phone}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <strong>Trạng thái:</strong>
                        <Badge variant={parentInfo.user.isActive ? "default" : "secondary"}>
                          {parentInfo.user.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                      </div>
                      {parentInfo.students.length > 0 && (
                        <div>
                          <strong>Con em đang học:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            {parentInfo.students.map((student) => (
                              <li key={student.id} className="text-xs">
                                • {student.user.fullName} ({student.studentCode})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Không tìm thấy phụ huynh với email này</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Application File Upload & Subject Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Đơn xin học thêm (tùy chọn)
            </h3>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label>Các môn học muốn đăng ký</Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                {subjectsLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải danh sách môn học...</p>
                ) : subjectsData && subjectsData.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjectsData.map((subject: any) => (
                      <div
                        key={subject.id}
                        onClick={() => handleSubjectToggle(subject.id)}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${formData.subjectIds.includes(subject.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                          ${formData.subjectIds.includes(subject.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {formData.subjectIds.includes(subject.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{subject.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có môn học nào</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Chọn các môn học mà học sinh muốn đăng ký
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="applicationFile">Tải lên đơn xin học</Label>
              <div className="space-y-3">
                {!formData.applicationFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Input
                      id="applicationFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="applicationFile"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Nhấn để chọn file
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG (tối đa 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                    <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {formData.applicationFile.name}
                      </p>
                      <p className="text-xs text-green-700">
                        {(formData.applicationFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Tải lên đơn xin học thêm của học sinh (nếu có). File sẽ được lưu vào hệ thống cùng với các môn học đã chọn.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createStudentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createStudentMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </div>
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}