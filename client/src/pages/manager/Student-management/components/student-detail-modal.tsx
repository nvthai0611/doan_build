import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  CreditCard,
  Clock,
  BookOpen,
  Users,
  X,
  Copy,
} from "lucide-react"
import { toast } from "sonner"
import { centerOwnerStudentService } from "../../../../services/center-owner/student-management/student.service"

interface StudentDetailModalProps {
  studentId: string | null
  isOpen: boolean
  onClose: () => void
}

export function StudentDetailModal({ studentId, isOpen, onClose }: StudentDetailModalProps) {
  // Fetch student detail data
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => studentId ? centerOwnerStudentService.getDetailStudent(studentId) : null,
    enabled: !!studentId && isOpen,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  if (!isOpen) return null

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
  }

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string): string => {
    const statusMap: any = {
      active: "Đang học",
      completed: "Hoàn thành",
      dropped: "Dừng học",
      suspended: "Tạm dừng",
    }
    return statusMap[status] || "Chưa xác định"
  }

  const getGenderText = (gender: string): string => {
    const genderMap: any = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác"
    }
    return genderMap[gender] || "Chưa cập nhật"
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Chưa cập nhật"
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Đang tải thông tin học viên...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (isError || !student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">Không thể tải thông tin học viên</p>
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {student?.user?.fullName?.charAt(0)?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {student?.user?.fullName || "Chưa có tên"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  {student?.user?.email || "Chưa có email"}
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Mã học viên: {student?.studentCode || "Chưa có"}
                  </span>
                  {student?.studentCode && (
                    <Copy
                      className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => handleCopyCode(student.studentCode)}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin cá nhân */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {student?.user?.phone || "Chưa cập nhật số điện thoại"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {student?.user?.email || "Chưa có email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(student?.user?.birthDate)} - {getGenderText(student?.user?.gender)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {student?.address || "Chưa cập nhật địa chỉ"}
                      </span>
                    </div>
                        {/* <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                            Khối: {student?.grade || "Chưa xác định"}
                        </span>
                        </div> */}
                  </div>
                </div>

                {/* Thông tin trường */}
                {student?.school && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trường học</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>{student.school.name}</div>
                      {student.school.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {student.school.address}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Thông tin phụ huynh */}
                {student?.parent && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Thông tin người giám hộ</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Tên: {student.parent.user?.fullName || "Chưa có tên"}</div>
                      <div>Email: {student.parent.user?.email || "Chưa có email"}</div>
                      {student.parent.user?.phone && (
                        <div>Số điện thoại: {student.parent.user.phone}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin học tập */}
              <div className="lg:col-span-2 space-y-6">
                {/* Khóa học đăng ký */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Khóa học đăng ký
                  </h3>
                  <div className="space-y-3">
                    {student?.enrollments?.length > 0 ? (
                      student.enrollments.map((enrollment: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {enrollment?.class?.name || "Tên lớp chưa có"}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={getStatusBadgeColor(enrollment?.status)}
                                >
                                  {getStatusText(enrollment?.status)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <div>
                                  <span className="font-medium">Môn học:</span> {enrollment?.class?.subject?.name || "Chưa có"}
                                </div>
                                <div>
                                  <span className="font-medium">Mô tả:</span> {enrollment?.class?.description || "Không có mô tả"}
                                </div>
                                <div>
                                  <span className="font-medium">Sĩ số tối đa:</span> {enrollment?.class?.maxStudents || "Không giới hạn"}
                                </div>
                                <div>
                                  <span className="font-medium">Ngày đăng ký:</span> {formatDate(enrollment?.enrolledAt)}
                                </div>
                                {enrollment?.completedAt && (
                                  <div>
                                    <span className="font-medium">Ngày hoàn thành:</span> {formatDate(enrollment?.completedAt)}
                                  </div>
                                )}
                                {enrollment?.finalGrade && (
                                  <div>
                                    <span className="font-medium">Điểm tổng kết:</span> {enrollment?.finalGrade}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Giáo viên */}
                          {enrollment?.teacherClassAssignment?.teacher && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Giáo viên: {enrollment.teacherClassAssignment.teacher.user?.fullName || "Chưa phân công"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Học viên chưa đăng ký khóa học nào</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin điểm số */}
                {student?.grades && student.grades.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Kết quả học tập
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {student.grades.map((grade: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {grade?.assessment?.name || "Bài kiểm tra"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade?.assessment?.class?.subject?.name} - {formatDate(grade?.assessment?.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {grade?.score !== null ? `${grade.score}/${grade?.assessment?.maxScore}` : "Chưa chấm"}
                            </div>
                            {grade?.feedback && (
                              <div className="text-xs text-gray-500 mt-1">
                                {grade.feedback}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thông tin tài chính */}
                {student?.financialSummary && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Thông tin tài chính
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tổng công nợ:</span>
                        <span className={`font-semibold ${
                          student.financialSummary.totalDue > 0 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {new Intl.NumberFormat("vi-VN").format(student.financialSummary.totalDue)} đ
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thông tin tài khoản */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Thông tin tài khoản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Trạng thái tài khoản</div>
                      <Badge variant={student?.user?.isActive ? "default" : "secondary"}>
                        {student?.user?.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Ngày tạo</div>
                      <div className="font-medium">{formatDate(student?.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}