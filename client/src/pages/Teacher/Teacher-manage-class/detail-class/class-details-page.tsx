"use client"

import { useState } from "react"
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

import { ClassHeader } from "../../../teacher/Teacher-manage-class/detail-class/class-header"
import { ClassNavigation } from "../../../teacher/Teacher-manage-class/detail-class/class-navigation"
import { ClassModals } from "../../../teacher/Teacher-manage-class/detail-class/modals/class-modals"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getClassDetail } from "../../../../services/teacher-service/manage-class.service"
import { daysOfWeek } from "../../../../utils/commonData"
import Loading from "../../../../components/Loading/LoadingPage"
import { Loader2 } from "lucide-react"
import DashboardTab from "../../../teacher/Teacher-manage-class/detail-class/tabs/dashboard-tab"
import { ThongTinChungTab } from "../../../teacher/Teacher-manage-class/detail-class/tabs/thong-tin-chung-tab"
import { BuoiHocTab } from "../../../teacher/Teacher-manage-class/detail-class/tabs/buoi-hoc-tab"
import { HocVienTab } from "../../../teacher/Teacher-manage-class/detail-class/tabs/hoc-vien-tab"
import GiaoVienTab from "../../../teacher/Teacher-manage-class/detail-class/tabs/giao-vien-tab"
import CongViecTab from "../../../teacher/Teacher-manage-class/detail-class/tabs/cong-viec-tab"
import LichSuDiemDanhTab from "../../../teacher/Teacher-manage-class/detail-class/tabs/lich-su-diem-danh"

const TABS = [
  { id: "dashboard", label: "Tổng Quan", icon: "📊" },
  { id: "info", label: "Thông Tin Chung", icon: "ℹ️" },
  { id: "sessions", label: "Buổi Học", icon: "📅" },
  { id: "students", label: "Học Viên", icon: "👥" },
  { id: "teacher", label: "Giáo Viên", icon: "👨‍🏫" },
  { id: "tasks", label: "Công Việc", icon: "✓" },
  { id: "attendance", label: "Lịch Sử Điểm Danh", icon: "📋" },
]

export function ClassDetailsPage() {
  const { classId } = useParams<{ classId: string }>()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [description, setDescription] = useState("")
  const [editClassOpen, setEditClassOpen] = useState(false)
  const [editScheduleOpen, setEditScheduleOpen] = useState(false)
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [editStudentOpen, setEditStudentOpen] = useState(false)
  const [addTeacherOpen, setAddTeacherOpen] = useState(false)
  const [editTeacherOpen, setEditTeacherOpen] = useState(false)
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [editSessionOpen, setEditSessionOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [addAssessmentOpen, setAddAssessmentOpen] = useState(false)
  const [editAssessmentOpen, setEditAssessmentOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const navigate = useNavigate()
  const classData = {
    name: "Hóa 6",
    code: "HOA6",
    subject: "Sơ Cấp",
    startDate: "26/07/2025",
    endDate: "30/07/2025",
    status: "Đã kết thúc",
    room: "Phòng học",
    schedule: [
      { day: "Thứ Tư", time: "18:00 → 19:30" },
      { day: "Thứ Bảy", time: "18:00 → 19:30" },
    ],
  }
  const allDays = daysOfWeek

  const {
    data: classDetail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["classDetail", classId],
    queryFn: () => getClassDetail(classId ?? ""),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium">Có lỗi xảy ra</p>
          <p className="text-gray-500">{(error as any)?.message || "Không thể tải chi tiết lớp học"}</p>
        </div>
      </div>
    )
  }

  if (!classDetail?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Không tìm thấy lớp học</p>
      </div>
    )
  }

  const handleEdit = (type: string, item?: any) => {
    setSelectedItem(item)
    switch (type) {
      case "class":
        setEditClassOpen(true)
        break
      case "schedule":
        setEditScheduleOpen(true)
        break
      case "student":
        setEditStudentOpen(true)
        break
      case "teacher":
        setEditTeacherOpen(true)
        break
      case "session":
        setEditSessionOpen(true)
        break
      case "task":
        setEditTaskOpen(true)
        break
      case "assessment":
        setEditAssessmentOpen(true)
        break
    }
  }

  const handleDelete = (type: string, item: any) => {
    setSelectedItem({ ...item, type })
    setDeleteConfirmOpen(true)
  }
  const handleViewDetailSession = (session: any) => {
    setSelectedItem(session)
    navigate(`/teacher/classes/${classId}/session/${session.id}`)
  }
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab classData={classDetail.data} />
      case "info":
        return <ThongTinChungTab classData={classDetail.data} />
      case "sessions":
        return (
          <BuoiHocTab
            onAddSession={() => setAddSessionOpen(true)}
            onViewDetailSession={handleViewDetailSession}
            onDeleteSession={(session) => handleDelete("session", session)}
            teacherClassAssignmentId={classId ?? ""}
          />
        )
      case "students":
        return (
          <HocVienTab
            classId={classId ?? ""}
            classData={classDetail.data}
          />
        )
      case "teacher":
        return <GiaoVienTab classData={classDetail.data} />
      case "tasks":
        return (
          <CongViecTab
            classId={classId ?? ""}
            classData={classDetail.data}
          />
        )
      case "attendance":
        return (
          <LichSuDiemDanhTab
            teacherClassAssignmentId={classId ?? ""}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ClassHeader classData={classDetail.data} />
      <ClassNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-6">{renderTabContent()}</div>

      <ClassModals
        editClassOpen={editClassOpen}
        setEditClassOpen={setEditClassOpen}
        editScheduleOpen={editScheduleOpen}
        setEditScheduleOpen={setEditScheduleOpen}
        addStudentOpen={addStudentOpen}
        setAddStudentOpen={setAddStudentOpen}
        editStudentOpen={editStudentOpen}
        setEditStudentOpen={setEditStudentOpen}
        addTeacherOpen={addTeacherOpen}
        setAddTeacherOpen={setAddTeacherOpen}
        editTeacherOpen={editTeacherOpen}
        setEditTeacherOpen={setEditTeacherOpen}
        addSessionOpen={addSessionOpen}
        setAddSessionOpen={setAddSessionOpen}
        editSessionOpen={editSessionOpen}
        setEditSessionOpen={setEditSessionOpen}
        addTaskOpen={addTaskOpen}
        setAddTaskOpen={setAddTaskOpen}
        editTaskOpen={editTaskOpen}
        setEditTaskOpen={setEditTaskOpen}
        addAssessmentOpen={addAssessmentOpen}
        setAddAssessmentOpen={setAddAssessmentOpen}
        editAssessmentOpen={editAssessmentOpen}
        setEditAssessmentOpen={setEditAssessmentOpen}
        selectedItem={selectedItem}
        classData={classData}
        classId={classDetail?.id}
        teacherClassAssignmentId={classId as string}
        classDetails={classDetail}
      />

      {/* Delete Confirmation Modal */}
      {/* <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              {selectedItem?.type === "student"
                ? "học viên"
                : selectedItem?.type === "teacher"
                  ? "giáo viên"
                  : selectedItem?.type === "session"
                    ? "buổi học"
                    : selectedItem?.type === "task"
                      ? "công việc"
                      : selectedItem?.type === "assessment"
                        ? "đánh giá"
                        : "mục"}{" "}
              này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setSelectedItem(null)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  )
}
