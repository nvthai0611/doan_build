"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../services"
import { ChildGeneralInfo } from "./ChildGeneralInfo"
import { ChildTimetable } from "./ChildTimetable"
import { ChildExamResults } from "./ChildGradeResults"
import { ChildProgressReports } from "./ChildProgressReports"
import { ChildAttendance } from "./ChildAttendance"

interface ChildDetailViewProps {
  childId: string
  onBack: () => void
}

export function ChildDetailView({ childId, onBack }: ChildDetailViewProps) {
  const [activeTab, setActiveTab] = useState("info")
  const { data: child } = useQuery({
    queryKey: ["parent-child", childId],
    queryFn: () => parentChildService.getChildById(childId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

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

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-balance">Chi tiết học sinh {child?.user?.fullName}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>Danh sách con em</span>
          <ChevronRight className="w-4 h-4" />
          <span>Thông tin học sinh</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab("timetable")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "timetable"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Lịch học
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "exams"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Kết quả thi
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "progress"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Báo cáo tiến độ
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "attendance"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Điểm danh
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && child && <ChildGeneralInfo child={child} />}
      {activeTab === "timetable" && child && <ChildTimetable child={child} />}
      {activeTab === "exams" && child && <ChildExamResults child={child} />}
      {activeTab === "progress" && child && <ChildProgressReports child={child} />}
      {activeTab === "attendance" && child && <ChildAttendance child={child} />}
    </div>
  )
}
