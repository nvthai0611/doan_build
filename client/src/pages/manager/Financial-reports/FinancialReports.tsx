"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedButton } from "@/components/ui/protected-button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Wallet,
  Receipt,
  UserCheck,
  ArrowDownRight,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFinancialSummary, useOverdueStudents, usePendingStudents, useClassStudentsStatus } from "@/hooks/useFinancialSummary"
import { DataTable, Column } from "@/components/common/Table/DataTable"
import { usePagination } from "@/hooks/usePagination"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
  BarChart,
  Bar,
} from "recharts"

const months = [
  { value: "1", label: "Tháng 1" },
  { value: "2", label: "Tháng 2" },
  { value: "3", label: "Tháng 3" },
  { value: "4", label: "Tháng 4" },
  { value: "5", label: "Tháng 5" },
  { value: "6", label: "Tháng 6" },
  { value: "7", label: "Tháng 7" },
  { value: "8", label: "Tháng 8" },
  { value: "9", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
]

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: `Năm ${currentYear - i}`,
}))

const TUITION_COLORS = ["#10b981", "#f59e0b", "#ef4444"]

export default function FinancialReports() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("monthly")
  // Default to previous month of current date
  const [selectedMonth, setSelectedMonth] = useState(String(prevMonth))
  const [selectedMonthYear, setSelectedMonthYear] = useState(String(prevMonthYear))
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
  const [selectedClass, setSelectedClass] = useState<any>(null)

  // Pagination for class revenue table
  const classPagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 5,
    totalItems: 0
  })

  // Fetch data from backend with selected filters
  const { summary, isLoading } = useFinancialSummary({
    month: activeTab === "monthly" ? selectedMonth : undefined,
    year: activeTab === "monthly" ? selectedMonthYear : selectedYear
  })

  const { students: overdueStudents, isLoading: isLoadingOverdue } = useOverdueStudents({
    month: activeTab === "monthly" ? selectedMonth : undefined,
    year: activeTab === "monthly" ? selectedMonthYear : selectedYear
  })

  const { students: pendingStudents, isLoading: isLoadingPending } = usePendingStudents({
    month: activeTab === "monthly" ? selectedMonth : undefined,
    year: activeTab === "monthly" ? selectedMonthYear : selectedYear
  })

  const { classesData, isLoading: isLoadingClasses } = useClassStudentsStatus({
    month: activeTab === "monthly" ? selectedMonth : undefined,
    year: activeTab === "monthly" ? selectedMonthYear : selectedYear
  })

  // Tính toán phân trang cho class data
  const startIndex = (classPagination.currentPage - 1) * classPagination.itemsPerPage
  const endIndex = startIndex + classPagination.itemsPerPage
  const paginatedClassesData = classesData.slice(startIndex, endIndex)
  const totalClassPages = Math.ceil(classesData.length / classPagination.itemsPerPage)

  // Calculate total revenue from class revenue table (sum of all classes' revenue)
  const totalClassTableRevenue = classesData.reduce((acc, cls: any) => acc + (cls.totalRevenueAmount || 0), 0)

  // Calculate class revenue change percentage using backend data
  const prevMonthClassRevenue = summary?.revenue.prevMonthClassRevenue || 0
  const classRevenueChangePercent = prevMonthClassRevenue > 0 
    ? Math.round(((totalClassTableRevenue - prevMonthClassRevenue) / prevMonthClassRevenue) * 100) 
    : 0

  // Derive tuition status percentages from student counts to mirror the class table
  const studentTuitionBreakdown = (() => {
    const totals = classesData.reduce(
      (acc: any, cls: any) => {
        acc.paid += cls.paidStudents || 0
        acc.pending += cls.pendingStudents || 0
        acc.overdue += cls.overdueStudents || 0
        return acc
      },
      { paid: 0, pending: 0, overdue: 0 }
    )

    const totalConsidered = totals.paid + totals.pending + totals.overdue
    if (totalConsidered <= 0) {
      return { counts: totals, percent: { paid: 0, pending: 0, overdue: 0 } }
    }

    const paid = Math.round((totals.paid / totalConsidered) * 100)
    const pending = Math.round((totals.pending / totalConsidered) * 100)
    const overdue = Math.max(0, 100 - paid - pending)
    return { counts: totals, percent: { paid, pending, overdue } }
  })()

  const tuitionChartPercent = (() => {
    const totalCounts = studentTuitionBreakdown.counts.paid + studentTuitionBreakdown.counts.pending + studentTuitionBreakdown.counts.overdue
    if (totalCounts > 0) return studentTuitionBreakdown.percent
    return summary?.tuition.breakdownPercent || { paid: 0, pending: 0, overdue: 0 }
  })()

  const toggleExpand = (studentId: string) => {
    const newExpanded = new Set(expandedStudents)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedStudents(newExpanded)
  }

  return (
    <div className="p-6 space-y-6 bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tổng quan doanh thu</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi doanh thu, lương giáo viên và tình hình tài chính của trung tâm
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted p-1">
          <TabsTrigger value="monthly" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Calendar className="w-4 h-4" />
            Tổng quan theo tháng
          </TabsTrigger>
          <TabsTrigger value="yearly" className="flex items-center gap-2 data-[state=active]:bg-background">
            <CalendarDays className="w-4 h-4" />
            Tổng quan theo năm
          </TabsTrigger>
        </TabsList>

        {/* Monthly Tab Content */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Tháng:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Năm:</span>
              <Select value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monthly Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Doanh thu T{selectedMonth}/{selectedMonthYear}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {isLoading ? "..." : new Intl.NumberFormat('vi-VN').format(totalClassTableRevenue) + '₫'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-100">
                      {classRevenueChangePercent >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm">{classRevenueChangePercent >= 0 ? '+' : ''}{classRevenueChangePercent}% so với tháng trước</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">
                      Lợi nhuận ròng T{selectedMonth}/{selectedMonthYear}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {isLoading ? "..." : new Intl.NumberFormat('vi-VN').format(totalClassTableRevenue - (summary?.payroll.paidAmount || 0)) + '₫'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-100">
                      {(totalClassTableRevenue - (summary?.payroll.paidAmount || 0)) - (prevMonthClassRevenue - (summary?.payroll.paidAmount || 0)) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {classRevenueChangePercent >= 0 ? '+' : ''}{classRevenueChangePercent}% so với tháng trước
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-sm font-medium">
                      Lương GV T{selectedMonth}/{selectedMonthYear}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {isLoading ? "..." : summary?.payroll.paidAmount ? new Intl.NumberFormat('vi-VN').format(summary.payroll.paidAmount) + '₫' : '0₫'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-rose-100">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm">{summary?.payroll.teacherCountPaid || 0} giáo viên</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <UserCheck className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">
                      Công nợ T{selectedMonth}/{selectedMonthYear}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {isLoading ? "..." : summary?.tuition.overdueAmount ? new Intl.NumberFormat('vi-VN').format(summary.tuition.overdueAmount) + '₫' : '0₫'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-amber-100">
                      <Receipt className="w-4 h-4" />
                      <span className="text-sm">{summary?.tuition.outstandingStudentsCount || 0} học sinh nợ</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Wallet className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Doanh thu & Lương GV theo tháng
                </CardTitle>
                <CardDescription>So sánh doanh thu và chi phí lương 12 tháng gần nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary?.revenue.monthlyTrend?.map(m => ({
                      month: m.label,
                      revenue: m.revenue / 1_000_000,
                      salary: m.salary / 1_000_000
                    })) || []}>
                      <defs>
                        <linearGradient id="colorRevenueMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSalaryMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                        formatter={(value: number, name: string) => [
                          new Intl.NumberFormat('vi-VN').format(Math.round(value * 1_000_000)) + '₫',
                          name === "revenue" ? "Doanh thu" : "Lương GV",
                        ]}
                      />
                      <Legend formatter={(value) => (value === "revenue" ? "Doanh thu" : "Lương GV")} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorRevenueMonthly)"
                        name="revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="salary"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#colorSalaryMonthly)"
                        name="salary"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-violet-500" />
                  Tình trạng thu học phí
                </CardTitle>
                <CardDescription>Tỷ lệ thu học phí tháng {selectedMonth}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Đã thu", value: tuitionChartPercent.paid },
                          { name: "Chưa thu", value: tuitionChartPercent.pending },
                          { name: "Quá hạn", value: tuitionChartPercent.overdue }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: "Đã thu", value: tuitionChartPercent.paid },
                          { name: "Chưa thu", value: tuitionChartPercent.pending },
                          { name: "Quá hạn", value: tuitionChartPercent.overdue }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TUITION_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    { name: "Đã thu", value: tuitionChartPercent.paid },
                    { name: "Chưa thu", value: tuitionChartPercent.pending },
                    { name: "Quá hạn", value: tuitionChartPercent.overdue }
                  ].map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TUITION_COLORS[index] }}
                        ></div>
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Students */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Quá hạn thanh toán tháng {selectedMonth}
                    </CardTitle>
                    <CardDescription>Danh sách học sinh có hoá đơn quá hạn thanh toán</CardDescription>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Tổng số</p>
                    <p className="font-bold text-red-600 text-lg">{overdueStudents.length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {overdueStudents.length > 0 ? (
                    overdueStudents.map((student: any) => {
                      const isExpanded = expandedStudents.has(`overdue-${student.studentId}`)
                      return (
                        <div key={`overdue-${student.studentId}`}>
                          <div
                            onClick={() => toggleExpand(`overdue-${student.studentId}`)}
                            className="p-3 rounded-lg transition-colors cursor-pointer bg-red-50 border border-red-200 hover:bg-red-100"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{student.studentName}</p>
                                <p className="text-xs text-muted-foreground">{student.classes?.join(', ') || 'N/A'}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-bold text-sm">
                                  {new Intl.NumberFormat("vi-VN").format(student.totalAmount)}₫
                                </p>
                                <p className="text-xs font-semibold text-red-600">{student.records.length} kỳ học phí</p>
                              </div>
                              <div className="ml-2">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 ml-4 pl-3 border-l-2 border-red-300 space-y-2">
                              {student.records.map((record: any) => {
                                const dueDate = new Date(record.dueDate)
                                const today = new Date()
                                const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                                return (
                                  <div key={record.feeRecordId} className="p-2 rounded text-xs bg-red-100 text-red-900">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold">
                                        {new Intl.NumberFormat("vi-VN").format(record.amount)}₫
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded font-semibold bg-red-200 text-red-700">
                                        Quá hạn {daysOverdue}d
                                      </span>
                                    </div>
                                    <p>Hạn: {dueDate.toLocaleDateString('vi-VN')}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <p>✓ Không có hoá đơn quá hạn</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Students */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      Chưa thanh toán tháng {selectedMonth}
                    </CardTitle>
                    <CardDescription>Danh sách học sinh có hoá đơn chưa thanh toán</CardDescription>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Tổng số</p>
                    <p className="font-bold text-amber-600 text-lg">{pendingStudents.length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {pendingStudents.length > 0 ? (
                    pendingStudents.map((student: any) => {
                      const isExpanded = expandedStudents.has(`pending-${student.studentId}`)
                      return (
                        <div key={`pending-${student.studentId}`}>
                          <div
                            onClick={() => toggleExpand(`pending-${student.studentId}`)}
                            className="p-3 rounded-lg transition-colors cursor-pointer bg-amber-50 border border-amber-200 hover:bg-amber-100"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{student.studentName}</p>
                                <p className="text-xs text-muted-foreground">{student.classes?.join(', ') || 'N/A'}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="font-bold text-sm">
                                  {new Intl.NumberFormat("vi-VN").format(student.totalAmount)}₫
                                </p>
                                <p className="text-xs font-semibold text-amber-600">{student.records.length} kỳ học phí</p>
                              </div>
                              <div className="ml-2">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 ml-4 pl-3 border-l-2 border-amber-300 space-y-2">
                              {student.records.map((record: any) => {
                                const dueDate = new Date(record.dueDate)
                                return (
                                  <div key={record.feeRecordId} className="p-2 rounded text-xs bg-amber-100 text-amber-900">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold">
                                        {new Intl.NumberFormat("vi-VN").format(record.amount)}₫
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded font-semibold bg-amber-200 text-amber-700">
                                        {record.status === 'processing' ? 'Đang xử lý' : 'Chưa thanh toán'}
                                      </span>
                                    </div>
                                    <p>Hạn: {dueDate.toLocaleDateString('vi-VN')}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <p>✓ Tất cả hoá đơn đã thanh toán</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Revenue Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Doanh thu và tình trạng đóng học phí theo lớp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={paginatedClassesData}
                columns={[
                  {
                    key: "className",
                    header: "Tên lớp",
                    render: (item: any) => (
                      <div>
                        <p className="font-semibold text-sm">{item.className}</p>
                        {item.subjectName && (
                          <p className="text-xs text-muted-foreground">{item.subjectName}</p>
                        )}
                      </div>
                    )
                  },
                  {
                    key: "students",
                    header: "Tổng học sinh",
                    align: "center",
                    render: (item: any) => <span className="font-semibold">{item.totalStudents}</span>
                  },
                  {
                    key: "paid",
                    header: "Đã đóng",
                    align: "center",
                    render: (item: any) => <span className="font-semibold text-green-600">{item.paidStudents}</span>
                  },
                  {
                    key: "unpaid",
                    header: "Chưa đóng",
                    align: "center",
                    render: (item: any) => <span className="font-semibold text-amber-600">{item.unpaidStudents}</span>
                  },
                  {
                    key: "progress",
                    header: "Tiến độ",
                    render: (item: any) => {
                      const paidPercentage = item.totalStudents > 0 
                        ? Math.round((item.paidStudents / item.totalStudents) * 100)
                        : 0
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${paidPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 min-w-max">{paidPercentage}%</span>
                        </div>
                      )
                    }
                  },
                  {
                    key: "revenue",
                    header: "Doanh thu",
                    align: "right",
                    render: (item: any) => (
                      <span className="font-bold">
                        {new Intl.NumberFormat('vi-VN').format(item.totalRevenueAmount)}₫
                      </span>
                    )
                  },
                  {
                    key: "actions",
                    header: "Học sinh chưa đóng học phí",
                    align: "center",
                    render: (item: any) => (
                      item.unpaidStudents > 0 && (
                        <button
                          onClick={() => setSelectedClass(item)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      )
                    )
                  }
                ]}
                loading={isLoadingClasses}
                error={null}
                emptyMessage="Không có dữ liệu lớp học"
                rowKey="classId"
                hoverable={true}
                enableSearch={false}
                enableSort={false}
                pagination={{
                  currentPage: classPagination.currentPage,
                  totalPages: totalClassPages,
                  totalItems: classesData.length,
                  itemsPerPage: classPagination.itemsPerPage,
                  onPageChange: classPagination.setCurrentPage,
                  onItemsPerPageChange: classPagination.setItemsPerPage,
                  showItemsPerPage: true,
                  showPageInfo: true
                }}
              />
            </CardContent>
          </Card>

          {/* Dialog hiển thị học sinh chưa đóng học phí */}
          <Dialog open={selectedClass !== null} onOpenChange={(open) => !open && setSelectedClass(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  {selectedClass?.className}
                </DialogTitle>
                <DialogDescription>
                  {selectedClass?.subjectName && `Môn: ${selectedClass.subjectName}`}
                </DialogDescription>
              </DialogHeader>
              
              {selectedClass && (
                <div className="space-y-4 mt-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                      <p className="text-2xl font-bold">{selectedClass.totalStudents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Đã đóng</p>
                      <p className="text-2xl font-bold text-green-600">{selectedClass.paidStudents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Chưa đóng</p>
                      <p className="text-2xl font-bold text-amber-600">{selectedClass.unpaidStudents}</p>
                    </div>
                  </div>

                  {/* Unpaid Students List */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Danh sách học sinh chưa đóng học phí:</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {selectedClass.unpaidStudentsList && selectedClass.unpaidStudentsList.length > 0 ? (
                        selectedClass.unpaidStudentsList.map((student: any) => (
                          <div
                            key={student.studentId}
                            className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm text-amber-900">{student.studentName}</p>
                              {student.email && (
                                <p className="text-xs text-amber-700 mt-1">{student.email}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-3 text-xs"
                              onClick={() => navigate(`/center-qn/students/${student.studentId}?tab=tuition`)}
                            >
                              Xem học phí
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          <p>Không có học sinh chưa đóng học phí</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Monthly Class Revenue & Teacher Salaries */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-rose-500" />
                      Lương giáo viên {selectedMonth}
                    </CardTitle>
                    <CardDescription>Tình trạng thanh toán lương</CardDescription>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Đã trả</p>
                      <p className="font-bold text-emerald-600">
                        {new Intl.NumberFormat("vi-VN").format(summary?.payroll.paidAmount || 0)}₫
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Chưa trả</p>
                      <p className="font-bold text-amber-600">
                        {new Intl.NumberFormat("vi-VN").format(summary?.payroll.pendingAmount || 0)}₫
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(summary?.payroll.teacherSalaries || []).map((teacher) => {
                    const statusMap: Record<string, { label: string; color: string }> = {
                      paid: { label: "Đã trả", color: "bg-emerald-500" },
                      pending: { label: "Chưa trả", color: "bg-amber-500" },
                      waiting_teacher_approval: { label: "Chờ GV duyệt", color: "bg-blue-500" },
                      approved_by_teacher: { label: "GV đã duyệt", color: "bg-violet-500" }
                    }

                    const status = statusMap[teacher.status] || { label: teacher.status, color: "bg-gray-500" }
                    const isPaid = teacher.status === 'paid'
                    // Safely derive display name to avoid union 'never' inference issues
                    const displayName: string = ((): string => {
                      const t: any = teacher as any
                      if (typeof t.teacherName === 'string' && t.teacherName.trim().length > 0) return t.teacherName
                      if (typeof t.name === 'string' && t.name.trim().length > 0) return t.name
                      return 'GV'
                    })()

                    return (
                      <div key={teacher.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${isPaid ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'} flex items-center justify-center text-white text-sm font-semibold`}>
                            {displayName.charAt(0) || 'T'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {('subject' in teacher && teacher.subject) ? `GV ${teacher.subject}` : ('periodStart' in teacher && teacher.periodStart) ? new Date(teacher.periodStart).toLocaleDateString('vi-VN') : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">
                            {new Intl.NumberFormat("vi-VN").format(teacher.salary)}₫
                          </span>
                          <Badge
                            variant={isPaid ? "default" : "secondary"}
                            className={status.color}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yearly Tab Content */}
        <TabsContent value="yearly" className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Chọn năm:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Yearly Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Doanh thu năm {selectedYear}</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? "..." : summary?.revenue.yearlyRevenue ? new Intl.NumberFormat('vi-VN').format(summary.revenue.yearlyRevenue) + '₫' : '0₫'}</p>
                    <div className="flex items-center gap-1 mt-2 text-blue-100">
                      {(summary?.revenue.yearlyRevenueChangePercent ?? 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {(summary?.revenue.yearlyRevenueChangePercent ?? 0) >= 0 ? '+' : ''}{summary?.revenue.yearlyRevenueChangePercent ?? 0}% so với năm trước
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Lợi nhuận ròng năm {selectedYear}</p>
                    <p className="text-sm text-emerald-100 mt-1">(Doanh thu - Lương GV)</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? "..." : summary ? new Intl.NumberFormat('vi-VN').format((summary.revenue.yearlyRevenue || 0) - (summary.payroll.yearlySalary || 0)) + '₫' : '0₫'}</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-100">
                      {(summary?.payroll.yearlyProfitChangePercent ?? 0) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm">{(summary?.payroll.yearlyProfitChangePercent ?? 0) >= 0 ? '+' : ''}{summary?.payroll.yearlyProfitChangePercent ?? 0}% so với năm trước</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-sm font-medium">Lương GV năm {selectedYear}</p>
                    <p className="text-3xl font-bold mt-2">{isLoading ? "..." : summary?.payroll.yearlySalary ? new Intl.NumberFormat('vi-VN').format(summary.payroll.yearlySalary) + '₫' : '0₫'}</p>
                    <div className="flex items-center gap-1 mt-2 text-rose-100">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm">{summary?.payroll.teacherCountPaid || 0} giáo viên</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <UserCheck className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yearly Summary Statistics */}
          <div className="grid grid-cols-1 gap-6">
            {/* Year-over-Year Comparison Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  So sánh các năm (Doanh thu vs Lương GV)
                </CardTitle>
                <CardDescription>Nhìn nhanh xu hướng 5 năm gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary?.revenue.yearlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                        formatter={(value: number, name: string) => [new Intl.NumberFormat('vi-VN').format(value) + '₫', name === 'revenue' ? 'Doanh thu' : 'Lương GV']}
                        labelFormatter={(label: string) => `Năm ${label}`}
                      />
                      <Legend formatter={(value) => (value === 'revenue' ? 'Doanh thu' : 'Lương GV')} />
                      <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[4,4,0,0]} />
                      <Bar dataKey="salary" name="salary" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  Thống kê tổng hợp năm {selectedYear}
                </CardTitle>
                <CardDescription>Các chỉ số quan trọng trong năm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Doanh thu TB/tháng</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {summary?.revenue.yearlyRevenue ? new Intl.NumberFormat('vi-VN').format(Math.round(summary.revenue.yearlyRevenue / 12)) + '₫' : '0₫'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Tổng doanh thu / 12 tháng</p>
                  </div>

                  <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-700 font-medium">Doanh thu TB/học sinh</span>
                      <span className="text-2xl font-bold text-violet-600">
                        {(() => {
                          const total = summary?.revenue.totalPaid ?? 0
                          const students = summary?.students?.totalCount ?? 0
                          const avg = students > 0 ? Math.round(total / students) : 0
                          return new Intl.NumberFormat('vi-VN').format(avg) + '₫'
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-violet-600 mt-1">Tổng doanh thu / Tổng học sinh</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
