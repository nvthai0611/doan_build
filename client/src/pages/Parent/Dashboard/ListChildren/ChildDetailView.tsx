"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../../services"
import { ChildGeneralInfo } from "./ChildGeneralInfo"
import { ChildExamResults } from "./ChildGradeResults"
import { ChildProgressReports } from "./ChildProgressReports"
import { ChildAttendance } from "./ChildAttendance"
import { ChildMaterials } from "./ChildMaterials"
import { ChildTeacherFeedback } from "./TeacherFeedback"

interface ChildDetailViewProps {
  childId: string
  onBack: () => void
}

export function ChildDetailView({ childId, onBack }: ChildDetailViewProps) {
  const [activeTab, setActiveTab] = useState("info")

  // Fetch child basic info
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ["parent-child", childId],
    queryFn: () => parentChildService.getChildById(childId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  // Fetch grades for all classes
  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["parent-child-grades", childId],
    queryFn: () => parentChildService.getChildGrades(childId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!childId,
  })

  // Fetch attendance for all classes
  const { data: attendances, isLoading: attendancesLoading } = useQuery({
    queryKey: ["parent-child-attendance", childId],
    queryFn: () => parentChildService.getChildAttendance(childId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    enabled: !!childId,
  })

  // Combine child data with grades and attendances
  const childWithFullData = child ? {
    ...child,
    grades: grades || child.grades || [],
    attendances: attendances || child.attendances || [],
  } : null

  // Metrics: average grade, class rank, attendance rate (only active classes)
  const { data: metrics } = useQuery({
    queryKey: ["parent-child-metrics", childId],
    queryFn: async () => {
      const res: any = await fetch(`/api/student-management/children/${childId}/metrics`, { credentials: 'include' })
      const data = await res.json()
      return data?.data ?? data
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  const isLoading = childLoading || gradesLoading || attendancesLoading

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div>
        <Button
          size="sm"
          onClick={onBack}
          className="mb-4 bg-foreground text-background hover:bg-foreground/90 px-4 text-xs font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-balance">Chi tiết học sinh {childWithFullData?.user?.fullName}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={onBack}
            className="hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            Danh sách con em
          </button>
          <ChevronRight className="w-4 h-4" />
          <span>Thông tin học sinh</span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "info"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "exams"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Kết quả thi
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "progress"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Báo cáo tiến độ
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "attendance"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Điểm danh
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "materials"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Tài liệu
        </button>
        <button
          onClick={() => setActiveTab("teacherfeedback")}
          className={`pb-3 border-b-2 transition-colors ${activeTab === "teacherfeedback"
            ? "border-primary text-primary font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Phản hồi giáo viên
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && child && <ChildGeneralInfo child={child} />}
      {activeTab === "exams" && child && <ChildExamResults child={child} />}
      {activeTab === "progress" && child && <ChildProgressReports child={child} />}
      {activeTab === "attendance" && child && <ChildAttendance child={child} />}
      {activeTab === "materials" && child && <ChildMaterials childId={child.id} />}
      {activeTab === "teacherfeedback" && child && <ChildTeacherFeedback child={child} />}
    </div>
  )
}
