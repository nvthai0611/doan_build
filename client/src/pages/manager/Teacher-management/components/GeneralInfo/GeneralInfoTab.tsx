"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { Edit, Phone, Mail, User, Calendar, Save, X, Check, Undo, RefreshCw, GraduationCap, BookOpen, Upload, Image as ImageIcon, MapPin, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import type { Teacher } from "../../types/teacher"
import type { CreateTeacherRequest } from "../../../../../services/center-owner/teacher-management/teacher.service"
import type { UseMutationResult } from "@tanstack/react-query"
import { useToast } from "../../../../../hooks/use-toast"
import { centerOwnerTeacherService } from "../../../../../services/center-owner/teacher-management/teacher.service"
import { schoolService, SchoolOption } from "../../../../../services/common"
import { toast as sonnerToast } from "sonner"
import { MultiSelect, MultiSelectOption } from "../../../../../components/ui/multi-select"
import {apiClient} from "../../../../../utils/clientAxios"

interface GeneralInfoTabProps {
  teacher: Teacher
  accountStatus: boolean
  isVerified: boolean
  updateTeacherMutation: UseMutationResult<any, Error, Partial<CreateTeacherRequest>, unknown>
  onAccountStatusToggle: () => void
}

export default function GeneralInfoTab({
  teacher,
  accountStatus,
  isVerified,
  updateTeacherMutation,
  onAccountStatusToggle,
}: GeneralInfoTabProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contractImageFile, setContractImageFile] = useState<File | null>(null)
  const [contractImagePreview, setContractImagePreview] = useState<string | null>(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  
  // Account settings dialog state
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [isAccountLoading, setIsAccountLoading] = useState(false)
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({})
  const [accountData, setAccountData] = useState({
    username: teacher.username || '',
    email: teacher.email || '',
    phone: teacher.phone || '',
  })
  
  // School selection state
  const [localSchools, setLocalSchools] = useState<SchoolOption[]>([])
  
  // Mock data fallback for schools
  const mockSchools: SchoolOption[] = [
    { value: "THPT Nguyễn Huệ", label: "THPT Nguyễn Huệ", description: "123 Nguyễn Huệ, Quận 1, TP.HCM" },
    { value: "THPT Lê Lợi", label: "THPT Lê Lợi", description: "456 Lê Lợi, Quận 1, TP.HCM" },
    { value: "THPT Điện Biên Phủ", label: "THPT Điện Biên Phủ", description: "789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM" },
  ]
  
  // Convert school data to SchoolOption
  const convertToSchoolOption = (school: any): SchoolOption => ({
    value: school.name || school.label || school.value,
    label: school.name || school.label || school.value,
    description: school.address || school.description
  })
  
  // Fetch schools from API
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
        return mockSchools
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
  
  // Update localSchools when data arrives
  useEffect(() => {
    if (schoolsData) {
      setLocalSchools(schoolsData)
    }
  }, [schoolsData])
  
  // Use localSchools or fallback to mockSchools
  const schools = localSchools.length > 0 ? localSchools : mockSchools
  
  // Fetch subjects from API
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const response = await apiClient.get('/subjects')
      return response
    },
  })
  
  // Convert subjects data to MultiSelectOption
  const subjectOptions: any[] = useMemo(() => {
    if (!subjectsData?.data) return []
    return (subjectsData.data as any[]).map((subject: any) => ({
      value: subject.name,
      label: subject.name,
      description: subject.description
    }))
  }, [subjectsData])
  
  // Get latest contract image from contractUploads
  const getLatestContractImage = (): string | null => {
    if (teacher.contractUploads && teacher.contractUploads.length > 0) {
      // Sort by uploadedAt and get the latest
      const sortedUploads = [...teacher.contractUploads].sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      return sortedUploads[0].uploadedImageUrl
    }
    return null
  }
  
  // Sync editData when teacher data changes
  useEffect(() => {
    const latestContractImage = getLatestContractImage()
    setEditData({
      fullName: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      username: teacher.username || '',
      role: teacher.role || 'teacher',
      isActive: teacher.status || true,
      notes: teacher.notes || '',
      contractImage: latestContractImage || '',
      schoolName: teacher.schoolName || teacher.school?.name || '',
      schoolAddress: teacher.schoolAddress || teacher.school?.address || '',
      subjects: teacher.subjects || [],
    })
    // Set preview to existing image
    setContractImagePreview(latestContractImage)
  }, [teacher])
  
  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (contractImagePreview && contractImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(contractImagePreview)
      }
    }
  }, [contractImagePreview])
  
  const [editData, setEditData] = useState<Partial<CreateTeacherRequest>>(() => {
    const latestContractImage = getLatestContractImage()
    return {
      fullName: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      username: teacher.username || '',
      role: teacher.role || 'teacher',
      isActive: teacher.status || false,
      notes: teacher.notes || '',
      contractImage: latestContractImage || '',
      schoolName: teacher.schoolName || teacher.school?.name || '',
      schoolAddress: teacher.schoolAddress || teacher.school?.address || '',
      subjects: teacher.subjects || [],
    }
  })
  // Validation functions
  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate fullName
    if (!validateRequired(editData.fullName || '')) {
      newErrors.fullName = 'Họ và tên là bắt buộc'
    }

    // Validate email
    if (!validateRequired(editData.email || '')) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!validateEmail(editData.email || '')) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Validate phone
    if (editData.phone && !validatePhone(editData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 số'
    }

    // Validate username
    if (!validateRequired(editData.username || '')) {
      newErrors.username = 'Username là bắt buộc'
    } else if ((editData.username || '').length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEdit = () => {
    setIsEditing(true)
    setErrors({}) // Clear errors when starting to edit
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file ảnh",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước ảnh không được vượt quá 5MB",
          variant: "destructive",
        })
        return
      }

      setContractImageFile(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setContractImagePreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setContractImageFile(null)
    if (contractImagePreview && contractImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(contractImagePreview)
    }
    setContractImagePreview(getLatestContractImage())
  }

  // Handle adding custom school
  const handleAddSchool = (name: string, address?: string) => {
    const newSchool: SchoolOption = {
      value: name,
      label: name,
      description: address || ''
    }

    setLocalSchools(prev => [...prev, newSchool])

    setEditData(prev => ({
      ...prev,
      schoolName: name,
      schoolAddress: address || ''
    }))

    sonnerToast.success(`Đã thêm trường học "${name}" vào danh sách`)
  }

  // Account settings handlers
  const handleOpenAccountDialog = () => {
    setAccountData({
      username: teacher.username || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
    })
    setAccountErrors({})
    setIsAccountDialogOpen(true)
  }

  const handleAccountInputChange = (field: string, value: string) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user types
    if (accountErrors[field]) {
      setAccountErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateAccountForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate username
    if (!validateRequired(accountData.username)) {
      newErrors.username = 'Tên đăng nhập là bắt buộc'
    } else if (accountData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    // Validate email
    if (!validateRequired(accountData.email)) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!validateEmail(accountData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Validate phone
    if (accountData.phone && !validatePhone(accountData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 số'
    }

    setAccountErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveAccountSettings = async () => {
    // Validate form
    if (!validateAccountForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      })
      return
    }

    // Check for changes
    const hasChanges = 
      accountData.username !== teacher.username ||
      accountData.email !== teacher.email ||
      accountData.phone !== teacher.phone

    if (!hasChanges) {
      toast({
        title: "Thông báo",
        description: "Dữ liệu chưa có gì thay đổi",
        variant: "default",
      })
      setIsAccountDialogOpen(false)
      return
    }

    setIsAccountLoading(true)
    try {
      // Only send changed fields
      const updateData: Partial<CreateTeacherRequest> = {}
      
      if (accountData.username !== teacher.username) {
        updateData.username = accountData.username
      }
      if (accountData.email !== teacher.email) {
        updateData.email = accountData.email
      }
      if (accountData.phone !== teacher.phone) {
        updateData.phone = accountData.phone
      }
      await updateTeacherMutation.mutateAsync(updateData)
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin tài khoản thành công",
      })
      
      setIsAccountDialogOpen(false)
    } catch (error: any) {
      console.error('Error updating account:', error)
      
      let errorMessage = "Có lỗi xảy ra khi cập nhật tài khoản"
      
      // Extract error message safely
      if (error.response?.data?.message) {
        const msg = error.response.data.message
        errorMessage = Array.isArray(msg) ? msg.join(', ') : String(msg)
      } else if (error.response?.message) {
        errorMessage = String(error.response.message)
      } else if (error.message) {
        errorMessage = String(error.message)
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAccountLoading(false)
    }
  }

  const handleCancelAccountDialog = () => {
    setAccountData({
      username: teacher.username || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
    })
    setAccountErrors({})
    setIsAccountDialogOpen(false)
  }

  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      })
      return
    }

    // Check for changes (KHÔNG check role vì không cho phép update)
    const subjectsChanged = JSON.stringify(editData.subjects || []) !== JSON.stringify(teacher.subjects || [])
    const hasChanges = 
      editData.fullName !== teacher.name ||
      editData.email !== teacher.email ||
      editData.phone !== teacher.phone ||
      editData.username !== teacher.username ||
      editData.notes !== (teacher.notes || '') ||
      contractImageFile !== null ||
      subjectsChanged

    if (!hasChanges) {
      toast({
        title: "Thông báo",
        description: "Dữ liệu chưa có gì thay đổi",
        variant: "default",
      })
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      // If there's a new image, send FormData with file
      if (contractImageFile) {
        const formData = new FormData()
        
        // Only add changed fields
        if (editData.fullName !== teacher.name) {
          formData.append('fullName', editData.fullName || '')
        }
        if (editData.email !== teacher.email) {
          formData.append('email', editData.email || '')
        }
        if (editData.phone !== teacher.phone) {
          formData.append('phone', editData.phone || '')
        }
        if (editData.username !== teacher.username) {
          formData.append('username', editData.username || '')
        }
        // KHÔNG gửi role vì backend không cho phép update role
        if (editData.notes !== (teacher.notes || '')) {
          formData.append('notes', editData.notes || '')
        }
        
        // Add school info if available
        if (editData.schoolName) {
          formData.append('schoolName', editData.schoolName)
        }
        if (editData.schoolAddress) {
          formData.append('schoolAddress', editData.schoolAddress)
        }
        
        // Add subjects if changed
        if (subjectsChanged) {
          formData.append('subjects', JSON.stringify(editData.subjects || []))
        }
        
        // Add contract image file
        formData.append('contractImage', contractImageFile)

        console.log('Sending FormData with image')
        
        // Update with FormData
        await centerOwnerTeacherService.updateTeacher(teacher.id, formData as any)
      } else {
        // No image update, send JSON data only for changed fields
        const updateData: Partial<CreateTeacherRequest> = {}
        
        if (editData.fullName !== teacher.name) {
          updateData.fullName = editData.fullName
        }
        if (editData.email !== teacher.email) {
          updateData.email = editData.email
        }
        if (editData.phone !== teacher.phone) {
          updateData.phone = editData.phone
        }
        if (editData.username !== teacher.username) {
          updateData.username = editData.username
        }
        // KHÔNG gửi role vì backend không cho phép update role
        if (editData.notes !== (teacher.notes || '')) {
          updateData.notes = editData.notes
        }
        
        // Add school info if available
        if (editData.schoolName) {
          updateData.schoolName = editData.schoolName
        }
        if (editData.schoolAddress) {
          updateData.schoolAddress = editData.schoolAddress
        }
        
        // Add subjects if changed
        if (subjectsChanged) {
          updateData.subjects = editData.subjects
        }

        console.log('Sending JSON update data:', updateData)

        // Update with JSON
        await updateTeacherMutation.mutateAsync(updateData)
      }
      
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin giáo viên thành công",
      })
      
      setIsEditing(false)
      setContractImageFile(null)
    } catch (error: any) {
      console.error('Error updating teacher:', error)
      
      let errorMessage = "Có lỗi xảy ra khi cập nhật giáo viên"
      
      // Extract error message safely
      if (error.response?.data?.message) {
        const msg = error.response.data.message
        errorMessage = Array.isArray(msg) ? msg.join(', ') : String(msg)
      } else if (error.response?.message) {
        errorMessage = String(error.response.message)
      } else if (error.message) {
        errorMessage = String(error.message)
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleCancel = () => {
    const latestContractImage = getLatestContractImage()
    setEditData({
      fullName: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      username: teacher.username || '',
      role: teacher.role || 'teacher',
      isActive: teacher.status || false,
      notes: teacher.notes || '',
      contractImage: latestContractImage || '',
      schoolName: teacher.schoolName || teacher.school?.name || '',
      schoolAddress: teacher.schoolAddress || teacher.school?.address || '',
    })
    setErrors({})
    setIsEditing(false)
    
    // Reset image state
    setContractImageFile(null)
    if (contractImagePreview && contractImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(contractImagePreview)
    }
    setContractImagePreview(latestContractImage)
  }

  // Helper component to display error message
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
    ) : null
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái - Avatar và Account Info */}
      <div className="lg:col-span-1 space-y-6">
        {/* Avatar Card */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar */}
              <Avatar className="w-32 h-32">
                <AvatarImage src={teacher.avatar || ''} />
                <AvatarFallback className="bg-gray-200 text-4xl">
                  {teacher.name?.charAt(0) || 'GV'}
                </AvatarFallback>
              </Avatar>

              {/* Trạng thái tài khoản */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Trạng thái tài khoản</span>
                  <Switch
                    checked={accountStatus}
                    onCheckedChange={onAccountStatusToggle}
                    disabled={updateTeacherMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin tài khoản đăng nhập */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Thông tin tài khoản đăng nhập
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-auto px-2 py-1"
                onClick={handleOpenAccountDialog}
              >
                <span className="text-blue-600 text-sm">Sửa</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Tên đăng nhập</Label>
              <p className="text-blue-600 font-medium mt-1">{teacher.username}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Số điện thoại xác thực</Label>
              <p className="text-blue-600 font-medium mt-1">{teacher.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Email xác thực</Label>
              <p className="text-blue-600 font-medium mt-1">{teacher.email}</p>
            </div>
          </CardContent>
        </Card>


 
      </div>

      {/* Cột phải - Thông tin chung */}
      <div className="lg:col-span-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Thông tin chung
              </CardTitle>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ tên */}
              <div>
                <Label className="text-sm text-gray-600">Họ tên</Label>
                {isEditing ? (
                  <>
                    <Input
                      value={editData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`mt-1 ${errors.fullName ? "border-red-500" : ""}`}
                      placeholder="Nhập họ và tên"
                    />
                    <ErrorMessage field="fullName" />
                  </>
                ) : (
                  <p className="text-base font-medium mt-1">{teacher.name}</p>
                )}
              </div>

              {/* Mã nhân viên */}
              <div>
                <Label className="text-sm text-gray-600">Mã nhân viên</Label>
                <p className="text-base font-medium mt-1">{teacher.code || 'Chưa có'}</p>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm text-gray-600">Email</Label>
                {isEditing ? (
                  <>
                    <Input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                      placeholder="Nhập email"
                    />
                    <ErrorMessage field="email" />
                  </>
                ) : (
                  <p className="text-base font-medium mt-1">{teacher.email}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <Label className="text-sm text-gray-600">Số điện thoại</Label>
                {isEditing ? (
                  <>
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
                      placeholder="Nhập số điện thoại"
                    />
                    <ErrorMessage field="phone" />
                  </>
                ) : (
                  <p className="text-base font-medium mt-1">{teacher.phone || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                  <div className="mt-1">
                    <Label className="text-sm text-gray-600">Nhóm quyền</Label> 
                    <div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {teacher.role === 'teacher' ? 'Giáo viên' : 
                       teacher.role === 'center_owner' ? 'Chủ trung tâm' : teacher.role}
                    </Badge>
                    </div>
                  </div>
              </div>

              {/* Trường học */}
              <div>
                <Label className="text-sm text-gray-600">Trường học</Label>
                {isEditing ? (
                  <div className="relative mt-1">
                    <Combobox
                      options={schools}
                      value={editData.schoolName || ''}
                      onValueChange={(value) => {
                        const selectedSchool = schools.find(school => school.value === value)
                        if (selectedSchool) {
                          setEditData(prev => ({
                            ...prev,
                            schoolName: selectedSchool.label,
                            schoolAddress: selectedSchool.description || ''
                          }))
                        }
                      }}
                      placeholder={schoolsLoading ? "Đang tải..." : "Chọn hoặc nhập trường học"}
                      searchPlaceholder="Tìm kiếm trường..."
                      emptyText={schoolsError ? "Lỗi tải danh sách" : "Không tìm thấy"}
                      className={`w-full ${errors.schoolName ? 'border-red-500' : ''}`}
                      allowCustom={true}
                      onAddCustom={handleAddSchool}
                      customDialogTitle="Thêm trường học mới"
                      customDialogDescription="Nhập tên và địa chỉ của trường học"
                      disabled={schoolsLoading}
                    />
                    {schoolsLoading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                    )}
                    {errors.schoolName && (
                      <p className="text-sm text-red-500 mt-1">{errors.schoolName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-medium mt-1">{teacher.schoolName || teacher.school?.name || 'Chưa cập nhật'}</p>
                )}
              </div>

              {/* Chuyên môn (Môn học) */}
              <div>
                <Label className="text-sm text-gray-600">Chuyên môn (Môn học)</Label>
                {isEditing ? (
                  <div className="mt-1">
                    <MultiSelect
                      options={subjectOptions}
                      selected={editData.subjects || []}
                      onChange={(selected) => handleInputChange('subjects', selected)}
                      placeholder={subjectsLoading ? "Đang tải danh sách môn học..." : "Chọn môn học"}
                      searchPlaceholder="Tìm kiếm môn học..."
                      emptyText="Không tìm thấy môn học"
                      disabled={subjectsLoading}
                      maxDisplay={3}
                    />
                    {(editData.subjects || []).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Đã chọn {(editData.subjects || []).length} môn học
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-1">
                    {teacher.subjects && teacher.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-800 text-white"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base font-medium">Chưa cập nhật</p>
                    )}
                  </div>
                )}
              </div>

              {/* Ghi chú - full width */}
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-600">Ghi chú</Label>
                {isEditing ? (
                  <div className="border rounded-lg overflow-hidden mt-1">
                    <ReactQuill
                      value={editData.notes || ''}
                      onChange={(value) => handleInputChange('notes', value)}
                      placeholder="Nhập ghi chú về giáo viên..."
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
                ) : (
                  <div 
                    className="text-base mt-1 text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: teacher.notes || 'Không có ghi chú' 
                    }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
       {/* Ảnh hợp đồng */}
       <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Ảnh hợp đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Image Preview */}
              {contractImagePreview ? (
                <div className="relative group">
                  <img 
                    src={contractImagePreview} 
                    alt="Contract" 
                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageViewerOpen(true)}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <p className="text-sm">Chưa có ảnh hợp đồng</p>
                </div>
              )}

              {/* Upload Button - Only show when editing */}
              {isEditing && (
                <div>
                  <input
                    type="file"
                    id="contract-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="contract-image-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    <Upload className="w-4 h-4" />
                    {contractImagePreview ? 'Thay đổi ảnh' : 'Tải lên ảnh hợp đồng'}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    JPG, PNG, GIF (Tối đa 5MB)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card> 
       </div>
     </div>

     {/* Dialog Cài đặt tài khoản người dùng */}
     <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle className="text-lg">
             Cài đặt tài khoản người dùng{" "}
             <span className="text-blue-600">{teacher.username}</span>
           </DialogTitle>
         </DialogHeader>

         <div className="space-y-4 py-4">
           {/* Tên đăng nhập */}
           <div>
             <Label htmlFor="account-username" className="text-sm font-medium">
               Tên đăng nhập
             </Label>
             <div className="flex items-center gap-2 mt-2">
               <Input
                 id="account-username"
                 value={accountData.username}
                 onChange={(e) => handleAccountInputChange('username', e.target.value)}
                 className={`${accountErrors.username ? 'border-red-500' : ''}`}
                 placeholder="Nhập tên đăng nhập"
               />
               <span className="text-gray-400 text-sm">@centerup</span>
             </div>
             {accountErrors.username && (
               <p className="text-sm text-red-500 mt-1">{accountErrors.username}</p>
             )}
           </div>

           {/* Email */}
           <div>
             <Label htmlFor="account-email" className="text-sm font-medium">
               Email
             </Label>
             <Input
               id="account-email"
               type="email"
               value={accountData.email}
               onChange={(e) => handleAccountInputChange('email', e.target.value)}
               className={`mt-2 ${accountErrors.email ? 'border-red-500' : ''}`}
               placeholder="Nhập email"
             />
             {accountErrors.email && (
               <p className="text-sm text-red-500 mt-1">{accountErrors.email}</p>
             )}
           </div>

           {/* Số điện thoại */}
           <div>
             <Label htmlFor="account-phone" className="text-sm font-medium">
               Số điện thoại
             </Label>
             <Input
               id="account-phone"
               value={accountData.phone}
               onChange={(e) => handleAccountInputChange('phone', e.target.value)}
               className={`mt-2 ${accountErrors.phone ? 'border-red-500' : ''}`}
               placeholder="Nhập số điện thoại"
             />
             {accountErrors.phone && (
               <p className="text-sm text-red-500 mt-1">{accountErrors.phone}</p>
             )}
           </div>
         </div>

         <DialogFooter className="flex gap-2">
           <Button
             variant="outline"
             onClick={handleCancelAccountDialog}
             disabled={isAccountLoading}
             className="flex-1"
           >
             Hủy
           </Button>
           <Button
             onClick={handleSaveAccountSettings}
             disabled={isAccountLoading}
             className="flex-1 bg-blue-600 hover:bg-blue-700"
           >
             {isAccountLoading ? (
               <>
                 <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                 Đang lưu...
               </>
             ) : (
               'Xác nhận'
             )}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Image Viewer Dialog */}
    <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Ảnh hợp đồng</DialogTitle>
        </DialogHeader>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {contractImagePreview && (
            <img 
              src={contractImagePreview} 
              alt="Contract Full View" 
              className="w-full h-auto object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
   </>
  )
}
