"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DataTable, Column } from "@/components/common/Table/DataTable"
import { payrollService } from "@/services/center-owner/payroll-teacher/payroll.service"
import { useNavigate, useParams } from "react-router-dom"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/assets/shadcn-ui/components/ui/breadcrumb"

const getPreviousYearString = () => {
  const now = new Date()
  return (now.getFullYear()).toString()
}

// YearPicker UI (Popover + grid years)
const YearPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const selectYear = (year: number) => {
    onChange(year.toString())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9">
          <Calendar className="w-4 h-4 mr-2" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px]">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
            <Button
              key={year}
              variant="secondary"
              onClick={() => selectYear(year)}
              className="justify-center"
            >
              {year}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function PayrollOfTeacher() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Payroll DataTable states
  const [year, setYear] = useState<string>(getPreviousYearString())

  const { data: payrollApi, isLoading: payrollLoading, isError: payrollError, refetch: refetchPayroll } = useQuery({
    queryKey: ["teacher-payrolls", id, year],
    queryFn: () => payrollService.getListPayrollsByTeacherId(id!, year),
    enabled: !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  // Lấy danh sách payroll (array) từ API
  const rawPayrolls = useMemo(() => {
    return Array.isArray(payrollApi) ? payrollApi : []
  }, [payrollApi])

  // Tổng hợp số liệu cho Cards
  const payrollSummary = useMemo(() => {
    let totalAmount = 0
    let totalBonuses = 0
    let totalDeductions = 0
    let totalHours = 0

    if (Array.isArray(rawPayrolls)) {
      for (const p of rawPayrolls) {
        totalAmount += Number(p?.totalAmount || 0)
        totalBonuses += Number(p?.bonuses || 0)
        totalDeductions += Number(p?.deductions || 0)
        totalHours += Number(p?.teachingHours || 0)
      }
    }

    const latest = Array.isArray(rawPayrolls) && rawPayrolls.length > 0 ? rawPayrolls[0] : null
    const latestPeriod = latest
      ? `${new Date(latest.periodStart).toLocaleDateString("vi-VN")} - ${new Date(latest.periodEnd).toLocaleDateString("vi-VN")}`
      : "-"
    const latestStatus = latest?.status ?? "-"

    return {
      totalAmount,
      totalBonuses,
      totalDeductions,
      totalHours,
      latestPeriod,
      latestStatus
    }
  }, [rawPayrolls])

  const formatVND = (n: number) => n.toLocaleString("vi-VN")

  const payrollRows = useMemo(() => {
    const list = rawPayrolls
    if (!list) return []
    return list.map((p: any) => ({
      id: p.id,
      period: `${new Date(p.periodStart).toLocaleDateString("vi-VN")} - ${new Date(p.periodEnd).toLocaleDateString("vi-VN")}`,
      teachingHours: p.teachingHours ?? 0,
      hourlyRate: p.hourlyRate ?? 0,
      bonuses: p.bonuses ?? 0,
      deductions: p.deductions ?? 0,
      totalAmount: p.totalAmount ?? 0,
      status: p.status ?? "",
      note: p.computedDetails?.note || ""
    }))
  }, [rawPayrolls])

  const payrollColumns: Column<any>[] = [
    { key: "period", header: "Kỳ" },
    { key: "hourlyRate", header: "Đơn giá", render: r => r.hourlyRate.toLocaleString("vi-VN") },
    { key: "bonuses", header: "Thưởng", render: r => r.bonuses.toLocaleString("vi-VN") },
    { key: "deductions", header: "Khấu trừ", render: r => r.deductions.toLocaleString("vi-VN") },
    { key: "totalAmount", header: "Tổng", render: r => r.totalAmount.toLocaleString("vi-VN") },
    {
      key: "status",
      header: "Trạng thái",
      render: r => {
        switch (r.status) {
          case "approved":
            return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
          case "pending":
            return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
          case "rejected":
            return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
          default:
            return <Badge variant="outline">{r.status}</Badge>
        }
      }
    },
    { key: "note", header: "Ghi chú", render: r => r.note || "-" },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/center-qn/payroll-teacher/payroll/${r.id}`)}>
          <Eye className="w-4 h-4 mr-2" />
          Xem chi tiết
        </Button>
      )
    }
  ]

  const [payrollPage, setPayrollPage] = useState(1)
  const [payrollPageSize, setPayrollPageSize] = useState(10)
  const totalPayrollItems = payrollRows.length
  const totalPayrollPages = Math.max(1, Math.ceil(totalPayrollItems / payrollPageSize))
  const pagedPayrollRows = useMemo(() => {
    const start = (payrollPage - 1) * payrollPageSize
    return payrollRows.slice(start, start + payrollPageSize)
  }, [payrollRows, payrollPage, payrollPageSize])

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lương theo năm</h2>
          <div className="flex items-center gap-3">
            <YearPicker value={year} onChange={setYear} />
            <span className="text-xs text-gray-500">Mặc định: {getPreviousYearString()}</span>
          </div>
        </div>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/center-qn/payroll-teacher')} className="text-muted-foreground hover:text-foreground cursor-pointer">
                Quản lý lương giáo viên
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">Danh sách hóa đơn của giáo viên</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Tổng lương</p>
                <p className="text-2xl font-semibold text-emerald-900">{formatVND(payrollSummary.totalAmount)} đ</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">Kỳ gần nhất: {payrollSummary.latestPeriod}</p>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Thưởng</p>
                <p className="text-2xl font-semibold text-amber-900">{formatVND(payrollSummary.totalBonuses)} đ</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">+</span>
            </div>
            <p className="text-xs text-amber-700/80 mt-1">Cộng dồn theo năm lọc</p>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-700">Khấu trừ</p>
                <p className="text-2xl font-semibold text-rose-900">{formatVND(payrollSummary.totalDeductions)} đ</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">-</span>
            </div>
            <p className="text-xs text-rose-700/80 mt-1">Cộng dồn theo năm lọc</p>
          </div>
        </div>

        {/* Bảng payroll (DataTable) */}
        <DataTable
          data={pagedPayrollRows}
          allData={payrollRows}
          columns={payrollColumns}
          loading={payrollLoading}
          error={payrollError ? "Lỗi tải dữ liệu" : null}
          emptyMessage="Không có bảng lương của giáo viên trong năm này."
          enableSearch={true}
          enableSort={true}
          pagination={{
            currentPage: payrollPage,
            totalPages: totalPayrollPages,
            totalItems: totalPayrollItems,
            itemsPerPage: payrollPageSize,
            onPageChange: p => setPayrollPage(p),
            onItemsPerPageChange: n => {
              setPayrollPageSize(n)
              setPayrollPage(1)
            },
            showItemsPerPage: true,
            showPageInfo: true
          }}
          rowKey="id"
        />
      </div>
    </div>
  )
}
