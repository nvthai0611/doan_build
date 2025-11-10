"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronRight, Users, Calendar, Clock, MapPin, User, GraduationCap, BookOpen, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { parentStudentsService } from "../../../../services/parent/students/students.service"
import { parentChildClassesService } from "../../../../services/parent/child-classes/child-classes.service"
import { parentClassJoinService } from "../../../../services/parent/class-join/class-join.service"
import { JoinClassSheet } from "./components/JoinClassSheet"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { 
  ClassStatus, 
  CLASS_STATUS_LABELS, 
  CLASS_STATUS_COLORS, 
  CLASS_STATUS_BADGE_COLORS,
  StudentClassRequestStatus,
  STUDENT_CLASS_REQUEST_STATUS_LABELS,
  STUDENT_CLASS_REQUEST_STATUS_BADGE_COLORS
} from "@/lib/constants"

// Adapter chuyển từ backend class.status sang style classes dùng ở UI
const normalizeClassStatus = (status?: string): ClassStatus => {
  if (!status) return ClassStatus.DRAFT
  const values = Object.values(ClassStatus) as string[] // ['draft','ready',...]
  if (values.includes(status)) return status as ClassStatus
  const lower = status.toLowerCase()
  const found = values.find(v => v.toLowerCase() === lower)
  return (found as ClassStatus) || ClassStatus.DRAFT
}

const mapClassStatusToStyle = (status?: string) => {
  const key = normalizeClassStatus(status)
  return {
    label: CLASS_STATUS_LABELS[key],
    full: CLASS_STATUS_COLORS[key] || 'border-gray-500 text-gray-700 bg-gray-50',
    badge: CLASS_STATUS_BADGE_COLORS[key] || 'bg-gray-100 text-gray-800',
  }
}

// Adapter for request status
const normalizeRequestStatus = (status?: string): StudentClassRequestStatus => {
  if (!status) return StudentClassRequestStatus.PENDING
  const values = Object.values(StudentClassRequestStatus) as string[]
  if (values.includes(status)) return status as StudentClassRequestStatus
  const lower = status.toLowerCase()
  const found = values.find(v => v.toLowerCase() === lower)
  return (found as StudentClassRequestStatus) || StudentClassRequestStatus.PENDING
}

const mapRequestStatusToStyle = (status?: string) => {
  const key = normalizeRequestStatus(status)
  return {
    label: STUDENT_CLASS_REQUEST_STATUS_LABELS[key],
    badge: STUDENT_CLASS_REQUEST_STATUS_BADGE_COLORS[key] || 'bg-gray-100 text-gray-800',
  }
}

