import React, { useState } from "react"
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
import { Calendar, Undo, Check, Sparkles, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { schoolService, SchoolOption } from "../../../../services/common"

export default function AddEmployee() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birthDate: "",
    role: "",
    username: "",
    email: "",
    phone: "",
    school: "",
    schoolName: "",
    schoolAddress: "",
    status: true,
    notes: ""
  })

  // State để quản lý danh sách trường học local
  const [localSchools, setLocalSchools] = useState<SchoolOption[]>([])

  // Convert any school data to SchoolOption
  const convertToSchoolOption = (school: any): SchoolOption => ({
    value: school.name || school.label || school.value,
    label: school.name || school.label || school.value,
    description: school.address || school.description
  })

  // Mock data fallback
  const mockSchools: SchoolOption[] = [
    { value: "THPT Nguyễn Huệ", label: "THPT Nguyễn Huệ", description: "123 Nguyễn Huệ, Quận 1, TP.HCM" },
    { value: "THPT Lê Lợi", label: "THPT Lê Lợi", description: "456 Lê Lợi, Quận 1, TP.HCM" },
    { value: "THPT Điện Biên Phủ", label: "THPT Điện Biên Phủ", description: "789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM" },
    { value: "THPT Cách Mạng Tháng 8", label: "THPT Cách Mạng Tháng 8", description: "321 Cách Mạng Tháng 8, Quận 10, TP.HCM" },
    { value: "THPT Nguyễn Thị Minh Khai", label: "THPT Nguyễn Thị Minh Khai", description: "654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM" },
    { value: "THPT Võ Văn Tần", label: "THPT Võ Văn Tần", description: "987 Võ Văn Tần, Quận 3, TP.HCM" },
    { value: "THPT Nguyễn Văn Cừ", label: "THPT Nguyễn Văn Cừ", description: "147 Nguyễn Văn Cừ, Quận 5, TP.HCM" },
    { value: "THPT Trần Hưng Đạo", label: "THPT Trần Hưng Đạo", description: "258 Trần Hưng Đạo, Quận 5, TP.HCM" },
    { value: "THPT Nguyễn Trãi", label: "THPT Nguyễn Trãi", description: "369 Nguyễn Trãi, Quận 5, TP.HCM" },
    { value: "THPT Lý Tự Trọng", label: "THPT Lý Tự Trọng", description: "741 Lý Tự Trọng, Quận 1, TP.HCM" },
    { value: "THPT Pasteur", label: "THPT Pasteur", description: "852 Pasteur, Quận 3, TP.HCM" },
    { value: "THPT Hai Bà Trưng", label: "THPT Hai Bà Trưng", description: "963 Hai Bà Trưng, Quận 1, TP.HCM" },
    { value: "THPT Nguyễn Du", label: "THPT Nguyễn Du", description: "159 Nguyễn Du, Quận 1, TP.HCM" },
    { value: "THPT Đồng Khởi", label: "THPT Đồng Khởi", description: "357 Đồng Khởi, Quận 1, TP.HCM" },
    { value: "THPT Nguyễn Thị Nghĩa", label: "THPT Nguyễn Thị Nghĩa", description: "468 Nguyễn Thị Nghĩa, Quận 1, TP.HCM" }
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

  // Cập nhật localSchools khi có data từ API
  React.useEffect(() => {
    if (schoolsData) {
      setLocalSchools(schoolsData)
    }
  }, [schoolsData])

  // Sử dụng localSchools thay vì schoolsData để có thể thêm trường mới
  const schools = localSchools.length > 0 ? localSchools : mockSchools

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
  }
  console.log(formData);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement API call to create employee
      console.log("Form data:", formData)
      console.log("School info:", {
        school: formData.school,
        schoolName: formData.schoolName,
        schoolAddress: formData.schoolAddress
      })
      toast.success("Thêm nhân viên thành công!")
      navigate("/center-qn/teachers")
    } catch (error) {
      console.error("Error creating employee:", error)
      toast.error("Có lỗi xảy ra khi thêm nhân viên")
    }
  }

  const handleCancel = () => {
    navigate("/center-qn/teachers")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
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
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              <Check className="w-4 h-4" />
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
                  <Label htmlFor="name">Tên nhân viên</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên nhân viên"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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

                {/* Birth Date */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="birthDate">Ngày sinh</Label>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      placeholder="DD/MM/YYYY"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="role">Nhóm quyền</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm quyền" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="center_owner">Chủ trung tâm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Login Account Section */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-foreground">Tài khoản đăng nhập</h3>
                  
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <div className="relative">
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        @centerup
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email xác thực tài khoản</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Nhập email xác thực"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại xác thực tài khoản</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* School */}
                  <div className="space-y-2">
                    <Label htmlFor="school">Trường học</Label>
                    <div className="relative">
                      <Combobox
                        options={schools}
                        value={formData.school}
                        onValueChange={(value) => handleInputChange("school", value)}
                        placeholder={schoolsLoading ? "Đang tải danh sách trường..." : "Chọn hoặc nhập tên trường học"}
                        searchPlaceholder="Tìm kiếm tên trường..."
                        emptyText={schoolsError ? "Lỗi tải danh sách trường học" : "Không tìm thấy trường học phù hợp"}
                        className="w-full"
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
                    {schoolsError && (
                      <p className="text-sm text-red-500 mt-1">
                        {schoolsError instanceof Error ? schoolsError.message : 'Có lỗi xảy ra khi tải danh sách trường học'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Status and Notes */}
            <div className="space-y-6">
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
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
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
