"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ParentService } from "../../../../../services/center-owner/parent-management/parent.service"
import { 
  ParentSidebar,
  ParentInfoCard,
  ParentStudentsTab,
  ParentPaymentsTab,
  ParentScheduleTab,
  ParentTuitionTab
} from "./components"
import Loading from "../../../../../components/Loading/LoadingPage"

export default function ParentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch parent details
  const { 
    data: parentData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["parent-detail", id],
    queryFn: () => ParentService.getParentById(id!),
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return <Loading />
  }

  if (isError || !parentData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {isError 
              ? `Lỗi: ${(error as any)?.message || 'Không thể tải thông tin phụ huynh'}` 
              : 'Không tìm thấy thông tin phụ huynh'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Chi tiết phụ huynh {parentData?.user?.fullName || 'N/A'}
          </h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/center-qn')} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/center-qn/parents')} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  Danh sách phụ huynh
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">Chi tiết phụ huynh</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger
              value="info"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Thông tin chung
            </TabsTrigger>
            {/* <TabsTrigger
              value="schedule"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Lịch học
            </TabsTrigger> */}
            <TabsTrigger
              value="invoice"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Hoá đơn
            </TabsTrigger>
            <TabsTrigger
              value="tuition"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Học phí
            </TabsTrigger>
            {/* <TabsTrigger
              value="learning"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Học tập
            </TabsTrigger> */}
            {/* <TabsTrigger
              value="attendance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
            >
              Điểm danh
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="info" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                <ParentSidebar
                  parentData={parentData}
                  formatDate={formatDate}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <ParentInfoCard parentData={parentData} onUpdate={() => refetch()} />
                <ParentStudentsTab parentData={parentData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <ParentScheduleTab parentData={parentData} />
          </TabsContent>

          <TabsContent value="invoice">
            <ParentPaymentsTab parentData={parentData} />
          </TabsContent>

          <TabsContent value="tuition">
            <ParentTuitionTab parentData={parentData} />
          </TabsContent>

          <TabsContent value="learning">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng theo dõi học tập đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tính năng theo dõi điểm danh đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
