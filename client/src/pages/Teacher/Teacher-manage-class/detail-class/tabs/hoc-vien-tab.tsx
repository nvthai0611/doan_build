"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  School,
  BookOpen,
  GraduationCap,
  UserCheck
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { teacherCommonService } from "../../../../../services/teacher/common/common.service"
import Loading from "../../../../../components/Loading/LoadingPage"
import { toast } from "sonner"
import { useState } from "react"

interface HocVienTabProps {
  onAddStudent: () => void
  onEditStudent: (student: any) => void
  onDeleteStudent: (student: any) => void
  teacherClassAssignmentId: string
}

interface StudentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  student: any
}

function StudentDetailModal({ isOpen, onClose, student }: StudentDetailModalProps) {
  if (!student) return null

  const formatDate = (dateString: string) => {
    try {
      return formatDate(dateString)
    } catch {
      return "N/A"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return formatDate(dateString)
    } catch {
      return "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-red-100 text-red-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang học'
      case 'inactive':
        return 'Tạm ngừng'
      case 'completed':
        return 'Hoàn thành'
      default:
        return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Thông tin chi tiết học viên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={student.student?.user?.avatar} 
                    alt={student.student?.user?.fullName}
                  />
                  <AvatarFallback className="text-lg">
                    {student.student?.user?.fullName?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                    <p className="text-lg font-semibold">{student.student?.user?.fullName || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mã học viên</label>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {student.student?.studentCode || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{student.student?.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                      <p>{student.student?.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ngày sinh</label>
                      <p>{student.student?.user?.birthDate ? formatDate(student.student.user.birthDate) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Giới tính</label>
                    <p>{student.student?.user?.gender === 'male' ? 'Nam' : student.student?.user?.gender === 'female' ? 'Nữ' : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address & School Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông tin địa chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{student.student?.address || 'Chưa cập nhật'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Trường học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên trường</label>
                  <p>{student.student?.school?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Địa chỉ trường</label>
                  <p className="text-sm">{student.student?.school?.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SĐT trường</label>
                  <p className="text-sm">{student.student?.school?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Khối lớp</label>
                  <p>{student.student?.grade || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Parent Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin phụ huynh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                  <p>{student.student?.parent?.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{student.student?.parent?.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                  <p>{student.student?.parent?.user?.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class & Enrollment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Thông tin lớp học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên lớp</label>
                  <p className="font-medium">{student.class?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Môn học</label>
                  <p>{student.class?.subject?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mã môn</label>
                  <p className="font-mono text-sm">{student.class?.subject?.code || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Khối</label>
                  <p>{student.class?.grade || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Thông tin ghi danh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(student.status)}>
                      {getStatusText(student.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày ghi danh</label>
                  <p>{formatDateTime(student.enrolledAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Học kỳ</label>
                  <p>{student.semester || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Năm học</label>
                  <p>{student.teacherClassAssignment?.academicYear || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teacher Info */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Thông tin giáo viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Họ và tên</label>
                  <p>{student.teacherClassAssignment?.teacher?.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{student.teacherClassAssignment?.teacher?.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                  <p>{student.teacherClassAssignment?.teacher?.user?.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function HocVienTab({ onAddStudent, onEditStudent, onDeleteStudent, teacherClassAssignmentId }: HocVienTabProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const { data: listStudents, isLoading, error } = useQuery({
    queryKey: ['students', teacherClassAssignmentId],
    queryFn: async () => {
      const response = await teacherCommonService.getListStudentOfClass(teacherClassAssignmentId)
      return response as any
    },
    enabled: !!teacherClassAssignmentId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const handleStudentClick = async (studentId: string) => {
    try {
      const response = await teacherCommonService.getDetailStudentOfClass(studentId, teacherClassAssignmentId)
      setSelectedStudent(response)
      setIsModalOpen(true)

    } catch (error) {
      console.error('Error fetching student detail:', error)
      toast.error("Không thể tải thông tin chi tiết học viên", { duration: 3000 })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    toast.error("Đã có lỗi xảy ra khi tải danh sách học viên.", { duration: 3000 })
    return null
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách học viên ({listStudents?.length || 0})
          </CardTitle>
          {/* <Button onClick={onAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm học viên
          </Button> */}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listStudents && listStudents.length > 0 ? (
              listStudents.map((student: any) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleStudentClick(student.studentId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {student.student?.user?.fullName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.student?.user?.fullName || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{student.student?.user?.email || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Mã SV: {student.student?.studentCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status === "active" ? "Đang học" : "Tạm nghỉ"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tham gia lớp học: {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStudentClick(student.studentId)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                Chưa có học viên nào trong lớp.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
      />
    </div>
  )
}