export function ChildrenClasses() {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<{ id: string; className: string } | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Mutation for canceling request
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => parentClassJoinService.cancelRequest(requestId),
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message || "Đã hủy yêu cầu tham gia lớp",
        variant: "default",
      })
      // Refetch classes data
      queryClient.invalidateQueries({ queryKey: ['parent', 'student-classes', expandedStudent] })
      setCancelDialogOpen(false)
      setRequestToCancel(null)
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể hủy yêu cầu",
        variant: "destructive",
      })
    },
  })

  // Fetch danh sách con
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: async () => {
      const result = await parentStudentsService.getChildren()
      console.log('Students Response:', result)
      return result
    },
  })

  // Fetch lớp học của con đang được mở
  const { data: classesResponse, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['parent', 'student-classes', expandedStudent],
    queryFn: async () => {
      if (!expandedStudent) return null
      const result = await parentChildClassesService.getChildClasses(expandedStudent)
      console.log('Classes Response:', result)
      return result
    },
    enabled: !!expandedStudent,
  })

  const toggleStudent = (studentId: string) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null)
      setExpandedClass(null)
    } else {
      setExpandedStudent(studentId)
      setExpandedClass(null)
    }
  }

  const toggleClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId)
  }

  const handleCancelRequest = (requestId: string, className: string) => {
    setRequestToCancel({ id: requestId, className })
    setCancelDialogOpen(true)
  }

  const confirmCancelRequest = () => {
    if (requestToCancel) {
      cancelMutation.mutate(requestToCancel.id)
    }
  }

  if (isLoadingStudents) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải danh sách con...</p>
        </div>
      </div>
    )
  }

  const students = studentsResponse?.data || []
  const enrolledClasses = classesResponse?.data?.enrolledClasses || []
  const pendingRequests = classesResponse?.data?.pendingRequests || []

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lớp học của các con</h1>
          <p className="text-muted-foreground mt-1">
            Xem danh sách lớp học của các con
          </p>
        </div>
        <Button
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => setIsJoinClassOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Tham gia lớp học
        </Button>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Chưa có con nào</h3>
            <p className="text-sm text-muted-foreground">
              Bạn chưa có thông tin con trong hệ thống
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
              {/* Student Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer bg-card hover:bg-accent/50 transition-colors"
                onClick={() => toggleStudent(student.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{student.user.fullName}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">Mã: {student.studentCode}</p>
                      <p className="text-sm text-muted-foreground">Khối: {student.grade}</p>
                      {student.school && (
                        <p className="text-sm text-muted-foreground">{student.school.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                {expandedStudent === student.id ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Classes List */}
              {expandedStudent === student.id && (
                <div className="border-t bg-muted/20">
                  {isLoadingClasses ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Đang tải lớp học...</p>
                    </div>
                  ) : enrolledClasses.length === 0 && pendingRequests.length === 0 ? (
                    <div className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Chưa có lớp học nào</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-6">
                      {/* Enrolled Classes Section */}
                      {enrolledClasses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Lớp đang học ({enrolledClasses.length})
                          </h4>
                          <div className="space-y-3">
                            {enrolledClasses.map((classItem) => {
                        const statusInfo = mapClassStatusToStyle(classItem.status)

                        return (
                          <Card
                            key={classItem.id}
                            className="overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Class Header */}
                            <div
                              className="p-4 cursor-pointer bg-card hover:bg-accent/30 transition-colors"
                              onClick={() => toggleClass(classItem.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-foreground">{classItem.name}</h4>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {classItem.activePrimaryTeacher?.fullName || classItem.teacher?.user?.fullName || 'Chưa có giáo viên'}
                                      </span>
                                      {classItem.activeSubstituteTeacher?.fullName && (
                                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                                          Thay thế: {classItem.activeSubstituteTeacher.fullName}
                                          {(classItem.activeSubstituteTeacher as any).from && classItem.activeSubstituteTeacher.until && (
                                            <span className="ml-1 font-normal text-[10px] text-amber-800">
                                              ({(classItem.activeSubstituteTeacher as any).from} → {classItem.activeSubstituteTeacher.until})
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {classItem.subject?.name || 'Chưa có môn học'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <ChevronDown
                                  className={`w-5 h-5 text-muted-foreground transition-transform ${expandedClass === classItem.id ? "rotate-180" : ""
                                    }`}
                                />
                              </div>
                            </div>

                            {/* Expanded Class Details */}
                            {expandedClass === classItem.id && (
                              <div className="border-t bg-muted/10 p-4">
                                <div className="space-y-4">
                                  {/* Grid 2 columns */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* Giáo viên */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Giáo viên
                                      </h5>
                                      {classItem.activeSubstituteTeacher?.fullName ? (
                                        <div className="ml-6 space-y-1">
                                          <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">Chính:</span> {classItem.activePrimaryTeacher?.fullName || classItem.teacher?.user?.fullName || 'Chưa phân công'}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">Thay thế:</span> {classItem.activeSubstituteTeacher.fullName}
                                          </p>
                                          <p className="text-xs inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                            Đang thay thế
                                            {(classItem.activeSubstituteTeacher as any).from && (
                                              <span className="ml-1 font-normal text-[10px] text-amber-800">{(classItem.activeSubstituteTeacher as any).from}</span>
                                            )}
                                            {classItem.activeSubstituteTeacher.until && (
                                              <span className="ml-1 font-normal text-[10px] text-amber-800">→ {classItem.activeSubstituteTeacher.until}</span>
                                            )}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground ml-6">
                                          {classItem.activePrimaryTeacher?.fullName || classItem.teacher?.user?.fullName || 'Chưa phân công'}
                                        </p>
                                      )}
                                    </div>

                                    {/* Phòng học */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Phòng học
                                      </h5>
                                      <p className="text-sm text-muted-foreground ml-6">
                                        {classItem.room?.name || 'Chưa phân phòng'}
                                      </p>
                                    </div>

                                    {/* Ngày bắt đầu */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày bắt đầu
                                      </h5>
                                      <p className="text-sm text-muted-foreground ml-6">
                                        {classItem.startDate
                                          ? new Date(classItem.startDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })
                                          : 'Chưa xác định'}
                                      </p>
                                    </div>

                                    {/* Ngày kết thúc */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày kết thúc
                                      </h5>
                                      <p className="text-sm text-muted-foreground ml-6">
                                        {classItem.endDate
                                          ? new Date(classItem.endDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                          })
                                          : 'Chưa xác định'}
                                      </p>
                                    </div>

                                    {/* Trạng thái */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Trạng thái
                                      </h5>
                                      <div className="ml-6">
                                        <span
                                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}
                                        >
                                          {statusInfo.label}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Sĩ số */}
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Sĩ số
                                      </h5>
                                      <p className="text-sm text-muted-foreground ml-6">
                                        {classItem.currentStudents}/{classItem.maxStudents} học sinh
                                      </p>
                                    </div>
                                  </div>

                                  {/* Lịch học - Full width */}
                                  <div>
                                    <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      Lịch học
                                    </h5>
                                    {classItem.schedule && classItem.schedule.length > 0 ? (
                                      <div className="flex flex-wrap gap-3 ml-6">
                                        {classItem.schedule.map((schedule, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md"
                                          >
                                            <span className="font-medium">{schedule.dayOfWeek}:</span>
                                            <Clock className="w-3 h-3" />
                                            <span className="text-xs">
                                              {schedule.startTime} - {schedule.endTime}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground ml-6">Chưa có lịch học</p>
                                    )}
                                  </div>

                                  {/* Progress - Full width */}
                                  {classItem.progress !== undefined && (
                                    <div>
                                      <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" />
                                        Tiến độ học tập
                                      </h5>
                                      <div className="ml-6">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-muted-foreground">
                                            {classItem.completedSessions}/{classItem.totalSessions} buổi học
                                          </span>
                                          <span className="text-xs font-medium text-foreground">
                                            {classItem.progress}%
                                          </span>
                                        </div>
                                        <Progress value={classItem.progress} className="h-2" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                          </div>
                        </div>
                      )}

                      {/* Pending Requests Section */}
                      {pendingRequests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Đăng ký chờ duyệt ({pendingRequests.length})
                          </h4>
                          <div className="space-y-3">
                            {pendingRequests.map((request) => {
                              const statusInfo = mapClassStatusToStyle(request.status)
                              const requestStatusInfo = mapRequestStatusToStyle(request.requestStatus)

                              return (
                                <Card
                                  key={request.id}
                                  className="overflow-hidden border-dashed border-2"
                                >
                                  <div className="p-4 bg-card">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="font-semibold text-foreground">{request.name}</h4>
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${requestStatusInfo.badge}`}
                                          >
                                            {requestStatusInfo.label}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {request.teacher?.user?.fullName || 'Chưa có giáo viên'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {request.subject?.name || 'Chưa có môn học'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {request.room?.name || 'Chưa phân phòng'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                              {request.currentStudents}/{request.maxStudents} học sinh
                                            </span>
                                          </div>
                                        </div>

                                        {request.requestMessage && (
                                          <div className="mt-3 p-2 bg-muted/30 rounded-md">
                                            <p className="text-xs text-muted-foreground">
                                              <span className="font-medium">Lời nhắn:</span> {request.requestMessage}
                                            </p>
                                          </div>
                                        )}

                                        <div className="mt-3 text-xs text-muted-foreground">
                                          Đăng ký lúc: {new Date(request.requestedAt).toLocaleString('vi-VN')}
                                        </div>
                                      </div>

                                      {/* Cancel Button */}
                                      <div className="flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => handleCancelRequest(request.id, request.name)}
                                          disabled={cancelMutation.isPending}
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          Hủy yêu cầu
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Join Class Sheet */}
      <JoinClassSheet
        open={isJoinClassOpen}
        onOpenChange={setIsJoinClassOpen}
      />

      {/* Cancel Request Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy yêu cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy yêu cầu tham gia lớp{" "}
              <span className="font-semibold text-foreground">
                {requestToCancel?.className}
              </span>
              ?
              <br />
              <br />
              Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Không
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelRequest}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? "Đang hủy..." : "Hủy yêu cầu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
