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

import { ClassHeader } from "./class-header"
import { ClassNavigation } from "./class-navigation"
import { ThongTinChungTab } from "./tabs/thong-tin-chung-tab"
import { DashboardTab } from "./tabs/dashboard-tab"
import { HocVienTab } from "./tabs/hoc-vien-tab"
import { GiaoVienTab } from "./tabs/giao-vien-tab"
import { BuoiHocTab } from "./tabs/buoi-hoc-tab"
import { CongViecTab } from "./tabs/cong-viec-tab"
import ClassAttendancePage from "./tabs/lich-su-diem-danh"
import { ClassModals } from "./modals/class-modals"
import { useLocation, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getClassDetail } from "../../../../services/teacher-service/manage-class.service"
import { daysOfWeek } from "../../../../utils/commonData"
import Loading from "../../../../components/Loading/LoadingPage"

const fetchData = async (teacherClassAssignmentId :string) =>{
  const response = await getClassDetail(teacherClassAssignmentId)
  return response
}
export function ClassDetailsPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-chung")
  const [description, setDescription] = useState("")
  const { teacherClassAssignmentId } = useParams()
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

 const {data : classDetails, isLoading, isError} = useQuery({
    queryKey:['classDetails',teacherClassAssignmentId],
    queryFn: () => fetchData(teacherClassAssignmentId as string),
    retry: false, // Không retry khi lỗi
    refetchOnWindowFocus: false,
    enabled: !!teacherClassAssignmentId,
  })

  if(isLoading){
    return (
      <Loading />
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
  const renderTabContent = () => {
    switch (activeTab) {
      case "thong-tin-chung":
        return (
          <ThongTinChungTab
            classData={classDetails}
            description={description}
            setDescription={setDescription}
            onEditClass={() => handleEdit("class")}
            onEditSchedule={() => handleEdit("schedule")}
            allDays={allDays}
          />
        )
      case "dashboard":
        return <DashboardTab classData={classDetails} />
      case "hoc-vien":
        return (
          <HocVienTab
            onAddStudent={() => setAddStudentOpen(true)}
            onEditStudent={(student) => handleEdit("student", student)}
            onDeleteStudent={(student) => handleDelete("student", student)}
            teacherClassAssignmentId= {teacherClassAssignmentId as string}
          />
        )
      case "giao-vien":
        return (
          <GiaoVienTab
            onAddTeacher={() => setAddTeacherOpen(true)}
            onEditTeacher={(teacher) => handleEdit("teacher", teacher)}
            onDeleteTeacher={(teacher) => handleDelete("teacher", teacher)}
          />
        )
      case "buoi-hoc":
        return (
          <BuoiHocTab
            onAddSession={() => setAddSessionOpen(true)}
            onEditSession={(session) => handleEdit("session", session)}
            onDeleteSession={(session) => handleDelete("session", session)}
          />
        )
      case "cong-viec":
        return (
          <CongViecTab
            onAddTask={() => setAddTaskOpen(true)}
            onEditTask={(task) => handleEdit("task", task)}
            onDeleteTask={(task) => handleDelete("task", task)}
          />
        )
      case "history-attendance-class":
        return (
          <ClassAttendancePage teacherClassAssignmentId={teacherClassAssignmentId as string} />
        )
      default:
        return (
          <ThongTinChungTab
            classData={classData}
            description={description}
            setDescription={setDescription}
            onEditClass={() => handleEdit("class")}
            onEditSchedule={() => handleEdit("schedule")}
            allDays={allDays}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ClassHeader className={classDetails?.name} />

      <ClassNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div>{renderTabContent()}</div>
      </div>

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
