"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { centerOwnerTeacherService } from "../../../../../services/center-owner/teacher-management/teacher.service"
import Loading from "../../../../../components/Loading/LoadingPage"
import GeneralInfo from "../GeneralInfo"
import ScheduleInfo from "../ScheduleInfo"
import ClassesInfo from "../ClassesInfo"
import LeaveRequestsInfo from "../LeaveRequestsInfo"
import TimesheetInfo from "../TimesheetInfo"
import { toast } from "sonner"
import type { CreateTeacherRequest } from "../../../../../services/center-owner/teacher-management/teacher.service"
import type { Teacher } from "../../types/teacher"

export default function TeacherInfo({ employee, isLoading, error }: { employee: Teacher, isLoading: boolean, error: Error }) {
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const employeeId = params.id as string

 

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: () => centerOwnerTeacherService.toggleTeacherStatus(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', employeeId] })
    },
  })

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: (data: Partial<CreateTeacherRequest>) =>
      centerOwnerTeacherService.updateTeacher(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', employeeId] })
      toast.success("Cập nhật thông tin giáo viên thành công")
    },
  })

  const [activeTab, setActiveTab] = useState("general")
  const [accountStatus, setAccountStatus] = useState(employee?.status || false)
  const [isVerified, setIsVerified] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<CreateTeacherRequest>>({})

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Leave requests state
  const [leaveActiveTab, setLeaveActiveTab] = useState("all")
  const [leaveFromDate, setLeaveFromDate] = useState("")
  const [leaveToDate, setLeaveToDate] = useState("")
  const [leaveSearch, setLeaveSearch] = useState("")

  // Timesheet state
  const [timesheetActiveTab, setTimesheetActiveTab] = useState("all")
  const [timesheetFromDate, setTimesheetFromDate] = useState("")
  const [timesheetToDate, setTimesheetToDate] = useState("")
  const [timesheetSearch, setTimesheetSearch] = useState("")

  // Classes state
  const [classesActiveTab, setClassesActiveTab] = useState("all")
  const [classesSearch, setClassesSearch] = useState("")

  // Update account status when employee data changes
  useEffect(() => {
    if (employee) {
      setAccountStatus(employee.status || false)
    }
  }, [employee])

  // Loading state
  if (isLoading) {
    return <Loading />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Lỗi tải dữ liệu</h1>
          <p className="text-gray-600 mt-2">Không thể tải thông tin giáo viên</p>
          <button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  // Not found state
  if (!employee) {
    return <Loading />
  }

  const handleAccountStatusToggle = () => {
    setAccountStatus(!accountStatus)
    toggleStatusMutation.mutate()
    toast.success("Cập nhật trạng thái giáo viên thành công")
  }

  const handleEditEmployee = () => {
    setEditFormData({
      fullName: employee.name,
      email: employee.email,
      phone: employee.phone,  
      username: employee.username,
      role: employee.role === "Giáo viên" ? "teacher" : employee.role === "Chủ trung tâm" ? "admin" : "center_owner",
      isActive: employee.status,
      notes: employee.notes,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    updateTeacherMutation.mutate(editFormData)
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setEditFormData({})
  }

  const tabs = [
    { key: "general", label: "Thông tin chung" },
    { key: "schedule", label: "Lịch dạy" },
    { key: "classes", label: "Lớp học" },
    { key: "leave", label: "Đơn nghỉ phép" },
    { key: "timesheet", label: "Bảng chấm công" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralInfo
            employee={employee}
            accountStatus={accountStatus}
            isVerified={isVerified}
            isEditDialogOpen={isEditDialogOpen}
            editFormData={editFormData}
            updateTeacherMutation={updateTeacherMutation}
            onAccountStatusToggle={handleAccountStatusToggle}
            onEditEmployee={handleEditEmployee}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            setEditFormData={setEditFormData}
            setIsEditDialogOpen={setIsEditDialogOpen}
          />
        )
      case "schedule":

        return (
          <ScheduleInfo
            employeeId={employeeId}
            currentDate={currentDate}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setCurrentDate={setCurrentDate}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
          />
        )
      case "classes":
        return (
          <ClassesInfo
            employeeId={employeeId}
            activeTab={classesActiveTab}
            search={classesSearch}
            setActiveTab={setClassesActiveTab}
            setSearch={setClassesSearch}
          />
        )
      case "timesheet":
        return (
          <TimesheetInfo
            employeeId={employeeId}
            activeTab={timesheetActiveTab}
            fromDate={timesheetFromDate}
            toDate={timesheetToDate}
            search={timesheetSearch}
            setActiveTab={setTimesheetActiveTab}
            setFromDate={setTimesheetFromDate}
            setToDate={setTimesheetToDate}
            setSearch={setTimesheetSearch}
          />
        )
      case "leave":
        return (
          <LeaveRequestsInfo
            employeeId={employeeId}
            activeTab={leaveActiveTab}
            fromDate={leaveFromDate}
            toDate={leaveToDate}
            search={leaveSearch}
            setActiveTab={setLeaveActiveTab}
            setFromDate={setLeaveFromDate}
            setToDate={setLeaveToDate}
            setSearch={setLeaveSearch}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  )
}
