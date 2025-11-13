import React, { useState, useEffect } from "react" // Added useEffect
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Calendar, Undo, Check, Sparkles, MapPin, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { schoolService, SchoolOption } from "../../../../services/common"
import { centerOwnerTeacherService } from "../../../../services/center-owner/teacher-management/teacher.service"
import { MultiSelect, MultiSelectOption } from "../../../../components/ui/multi-select"
import {apiClient} from "../../../../utils/clientAxios"

export default function AddEmployee() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    role: "teacher", // Set mặc định là giáo viên
    username: "",
    email: "",
    phone: "",
    school: "",
    schoolName: "",
    schoolAddress: "",
    subjects: [] as string[], // Thêm field cho chuyên môn (mảng tên môn học)
    contractImage: null as File | null, // Thêm field cho ảnh hợp đồng
    status: true,
    notes: ""
  })

  // State để quản lý danh sách trường học local
  const [localSchools, setLocalSchools] = useState<SchoolOption[]>([])

  // State để quản lý validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // --- NEW: State for submission loading ---
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- NEW: State for image preview URL ---
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // --- NEW: Effect for cleaning up image preview URL ---
  useEffect(() => {
    // This is a cleanup function that runs when the component unmounts
    // or when imagePreviewUrl changes
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])


  // Convert any school data to SchoolOption
  const convertToSchoolOption = (school: any): SchoolOption => ({
    value: school.name || school.label || school.value,
    label: school.name || school.label || school.value,
    description: school.address || school.description
  })

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate name
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên nhân viên là bắt buộc'
    }

    // Validate gender
    if (!validateRequired(formData.gender)) {
      newErrors.gender = 'Giới tính là bắt buộc'
    }

    // Validate birthDate
    if (!validateRequired(formData.birthDate)) {
      newErrors.birthDate = 'Ngày sinh là bắt buộc'
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18 || age > 65) {
        newErrors.birthDate = 'Tuổi phải từ 18 đến 65'
      }
    }

    // Role is always "teacher" - no validation needed

    // Validate username
    if (!validateRequired(formData.username)) {
      newErrors.username = 'Tên đăng nhập là bắt buộc'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    // Validate email
    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Validate phone
    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số'
    }

    // Validate school
    if (!validateRequired(formData.school)) {
      newErrors.school = 'Trường học là bắt buộc'
    }

    // Validate subjects
    if (!formData.subjects || formData.subjects.length === 0) {
      newErrors.subjects = 'Chuyên môn (Môn học) là bắt buộc'
    }

    // // Validate contract image
    // if (!formData.contractImage) {
    //   newErrors.contractImage = 'Ảnh hợp đồng là bắt buộc'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Mock data fallback
  const mockSchools: SchoolOption[] = [
    { value: "THPT Nguyễn Huệ", label: "THPT Nguyễn Huệ", description: "123 Nguyễn Huệ, Quận 1, TP.HCM" },
    { value: "THPT Lê Lợi", label: "THPT Lê Lợi", description: "456 Lê Lợi, Quận 1, TP.HCM" },
    { value: "THPT Điện Biên Phủ", label: "THPT Điện Biên Phủ", description: "789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM" },
    // ... (rest of mock schools)
  ]

  // TanStack Query for fetching schools
  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    error: schoolsError
  } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      try {
        const response = await schoolService.getAllSchools()
        return response.data?.map(convertToSchoolOption) || []
      } catch (error) {
        console.error('Error fetching schools:', error)
        // Return mock data on error
        return mockSchools
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  // TanStack Query for fetching subjects
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects')
      return response
    },
  })

  // Cập nhật localSchools khi có data từ API
  React.useEffect(() => {
    if (schoolsData) {
      setLocalSchools(schoolsData)
    }
  }, [schoolsData])

  // Sử dụng localSchools thay vì schoolsData để có thể thêm trường mới
  const schools = localSchools.length > 0 ? localSchools : mockSchools

  // Convert subjects data sang MultiSelectOption
  const subjectOptions: any[] = React.useMemo(() => {
    if (!subjectsData?.data) return []
    return (subjectsData.data as any[]).map((subject: any) => ({
      value: subject.name,
      label: subject.name,
      description: subject.description
    }))
  }, [subjectsData])

  const handleAddSchool = (name: string, address?: string) => {
    // Tạo SchoolOption mới
    const newSchool: SchoolOption = {
      value: name,
      label: name,
      description: address || ''
    }

    // Thêm vào danh sách localSchools
    setLocalSchools(prev => [...prev, newSchool])

    // Cập nhật form data
    setFormData(prev => ({
      ...prev,
      school: name,
      schoolName: name,
      schoolAddress: address || ''
    }))

    toast.success(`Đã thêm trường học "${name}" vào danh sách`)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Nếu chọn trường từ dropdown, cập nhật thêm schoolName và schoolAddress
      if (field === 'school' && value) {
        const selectedSchool = schools.find((school: any) => school.value === value)
        if (selectedSchool) {
          newData.schoolName = selectedSchool.label
          newData.schoolAddress = selectedSchool.description || ''
        }
      }

      return newData
    })

    // Clear error khi user nhập
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }


  // Test function để kiểm tra kết nối
  const testConnection = async () => {
    try {
      console.log("Testing connection to backend...");
      const response = await fetch('http://localhost:9999/api/v1/admin-center/teachers/test');
      const data = await response.json();
      console.log("Test response:", data);
      toast.success("Kết nối backend thành công!");
    } catch (error) {
      console.error("Test connection failed:", error);
      toast.error("Không thể kết nối đến backend!");
    }
  };

  // --- MODIFIED: handleSubmit with loading state ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập")
      return
    }

    setIsSubmitting(true) // Set loading state

    try {
      // Validate required fields trước khi gửi
      if (!formData.email || !formData.name || !formData.username) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
        return // Return early, but need to reset loading state
      }

      const teacherData = {
        email: formData.email.trim(),
        fullName: formData.name.trim(),
        username: formData.username.trim(),
        phone: formData.phone?.trim() || "",
        gender: formData.gender,
        birthDate: formData.birthDate,
        role: "teacher" as const, // Always teacher
        isActive: formData.status,  
        schoolName: formData.schoolName.trim(),
        schoolAddress: formData.schoolAddress?.trim(),
        subjects: formData.subjects || [], // Thêm mảng subjects
        notes: formData.notes.trim()
      }
      let response
      // Gửi FormData với ảnh hợp đồng
      if (formData.contractImage) {
        const formDataToSend = new FormData()
        // Thêm các field text
        formDataToSend.append('email', teacherData.email)
        formDataToSend.append('fullName', teacherData.fullName)
        formDataToSend.append('username', teacherData.username)
        formDataToSend.append('phone', teacherData.phone)
        formDataToSend.append('gender', teacherData.gender)
        formDataToSend.append('birthDate', teacherData.birthDate)
        formDataToSend.append('role', teacherData.role)
        formDataToSend.append('isActive', teacherData.isActive.toString()) // Convert boolean to string
        formDataToSend.append('schoolName', teacherData.schoolName)
        formDataToSend.append('schoolAddress', teacherData.schoolAddress)
        // Append each subject separately for FormData
        if (Array.isArray(teacherData.subjects) && teacherData.subjects.length > 0) {
          teacherData.subjects.forEach((subject: string) => {
            formDataToSend.append('subjects[]', subject)
          })
        }
        if (teacherData.notes) {
          formDataToSend.append('notes', teacherData.notes)
        }
        formDataToSend.append('contractImage', formData.contractImage)
        response = await centerOwnerTeacherService.createTeacher(formDataToSend as any)
      } else {
        response = await centerOwnerTeacherService.createTeacher(teacherData)
      }
      toast.success("Thêm giáo viên thành công!")
      navigate("/center-qn/teachers")
    } catch (error: any) {
      // Ensure error message is always a string
      let errorMessage = "Có lỗi xảy ra khi thêm giáo viên"
      
      try {
        // Handle validation errors from backend
        if (error.response?.data) {
          const errorData = error.response.data
          
          // Check if message is an array (backend format: message: [{ field: "error" }])
          if (Array.isArray(errorData.message)) {
            const messages = errorData.message
              .map((item: any) => {
                if (typeof item === 'string') {
                  return item
                } else if (typeof item === 'object' && item !== null) {
                  // Extract key-value pairs from object
                  return Object.entries(item)
                    .map(([key, value]) => {
                      const fieldName = key === 'subjects' ? 'Chuyên môn' : key
                      return `${fieldName}: ${value}`
                    })
                    .join(', ')
                }
                return String(item)
              })
              .filter(Boolean)
              .join('; ')
            errorMessage = messages || errorMessage
          }
          // Check if it's a validation error with multiple fields (errors object)
          else if (errorData.errors && typeof errorData.errors === 'object') {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]: [string, any]) => {
                const fieldName = field === 'subjects' ? 'Chuyên môn' : field
                const msgArray = Array.isArray(messages) 
                  ? messages.map(m => typeof m === 'string' ? m : String(m))
                  : [typeof messages === 'string' ? messages : String(messages)]
                return `${fieldName}: ${msgArray.join(', ')}`
              })
              .join('; ')
            errorMessage = errorMessages || errorMessage
          } 
          // Handle string message
          else if (errorData.message) {
            errorMessage = typeof errorData.message === 'string' 
              ? errorData.message 
              : String(errorData.message)
          } 
          // Handle string errorData
          else if (typeof errorData === 'string') {
            errorMessage = errorData
          } 
          // Fallback: convert object to string
          else {
            errorMessage = JSON.stringify(errorData)
          }
        } else if (error.message) {
          errorMessage = typeof error.message === 'string' 
            ? error.message 
            : String(error.message)
        }
      } catch (parseError) {
        // Fallback to default message if parsing fails
        console.error('Error parsing error response:', parseError)
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false) // Unset loading state regardless of outcome
    }
  }

  console.log(formData);
  
  const handleCancel = () => {
    navigate("/center-qn/teachers")
  }

  // --- MODIFIED: Handle file upload with preview ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Chỉ được upload file ảnh (JPG, PNG, GIF)')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error('Kích thước file không được vượt quá 5MB')
        return
      }

      // Revoke the old preview URL if it exists
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }

      // Create a new preview URL
      const newPreviewUrl = URL.createObjectURL(file)
      setImagePreviewUrl(newPreviewUrl)

      setFormData(prev => ({
        ...prev,
        contractImage: file
      }))

      // Clear error khi upload thành công
      if (errors.contractImage) {
        setErrors(prev => ({
          ...prev,
          contractImage: ''
        }))
      }

      toast.success('Upload ảnh hợp đồng thành công')
    }
  }

  // Helper component để hiển thị error message
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
    ) : null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Thêm mới nhân viên</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/center-qn" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/center-qn/teachers" className="text-muted-foreground hover:text-foreground">
                    Danh sách nhân viên
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Thêm mới nhân viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
              <Undo className="w-4 h-4" />
            </Button>
            {/* --- MODIFIED: Submit Button with loading state --- */}
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Card className=" mx-auto">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - General Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Thông tin chung</h2>
                {/* Employee Name */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="name">Tên nhân viên <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên nhân viên"
                    required
                    className={errors.name ? "border-red-500" : ""}
                  />
                  <ErrorMessage field="name" />
                </div>

                {/* Gender */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="gender">Giới tính <span className="text-red-500">*</span></Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage field="gender" />
                </div>

                {/* Birth Date */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="birthDate">Ngày sinh <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className={errors.birthDate ? "border-red-500" : ""}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  <ErrorMessage field="birthDate" />
                </div>

                {/* Login Account Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-foreground">Tài khoản đăng nhập</h3>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        required
                        className={errors.username ? "border-red-500" : ""}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        @qn.edu.vn
                      </span>
                    </div>
                    <ErrorMessage field="username" />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email xác thực tài khoản <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Nhập email xác thực"
                      required
                      className={errors.email ? "border-red-500" : ""}
                    />
                    <ErrorMessage field="email" />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại xác thực tài khoản <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Nhập số điện thoại"
                      required
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    <ErrorMessage field="phone" />
                  </div>

                  {/* School */}
                  <div className="space-y-2">
                    <Label htmlFor="school">Trường học <span className="text-red-500">*</span></Label>
                    
                    <div className="relative">
                      <Combobox
                        options={schools}
                        value={formData.school}
                        onValueChange={(value) => handleInputChange("school", value)}
                        placeholder={schoolsLoading ? "Đang tải danh sách trường..." : "Chọn hoặc nhập tên trường học"}
                        searchPlaceholder="Tìm kiếm tên trường..."
                        emptyText={schoolsError ? "Lỗi tải danh sách trường học" : "Không tìm thấy trường học phù hợp"}
                        className={`w-full ${errors.school ? "border-red-500" : ""}`}
                        allowCustom={true}
                        onAddCustom={handleAddSchool}
                        customDialogTitle="Thêm trường học mới"
                        customDialogDescription="Nhập tên và địa chỉ của trường học mới"
                        disabled={schoolsLoading}
                      />
                      {schoolsLoading ? (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      )}
                    </div>
                    <ErrorMessage field="school" />
                    {schoolsError && (
                      <p className="text-sm text-red-500 mt-1">
                        {schoolsError instanceof Error ? schoolsError.message : 'Có lỗi xảy ra khi tải danh sách trường học'}
                      </p>
                    )}
                  </div>

                  {/* Subjects/Chuyên môn */}
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Chuyên môn (Môn học) <span className="text-red-500">*</span></Label>
                    <MultiSelect
                      options={subjectOptions}
                      selected={formData.subjects}
                      onChange={(selected) => handleInputChange("subjects", selected)}
                      placeholder={subjectsLoading ? "Đang tải danh sách môn học..." : "Chọn môn học"}
                      searchPlaceholder="Tìm kiếm môn học..."
                      emptyText="Không tìm thấy môn học"
                      disabled={subjectsLoading}
                      maxDisplay={3}
                    />
                    <ErrorMessage field="subjects" />
                    {formData.subjects.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Đã chọn {formData.subjects.length} môn học
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column - Status and Notes */}
            <div className="space-y-6">
              {/* --- MODIFIED: Contract Image Upload with Preview --- */}
              <div className="space-y-2">
                <Label htmlFor="contractImage">Ảnh hợp đồng</Label> 
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${errors.contractImage ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'}`}>
                  {formData.contractImage && imagePreviewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreviewUrl}
                        alt="Contract Preview"
                        className="max-h-48 w-auto mx-auto rounded-lg object-contain shadow-sm"
                      />
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium truncate max-w-xs" title={formData.contractImage.name}>
                          {formData.contractImage.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            // Revoke URL and clear state
                            if (imagePreviewUrl) {
                              URL.revokeObjectURL(imagePreviewUrl)
                              setImagePreviewUrl(null)
                            }
                            setFormData(prev => ({ ...prev, contractImage: null }))
                          }}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                          title="Xóa ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(formData.contractImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <label
                          htmlFor="contractImage"
                          className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Chọn ảnh hợp đồng
                        </label>
                        <input
                          id="contractImage"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, GIF (tối đa 5MB)
                      </p>
                    </div>
                  )}
                </div>
                <ErrorMessage field="contractImage" />
              </div>
              
              {/* Active Status */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Trạng thái hoạt động</h2>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(checked) => handleInputChange("status", checked)}
                  />
                  <Label className="text-sm font-medium">
                    {formData.status ? "Đang hoạt động" : "Dừng hoạt động"}
                  </Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Ghi chú</h2>
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.notes}
                    onChange={(value) => handleInputChange("notes", value)}
                    placeholder="Nhập ghi chú về nhân viên..."
                    style={{ height: '200px' }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'indent', 'align', 'link', 'image'
                    ]}
                    theme="snow"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}