import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit, Search, Loader2, X, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { centerOwnerStudentService } from "../../../../../../services/center-owner/student-management/student.service"
import { useToast } from "../../../../../../hooks/use-toast"

interface StudentInfoCardProps {
  student: any
  onUpdate?: () => void
}

export function StudentInfoCard({ student, onUpdate }: StudentInfoCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchingParent, setIsSearchingParent] = useState(false)
  const [searchedParent, setSearchedParent] = useState<any>(null)
  const [parentEmail, setParentEmail] = useState("")
  const [schools, setSchools] = useState<any[]>([])
  const [parentSearchAttempted, setParentSearchAttempted] = useState(false)
  const [hasParentChanged, setHasParentChanged] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: student?.user?.fullName || "",
    phone: student?.user?.phone || "",
    gender: student?.user?.gender || "OTHER",
    birthDate: student?.user?.birthDate ? new Date(student.user.birthDate).toISOString().split('T')[0] : "",
    address: student?.address || "",
    grade: student?.grade || "",
    schoolId: student?.school?.id || "",
  })

  const [parentData, setParentData] = useState({
    parentId: student?.parent?.id || null,
    parentName: student?.parent?.user?.fullName || "",
    parentEmail: student?.parent?.user?.email || "",
  })

  const originalParentId = student?.parent?.id || null

  const handleOpenEdit = async () => {
    setIsEditOpen(true)
    setParentSearchAttempted(false)
    setHasParentChanged(false)
    // Reset parent data to original
    setParentData({
      parentId: student?.parent?.id || null,
      parentName: student?.parent?.user?.fullName || "",
      parentEmail: student?.parent?.user?.email || "",
    })
    // Load schools
    try {
      const schoolsData = await centerOwnerStudentService.getSchools()
      setSchools(schoolsData?.data || [])
    } catch (error) {
      console.error("Error loading schools:", error)
    }
  }

  const handleSearchParent = async () => {
    if (!parentEmail.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email phụ huynh",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(parentEmail.trim())) {
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ",
        variant: "destructive",
      })
      return
    }

    setIsSearchingParent(true)
    setParentSearchAttempted(true)
    try {
      const result = await centerOwnerStudentService.findParentByEmail(parentEmail)
      setSearchedParent(result)
      toast({
        title: "Thành công",
        description: "Tìm thấy phụ huynh",
      })
    } catch (error: any) {
      setSearchedParent(null)
      toast({
        title: "Không tìm thấy",
        description: error?.message || "Không tìm thấy phụ huynh với email này",
        variant: "destructive",
      })
    } finally {
      setIsSearchingParent(false)
    }
  }

  const handleSelectParent = () => {
    if (searchedParent) {
      setParentData({
        parentId: searchedParent.id,
        parentName: searchedParent.user?.fullName,
        parentEmail: searchedParent.user?.email,
      })
      setSearchedParent(null)
      setParentEmail("")
      setHasParentChanged(true)
      toast({
        title: "Đã chọn phụ huynh",
        description: `Đã chọn: ${searchedParent.user?.fullName}`,
      })
    }
  }

  const handleRemoveParent = () => {
    setParentData({
      parentId: null,
      parentName: "",
      parentEmail: "",
    })
    setHasParentChanged(true)
    setSearchedParent(null)
    setParentEmail("")
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast({
        title: "Lỗi",
        description: "Họ tên không được để trống",
        variant: "destructive",
      })
      return
    }

    // Validate phone format if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        toast({
          title: "Lỗi",
          description: "Số điện thoại không hợp lệ (10-11 chữ số)",
          variant: "destructive",
        })
        return
      }
    }

    // Check if parent changed but user typed email without selecting a parent
    if (hasParentChanged && parentEmail.trim() && !parentData.parentId) {
      toast({
        title: "Lỗi",
        description: "Bạn đã nhập email phụ huynh nhưng chưa chọn. Vui lòng tìm kiếm và chọn phụ huynh hoặc xóa email đã nhập.",
        variant: "destructive",
      })
      return
    }

    // If parent email is entered but not searched
    if (parentEmail.trim() && !searchedParent && !parentData.parentId && !parentSearchAttempted) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng tìm kiếm phụ huynh trước khi lưu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Validate formData
      const updateData: any = {
        ...formData,
        fullName: formData.fullName.trim(),
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        grade: formData.grade?.trim() || undefined,
      }

      // Update student info
      await centerOwnerStudentService.updateStudent(student.id, updateData)

      // Update parent link if changed
      if (parentData.parentId !== originalParentId) {
        await centerOwnerStudentService.updateStudentParent(student.id, parentData.parentId)
      }

      toast({
        title: "Thành công",
        description: "Cập nhật thông tin học viên thành công",
      })
      setIsEditOpen(false)
      setParentSearchAttempted(false)
      setHasParentChanged(false)
      setParentEmail("")
      setSearchedParent(null)
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Có lỗi xảy ra khi cập nhật thông tin",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Thông tin học viên</h2>
              {/* <Clock className="h-4 w-4 text-muted-foreground" /> */}
            </div>
            <Button variant="ghost" size="icon" onClick={handleOpenEdit}>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tên học viên</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.fullName || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Địa chỉ email</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.email || 'Chưa cập nhật'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.phone || 'Chưa cập nhật'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Mã học viên</p>
            <p className="text-sm font-medium text-indigo-600">{student?.studentCode || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Giới tính</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.gender == 'MALE' ? 'Nam' : 'Nữ'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Ngày sinh</p>
            <p className="text-sm font-medium text-foreground">
              {student?.user?.birthDate ? new Date(student.user.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Khối lớp</p>
            <p className="text-sm font-medium text-foreground">{student?.grade || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Trường học</p>
            <p className="text-sm font-medium text-foreground">{student?.school?.name || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin học viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin học viên và phụ huynh
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
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
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Khối lớp</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="VD: 10A1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolId">Trường học</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trường học" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </div>

          {/* Thông tin phụ huynh */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-foreground">Thông tin phụ huynh</h3>
            
            {/* Current parent */}
            {parentData.parentId && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{parentData.parentName}</p>
                    <p className="text-xs text-muted-foreground">{parentData.parentEmail}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveParent}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Search parent */}
            <div className="space-y-3">
              <Label htmlFor="parentEmail">
                {parentData.parentId ? "Thay đổi phụ huynh" : "Tìm kiếm phụ huynh theo email"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => {
                    setParentEmail(e.target.value)
                    setParentSearchAttempted(false)
                  }}
                  placeholder="Nhập email phụ huynh"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearchParent()
                    }
                  }}
                  className={parentEmail.trim() && !searchedParent && !parentData.parentId ? "border-yellow-500" : ""}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchParent}
                  disabled={isSearchingParent || !parentEmail.trim()}
                >
                  {isSearchingParent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {parentEmail.trim() && !searchedParent && !parentData.parentId && parentSearchAttempted && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Không tìm thấy phụ huynh với email này
                </p>
              )}
            </div>

            {/* Searched parent result */}
            {searchedParent && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{searchedParent.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{searchedParent.user?.email}</p>
                    <p className="text-xs text-muted-foreground">{searchedParent.user?.phone || 'Chưa có SĐT'}</p>
                    {searchedParent.students?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Học sinh liên kết:</p>
                        <ul className="text-xs text-muted-foreground ml-4 list-disc">
                          {searchedParent.students.map((s: any) => (
                            <li key={s.id}>{s.user?.fullName} ({s.studentCode})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSelectParent}
                  className="w-full"
                >
                  Chọn phụ huynh này
                </Button>
              </div>
            )}

            {!parentData.parentId && !searchedParent && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Học viên chưa có phụ huynh liên kết. Nhập email để tìm kiếm và liên kết phụ huynh.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditOpen(false)
              setParentSearchAttempted(false)
              setHasParentChanged(false)
              setParentEmail("")
              setSearchedParent(null)
            }}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !formData.fullName.trim() ||
              !!(parentEmail.trim() && !searchedParent && !parentData.parentId)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}