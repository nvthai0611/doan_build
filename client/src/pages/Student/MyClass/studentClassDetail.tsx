"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Loading from "../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../services/student/classInformation/classInformation.service"
import { ClassHeader } from "./components/ClassHeader"
import { ClassNavigation } from "./components/ClassNavigation"
import { GeneralInfoTab } from "./components/tabs/GeneralInfoTab"
import { StudentsTab } from "./components/tabs/StudentsTab"
import { MaterialsTab } from "./components/tabs/MaterialsTab"

export default function StudentClassDetailPage() {
  const [activeTab, setActiveTab] = useState("thong-tin-chung")
  const { classId } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "class-detail", classId],
    queryFn: () => studentClassInformationService.getClassDetail(classId as string),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const detail: any = useMemo(() => data ?? null, [data])

  const renderTabContent = () => {
    switch (activeTab) {
      case "thong-tin-chung":
        return <GeneralInfoTab classData={detail} classId={classId as string} />
      case "hoc-vien":
        return <StudentsTab classId={classId as string} />
      case "tai-lieu":
        return <MaterialsTab classId={classId as string} />
      default:
        return <GeneralInfoTab classData={detail} classId={classId as string} />
    }
  }

  if (isLoading) return <Loading />
  if (isError || !detail) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-sm text-red-600">Không thể tải chi tiết lớp học</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClassHeader className={detail.subject?.name || detail.name} />

      <ClassNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div>{renderTabContent()}</div>
      </div>
    </div>
  )
}