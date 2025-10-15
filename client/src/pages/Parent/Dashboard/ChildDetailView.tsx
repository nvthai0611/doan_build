"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import type { Child } from "./ListChildren"
import { ChildGeneralInfo } from "./ChildGeneralInfo"
import { ChildTimetable } from "./ChildTimetable"
import { ChildExamResults } from "./ChildExamResults"
import { ChildProgressReports } from "./ChildProgressReports"
import { ChildAttendance } from "./ChildAttendance"

interface ChildDetailViewProps {
  child: Child
  onBack: () => void
}

export function ChildDetailView({ child, onBack }: ChildDetailViewProps) {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-balance">Chi tiết học sinh {child.name}</h1>
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
      {activeTab === "info" && <ChildGeneralInfo child={child} />}
      {activeTab === "timetable" && <ChildTimetable child={child} />}
      {activeTab === "exams" && <ChildExamResults child={child} />}
      {activeTab === "progress" && <ChildProgressReports child={child} />}
      {activeTab === "attendance" && <ChildAttendance child={child} />}
    </div>
  )
}
