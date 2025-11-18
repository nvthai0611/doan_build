import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { DataTable, Column } from "@/components/common/Table/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2, ArrowLeft, Download, Eye } from "lucide-react"
import { payrollService } from "../../../services/center-owner/payroll-teacher/payroll.service"
import BackPayDetailModal from "./components/BackPayDetailModal"

interface BackPayItem {
  backPayInfo: any
  sessionInfo: any
  classInfo: any
  primaryTeacherInfo: any
  substituteTeacherInfo: any
  payoutDetails: any
}

export default function BackPayDetails() {
  const { payrollId } = useParams()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedBackPay, setSelectedBackPay] = useState<BackPayItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["back-pay-details", payrollId],
    queryFn: () => payrollService.getPayrollBackPayDetails(String(payrollId)),
    enabled: !!payrollId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const backPayData = data
  const fmt = (n?: number) => Number(n || 0).toLocaleString("vi-VN")

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Transform back pay details to table rows
  const backPayRows = useMemo(() => {
    return backPayData?.backPayDetails?.map((item: BackPayItem, index: number) => ({
      id: item.backPayInfo.sessionId || String(index),
      sessionId: item.backPayInfo.sessionId,
      sessionDate: formatDate(item.sessionInfo.sessionDate),
      sessionTime: `${item.sessionInfo.startTime} - ${item.sessionInfo.endTime}`,
      className: `${item.classInfo.name} (${item.classInfo.classCode})`,
      primaryTeacher: item.primaryTeacherInfo.fullName,
      description: item.backPayInfo.description,
      revenuePerSession: item.backPayInfo.revenuePerSession,
      payoutRate: item.backPayInfo.payoutRate,
      payoutAmount: item.backPayInfo.payoutAmount,
      status: item.sessionInfo.status,
      fullData: item,
    })) || []
  }, [backPayData])

  const totalPages = Math.max(1, Math.ceil(backPayRows.length / itemsPerPage))
  const pagedRows = useMemo(() => {
    return backPayRows.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [backPayRows, currentPage, itemsPerPage])

  // Calculate back pay percentage safely
  const backPayPercentage = useMemo(() => {
    const totalRevenue = backPayData?.backPaySummary?.statistics?.totalRevenue || 0
    const totalBackPay = backPayData?.backPaySummary?.statistics?.totalBackPayAmount || 0

    if (totalRevenue === 0) return 0
    return ((totalBackPay / totalRevenue) * 100).toFixed(2)
  }, [backPayData])

  const handleViewDetail = (item: BackPayItem) => {
    setSelectedBackPay(item)
    setShowDetailModal(true)
  }

  const getSessionStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      end: { label: "Đã kết thúc", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      scheduled: { label: "Đã lên lịch", variant: "outline" },
      day_off: { label: "Nghỉ", variant: "secondary" },
    }

    const config = statusConfig[status || ""] || { label: status || "-", variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const columns: Column<any>[] = [
    {
      key: "sessionDate",
      header: "Ngày buổi học",
      sortable: true,
    },
    {
      key: "sessionTime",
      header: "Giờ học",
      sortable: false,
    },
    {
      key: "className",
      header: "Lớp học",
      sortable: true,
    },
    {
      key: "primaryTeacher",
      header: "Giáo viên chính",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900">{row.primaryTeacher}</p>
        </div>
      ),
    },
    {
      key: "revenuePerSession",
      header: "Doanh thu",
      sortable: true,
      render: (row) => (
        <span className="text-blue-700 font-medium">
          {fmt(row.revenuePerSession)} đ
        </span>
      ),
    },
    {
      key: "payoutRate",
      header: "Tỷ lệ (%)",
      sortable: true,
      render: (row) => (
        <Badge variant="outline">
          {(row.payoutRate * 100).toFixed(0)}%
        </Badge>
      ),
    },
    {
      key: "payoutAmount",
      header: "Số tiền truy lĩnh",
      sortable: true,
      render: (row) => (
        <span className="text-emerald-700 font-semibold">
          {fmt(row.payoutAmount)} đ
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => getSessionStatusBadge(row.status),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetail(row.fullData)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const handleExport = () => {
    // TODO: Implement export to Excel/PDF
    console.log("Export back pay details")
  }

  const handleGoBack = () => {
    navigate(`/center-qn/payroll-teacher/payroll/${payrollId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
        <Button onClick={handleGoBack} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => navigate("/center-qn/payroll-teacher")}
            className="cursor-pointer hover:text-foreground"
          >
            Quản lý lương giáo viên
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => navigate(`/center-qn/payroll-teacher/payroll/${payrollId}`)}
            className="cursor-pointer hover:text-foreground"
          >
            Chi tiết bảng lương
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-foreground font-medium">Chi tiết truy lĩnh</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết truy lĩnh lương</h1>
          <p className="text-gray-600 mt-1">
            Bảng lương từ {formatDate(backPayData?.payroll?.periodStart)} đến{" "}
            {formatDate(backPayData?.payroll?.periodEnd)}
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Xuất file
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-blue-700 font-medium mb-2">Giáo viên</p>
          <p className="text-xl font-bold text-blue-900">{backPayData?.teacher?.fullName || "-"}</p>
          <p className="text-xs text-blue-600 mt-2">{backPayData?.teacher?.email || "-"}</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-purple-700 font-medium mb-2">Số buổi truy lĩnh</p>
          <p className="text-3xl font-bold text-purple-900">
            {backPayData?.backPaySummary?.backPayCount || 0}
          </p>
          <p className="text-xs text-purple-600 mt-2">buổi</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-emerald-700 font-medium mb-2">Tổng tiền truy lĩnh</p>
          <p className="text-2xl font-bold text-emerald-900">
            {fmt(backPayData?.backPaySummary?.statistics?.totalBackPayAmount || 0)} đ
          </p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100 p-6 hover:shadow-lg transition-shadow">
          <p className="text-sm text-orange-700 font-medium mb-2">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-orange-900">
            {fmt(backPayData?.backPaySummary?.statistics?.totalRevenue || 0)} đ
          </p>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Thông tin bảng lương</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Kỳ lương:</span>
              <span className="font-medium text-gray-900">
                {formatDate(backPayData?.payroll?.periodStart)} -{" "}
                {formatDate(backPayData?.payroll?.periodEnd)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Trạng thái:</span>
              <Badge variant="outline">{backPayData?.payroll?.status || "-"}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ngày xử lý:</span>
              <span className="font-medium text-gray-900">
                {formatDate(backPayData?.backPaySummary?.processedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Thống kê truy lĩnh</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Số buổi truy lĩnh:</span>
              <span className="font-semibold text-purple-700">
                {backPayData?.backPaySummary?.backPayCount || 0} buổi
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Tổng tiền truy lĩnh:</span>
              <span className="font-semibold text-emerald-700">
                {fmt(backPayData?.backPaySummary?.statistics?.totalBackPayAmount || 0)} đ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">% truy lĩnh:</span>
              <span className="font-semibold text-orange-700">
                {backPayPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">Chi tiết các buổi học bị truy lĩnh</h3>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng: {backPayRows.length} buổi
          </p>
        </div>
        <DataTable
          data={pagedRows}
          allData={backPayRows}
          columns={columns}
          loading={isLoading}
          error={isError ? "Lỗi tải dữ liệu" : null}
          emptyMessage="Không có dữ liệu truy lĩnh"
          enableSearch={true}
          enableSort={true}
          pagination={{
            currentPage,
            totalPages,
            totalItems: backPayRows.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: (n) => {
              setItemsPerPage(n)
              setCurrentPage(1)
            },
            showItemsPerPage: true,
            showPageInfo: true,
          }}
          rowKey="id"
        />
      </div>

      {/* Detail Modal */}
      {selectedBackPay && (
        <BackPayDetailModal
          data={selectedBackPay}
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  )
}