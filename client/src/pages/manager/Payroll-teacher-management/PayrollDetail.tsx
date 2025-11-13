"use client"

import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { payrollService } from "@/services/center-owner/payroll-teacher/payroll.service"
import { DataTable, Column } from "@/components/common/Table/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/assets/shadcn-ui/components/ui/breadcrumb"

export default function PayrollDetail() {
  const { payrollId } = useParams()
  const navigate = useNavigate()

  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined)
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined)
  const [classFilter, setClassFilter] = useState<string>("all")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payroll-detail", payrollId],
    queryFn: () => payrollService.getPayrollById(String(payrollId)),
    enabled: !!payrollId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const payroll: any = useMemo(() => (data as any) ?? null, [data])

  const statusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
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
      case "scheduled":
        return <Badge className="bg-slate-100 text-slate-700">Đã lên lịch</Badge>
      default:
        return <Badge variant="outline">{status || "-"}</Badge>
    }
  }

  const fmt = (n?: number) => Number(n || 0).toLocaleString("vi-VN")

  const periodLabel = payroll?.periodStart
    ? `${new Date(payroll.periodStart).toLocaleDateString("vi-VN")} - ${new Date(payroll.periodEnd).toLocaleDateString("vi-VN")}`
    : "-"

  // Limit date picker within current payroll period
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
        sessionId: s.id || "", // Add sessionId for navigation
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
      // Sort by date descending
      if (!a.rawDate) return 1
      if (!b.rawDate) return -1
      return b.rawDate.getTime() - a.rawDate.getTime()
    })
  }, [payroll])

  // Get unique classes for filter
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

  // Apply filters
  const filteredRows = useMemo(() => {
    let filtered = [...sessionRows]

    // Filter by date range
    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((row: any) => {
        if (!row.rawDate) return false
        
        const sessionDate = row.rawDate
        const isAfterStart = !startDateFilter || sessionDate >= startDateFilter
        const isBeforeEnd = !endDateFilter || sessionDate <= endDateFilter
        
        return isAfterStart && isBeforeEnd
      })
    }

    // Filter by class
    if (classFilter && classFilter !== "all") {
      filtered = filtered.filter((row: any) => row.classId === classFilter)
    }

    return filtered
  }, [sessionRows, startDateFilter, endDateFilter, classFilter])

  const sessionColumns: Column<any>[] = [
    { key: "date", header: "Ngày", sortable: true },
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
    { key: "className", header: "Lớp"},
    { key: "teacher", header: "Giáo viên" },
    { 
      key: "status", 
      header: "Trạng thái",
      render: (row) => sessionStatusBadge(row.status)
    },
    {
      key: "studentCount",
      header: "Số HS",
      sortable: true,
      render: (row) => `${row.studentCount} HS`
    },
    {
      key: "totalRevenue",
      header: "Doanh thu",
      sortable: true,
      render: (row) => `${fmt(row.totalRevenue)} đ`
    },
    {
      key: "teacherPayout",
      header: "Lương buổi",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-emerald-700">
          {fmt(row.teacherPayout)} đ
        </span>
      )
    }
  ]

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRows.slice(start, start + itemsPerPage)
  }, [filteredRows, currentPage, itemsPerPage])

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
        <div>{statusBadge(payroll?.status)}</div>
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
            <BreadcrumbLink
              onClick={() => navigate(`/center-qn/payroll-teacher/${payroll?.teacher?.id}`)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Danh sách hóa đơn của giáo viên
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Danh sách chi tiết hóa đơn của giáo viên
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
          {/* Start Date Filter */}
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

          {/* End Date Filter */}
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

          {/* Class Filter */}
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

          {/* Filter Summary */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Hiển thị {filteredRows.length} / {sessionRows.length} buổi học
            </span>
          </div>
        </div>
      </div>

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
    </div>
  )
}