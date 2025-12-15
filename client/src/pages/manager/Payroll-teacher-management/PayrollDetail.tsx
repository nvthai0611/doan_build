"use client"

import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { payrollService } from "@/services/center-owner/payroll-teacher/payroll.service"
import { DataTable, Column } from "@/components/common/Table/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Filter, 
  X, 
  Check, 
  XCircle, 
  DollarSign, 
  Info, 
  Mail, 
  Send,
  Plus,
  Minus,
  FileText
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/assets/shadcn-ui/components/ui/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { PaymentModal } from "./components/PaymentModal"
import { RejectionReasonModal } from "./components/RejectionReasonModal"

export default function PayrollDetail() {
  const { payrollId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined)
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined)
  const [classFilter, setClassFilter] = useState<string>("all")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payroll-detail", payrollId],
    queryFn: () => payrollService.getPayrollById(String(payrollId)),
    enabled: !!payrollId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const payroll: any = useMemo(() => (data as any) ?? null, [data])

  const adjustmentDetails = useMemo(() => {
    if (!payroll?.adjustmentDetails) return []
    try {
      const details = typeof payroll.adjustmentDetails === 'string' 
        ? JSON.parse(payroll.adjustmentDetails)
        : payroll.adjustmentDetails
      return Array.isArray(details) ? details : []
    } catch (error) {
      console.error('Error parsing adjustment details:', error)
      return []
    }
  }, [payroll?.adjustmentDetails])

  const adjustmentSummary = useMemo(() => {
    const bonuses = adjustmentDetails
      .filter((adj: any) => adj.type === 'bonus')
      .reduce((sum: number, adj: any) => sum + Number(adj.amount || 0), 0)
    
    const deductions = adjustmentDetails
      .filter((adj: any) => adj.type === 'deduction')
      .reduce((sum: number, adj: any) => sum + Number(adj.amount || 0), 0)
    
    return { bonuses, deductions, total: bonuses - deductions }
  }, [adjustmentDetails])

  const resendEmailMutation = useMutation({
    mutationFn: (payrollId: string) => payrollService.sendPayrollNotification([payrollId]),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã gửi lại email cho giáo viên, hãy chờ đợi giáo viên phản hồi',
        variant: 'default'
      })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['payroll-detail', payrollId] })
        refetch()
      }, 7000)
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể gửi email',
        variant: 'destructive'
      })
    }
  })

  const statusBadge = (status?: string) => {
    switch (status) {
      case "approved_by_teacher":
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case "waiting_teacher_approval":
        return <Badge className="bg-blue-100 text-blue-800">Chờ giáo viên duyệt</Badge>
      case "cancelled":
        return <Badge className="bg-gray-200 text-gray-700">Đã hủy</Badge>
      case "rejected_by_teacher":
        return (
          <Badge 
            className="bg-red-100 text-red-800 cursor-pointer hover:bg-red-200 transition-colors"
            onClick={() => setShowRejectionModal(true)}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối - Xem lý do
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "-"}</Badge>
    }
  }

  const sessionStatusBadge = (status?: string) => {
    switch (status) {
      case "end":
        return <Badge className="bg-green-100 text-green-700">Đã kết thúc</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Đã hủy</Badge>
      case "day_off":
        return <Badge className="bg-blue-100 text-blue-700">Nghỉ</Badge>
      case "has_not_happened":
        return <Badge className="bg-slate-100 text-slate-700">Chưa diễn ra</Badge>
      default:
        return <Badge variant="outline">{status || "-"}</Badge>
    }
  }

  const fmt = (n?: number) => Number(n || 0).toLocaleString("vi-VN")

  const periodLabel = payroll?.periodStart
    ? `${new Date(payroll.periodStart).toLocaleDateString("vi-VN")} - ${new Date(payroll.periodEnd).toLocaleDateString("vi-VN")}`
    : "-"

  const periodStartDate = useMemo(() => {
    return payroll?.periodStart ? new Date(payroll.periodStart) : undefined
  }, [payroll?.periodStart])

  const periodEndDate = useMemo(() => {
    return payroll?.periodEnd ? new Date(payroll.periodEnd) : undefined
  }, [payroll?.periodEnd])

  const sessionRows = useMemo(() => {
    const details: any[] = payroll?.payoutDetails || []
    return details.map((d: any) => {
      const s = d.session || {}
      const c = s.class || {}
      return {
        id: String(d.id ?? s.id ?? Math.random()),
        sessionId: s.id || "",
        date: s.sessionDate ? new Date(s.sessionDate).toLocaleDateString("vi-VN") : "-",
        rawDate: s.sessionDate ? new Date(s.sessionDate) : null,
        time: s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : "-",
        className: c?.name ? `${c.name} ${c.classCode ? `(${c.classCode})` : ""}` : "-",
        classId: c?.id || "",
        teacher: s.teacher?.user?.fullName || "-",
        substitute: s.substituteTeacher?.user?.fullName || "-",
        status: s.status || "-",
        notes: s.notes || "-",
        studentCount: d.studentCount || 0,
        totalRevenue: d.totalRevenue || 0,
        teacherPayout: d.teacherPayout || 0,
        payoutRate: d.payoutRate || 0,
      }
    }).sort((a: any, b: any) => {
      if (!a.rawDate) return 1
      if (!b.rawDate) return -1
      return b.rawDate.getTime() - a.rawDate.getTime()
    })
  }, [payroll])

  const uniqueClasses = useMemo(() => {
    const classMap = new Map()
    sessionRows.forEach((row: any) => {
      if (row.classId && row.className) {
        classMap.set(row.classId, row.className)
      }
    })
    return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }))
  }, [sessionRows])

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateFilter(date)
    setCurrentPage(1)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateFilter(date)
    setCurrentPage(1)
  }

  const handleClassChange = (classId: string) => {
    setClassFilter(classId)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setStartDateFilter(undefined)
    setEndDateFilter(undefined)
    setClassFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = startDateFilter || endDateFilter || classFilter !== "all"

  const filteredRows = useMemo(() => {
    let filtered = [...sessionRows]

    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((row: any) => {
        if (!row.rawDate) return false
        const sessionDate = row.rawDate
        const isAfterStart = !startDateFilter || sessionDate >= startDateFilter
        const isBeforeEnd = !endDateFilter || sessionDate <= endDateFilter
        return isAfterStart && isBeforeEnd
      })
    }

    if (classFilter && classFilter !== "all") {
      filtered = filtered.filter((row: any) => row.classId === classFilter)
    }

    return filtered
  }, [sessionRows, startDateFilter, endDateFilter, classFilter])

 const filteredCalculations = useMemo(() => {
  // Tính lương thực thu từ các buổi đã lọc
  const totalRevenue = filteredRows.reduce((sum: number, row: any) => 
    sum + (row.totalRevenue || 0), 0
  )

  // Tính tổng lương buổi học từ các buổi đã lọc
  const totalPayout = filteredRows.reduce((sum: number, row: any) => 
    sum + (row.teacherPayout || 0), 0
  )

  // Nếu không có filter, dùng giá trị gốc từ payroll
  const bonuses = hasActiveFilters ? 0 : Number(payroll?.bonuses || 0)
  const deductions = hasActiveFilters ? 0 : Number(payroll?.deductions || 0)
  const backPayAmount = hasActiveFilters ? 0 : Number(payroll?.backPayAmount || 0)

  // Tính tổng thanh toán
  const totalAmount = totalPayout + bonuses - deductions + backPayAmount

  return {
    totalRevenue,
    totalPayout,
    bonuses,
    deductions,
    backPayAmount,
    totalAmount
  }
}, [filteredRows, payroll, hasActiveFilters])
  const sessionColumns: Column<any>[] = [
    { key: "date", header: "Ngày" },
    { key: "time", header: "Thời gian" },
    {
      key: "notes",
      header: "Tên buổi học",
      render: (row) => (
        <button
          onClick={() => navigate(`/center-qn/classes/session-details/${row.sessionId}#general`)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {row.notes || "-"}
        </button>
      )
    },
    { key: "className", header: "Lớp" },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => sessionStatusBadge(row.status)
    },
    {
      key: "totalRevenue",
      header: "Doanh thu",
      render: (row) => `${fmt(row.totalRevenue)} đ`
    },
    {
      key: "teacherPayout",
      header: "Lương buổi",
      render: (row) => (
        <span className="font-medium text-emerald-700">
          {fmt(row.teacherPayout)} đ
        </span>
      )
    }
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRows.slice(start, start + itemsPerPage)
  }, [filteredRows, currentPage, itemsPerPage])

  const handleResendEmail = () => {
    if (!payrollId) return
    resendEmailMutation.mutate(payrollId)
  }

  const renderActionButtons = () => {
    const status = payroll?.status

    switch (status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              disabled={resendEmailMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {resendEmailMutation.isPending ? 'Đang gửi...' : 'Gửi cho giáo viên'}
            </Button>
          </div>
        )

      case "waiting_teacher_approval":
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              disabled={resendEmailMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {resendEmailMutation.isPending ? 'Đang gửi...' : 'Gửi lại email'}
            </Button>
          </div>
        )

      case "approved_by_teacher":
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Tạo thanh toán
            </Button>
          </div>
        )

      case "rejected_by_teacher":
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              disabled={resendEmailMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {resendEmailMutation.isPending ? 'Đang gửi...' : 'Gửi lại cho giáo viên'}
            </Button>
          </div>
        )

      case "paid":
      case "cancelled":
        return null

      default:
        return null
    }
  }
  console.log(filteredCalculations);
  

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Chi tiết bảng lương</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kỳ: {periodLabel} • Giáo viên: {payroll?.teacher?.user?.fullName || "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(payroll?.status)}
          {renderActionButtons()}
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/center-qn/payroll-teacher')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Quản lý lương giáo viên
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Chi tiết bảng lương
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ✅ Rejection Alert */}
      {payroll?.status === 'rejected_by_teacher' && payroll?.rejectionReason && (
        <div className="rounded-xl border bg-red-50 border-red-200 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                Giáo viên đã từ chối bảng lương này
              </h3>
              <p className="text-sm text-red-700 mb-3">
                <strong>Lý do:</strong> {payroll.rejectionReason}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectionModal(true)}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Summary Card */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Tổng quan bảng lương
            {hasActiveFilters && (
              <Badge variant="outline" className="ml-2 text-xs">
                Đã lọc
              </Badge>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Lương thực thu */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Lương thực thu</p>
            <p className="text-2xl font-bold text-blue-900">
              {fmt(filteredCalculations.totalRevenue)} đ
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-blue-600 mt-1">
                {filteredRows.length} buổi học
              </p>
            )}
          </div>

          {/* Lương buổi học cũ (Back Pay) */}
    <div className="bg-purple-50 rounded-lg p-4">
      <p className="text-sm text-purple-700 font-medium mb-1 flex items-center gap-1">
        <Plus className="w-3 h-3" />
        Lương buổi học cũ
      </p>
      <p className="text-2xl font-bold text-purple-900">
        +{fmt(filteredCalculations.backPayAmount)} đ
      </p>
      {!hasActiveFilters && payroll?.backPayAmount > 0 && (
        <p className="text-xs text-purple-600 mt-1">
          ({payroll.computedDetails?.backPayDetails?.length || 0} khoản)
        </p>
      )}
      {hasActiveFilters && (
        <p className="text-xs text-purple-600 mt-1">
          Không tính khi lọc
        </p>
      )}
    </div>

          

          {/* Thưởng */}
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-1 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Thưởng
            </p>
            <p className="text-2xl font-bold text-green-900">
              +{fmt(filteredCalculations.bonuses)} đ
            </p>
            {!hasActiveFilters && adjustmentSummary.bonuses > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ({adjustmentDetails.filter((a: any) => a.type === 'bonus').length} điều chỉnh)
              </p>
            )}
            {hasActiveFilters && (
              <p className="text-xs text-green-600 mt-1">
                Không tính khi lọc
              </p>
            )}
          </div>

          {/* Khấu trừ */}
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-1 flex items-center gap-1">
              <Minus className="w-3 h-3" />
              Khấu trừ
            </p>
            <p className="text-2xl font-bold text-red-900">
              -{fmt(filteredCalculations.deductions)} đ
            </p>
            {!hasActiveFilters && adjustmentSummary.deductions > 0 && (
              <p className="text-xs text-red-600 mt-1">
                ({adjustmentDetails.filter((a: any) => a.type === 'deduction').length} điều chỉnh)
              </p>
            )}
            {hasActiveFilters && (
              <p className="text-xs text-red-600 mt-1">
                Không tính khi lọc
              </p>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">Tỷ lệ % lương giáo viên</p>
            <p className="text-2xl font-bold text-blue-900">
              {payroll?.payoutDetails[0]?.payoutRate} 
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-blue-600 mt-1">
                {filteredRows.length} buổi học
              </p>
            )}
          </div>

          {/* Tổng cuối */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border-2 border-emerald-200">
            <p className="text-sm text-emerald-700 font-medium mb-1">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-emerald-900">
              {fmt(filteredCalculations.totalAmount)} đ
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-emerald-600 mt-1">
                Chỉ tính buổi học đã lọc
              </p>
            )}
          </div>
        </div>

        {/* ✅ Adjustment Details - Chỉ hiển thị khi không có filter */}
        {!hasActiveFilters && adjustmentDetails.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Chi tiết điều chỉnh ({adjustmentDetails.length})
            </h3>
            
            <div className="space-y-2">
              {adjustmentDetails.map((adj: any, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    adj.type === 'bonus' 
                      ? "bg-green-50 border border-green-200" 
                      : "bg-red-50 border border-red-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={adj.type === 'bonus' ? 'default' : 'destructive'}
                      className="gap-1"
                    >
                      {adj.type === 'bonus' ? (
                        <Plus className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {adj.type === 'bonus' ? 'Thưởng' : 'Khấu trừ'}
                    </Badge>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {adj.reason || 'Không có lý do'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      adj.type === 'bonus' ? "text-green-700" : "text-red-700"
                    )}>
                      {adj.type === 'bonus' ? '+' : '-'}{fmt(Number(adj.amount || 0))} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tổng điều chỉnh:</span>
                <span className={cn(
                  "font-semibold",
                  adjustmentSummary.total >= 0 ? "text-green-700" : "text-red-700"
                )}>
                  {adjustmentSummary.total >= 0 ? '+' : ''}{fmt(adjustmentSummary.total)} đ
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Thông báo khi có filter active */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Các số liệu trên chỉ tính cho {filteredRows.length} buổi học đã lọc. 
                Thưởng và khấu trừ không được tính khi đang lọc.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-medium text-slate-600">Bộ lọc</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDateFilter && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDateFilter ? format(startDateFilter, "dd/MM/yyyy", { locale: vi }) : "Từ ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDateFilter}
                onSelect={handleStartDateChange}
                initialFocus
                defaultMonth={startDateFilter ?? periodStartDate}
                fromDate={periodStartDate}
                toDate={endDateFilter ?? periodEndDate}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDateFilter && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDateFilter ? format(endDateFilter, "dd/MM/yyyy", { locale: vi }) : "Đến ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDateFilter}
                onSelect={handleEndDateChange}
                initialFocus
                defaultMonth={endDateFilter ?? periodStartDate}
                fromDate={startDateFilter ?? periodStartDate}
                toDate={periodEndDate}
              />
            </PopoverContent>
          </Popover>

          <Select value={classFilter} onValueChange={handleClassChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {uniqueClasses.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Hiển thị {filteredRows.length} / {sessionRows.length} buổi học
            </span>
          </div>
        </div>
      </div>

      {/* Back Pay Summary Card */}
      {payroll?.backPayAmount > 0 && (
        <div className="rounded-xl border bg-amber-50 border-amber-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  Có tiền lương buổi học cũ
                </h3>
                <p className="text-sm text-amber-700">
                  Bảng lương này bao gồm{" "}
                  <span className="font-semibold">
                    {fmt(payroll.backPayAmount)} đ
                  </span>{" "}
                  tiền lương từ các buổi học trước đó
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/center-qn/payroll-teacher/payroll/${payrollId}/back-pay-details`)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      )}

      {/* Sessions DataTable */}
      <div className="rounded-xl border bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Chi tiết các buổi học
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách các buổi học trong bảng lương này
          </p>
        </div>

        <DataTable
          data={pagedRows}
          allData={filteredRows}
          columns={sessionColumns}
          loading={isLoading}
          error={isError ? "Lỗi tải dữ liệu" : null}
          emptyMessage="Không có buổi học nào phù hợp với bộ lọc"
          enableSearch={true}
          enableSort={true}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: (p) => setCurrentPage(p),
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

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        payroll={payroll}
      />

      {/* ✅ MỚI: Rejection Reason Modal */}
      <RejectionReasonModal
        open={showRejectionModal}
        onOpenChange={setShowRejectionModal}
        payroll={payroll}
      />
    </div>
  )
}