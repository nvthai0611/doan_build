"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedButton } from "@/components/ui/protected-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { useState } from "react"
import { useFinancialSummary } from "@/hooks/useFinancialSummary"
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

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
  label: `Năm ${currentYear - i}`,
}))

const TUITION_COLORS = ["#10b981", "#f59e0b", "#ef4444"]

export default function FinancialReports() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedMonthYear, setSelectedMonthYear] = useState(String(currentYear))
  const [selectedYear, setSelectedYear] = useState(String(currentYear))

  // Fetch data from backend with selected filters
  const { summary, isLoading } = useFinancialSummary({
    month: activeTab === "monthly" ? selectedMonth : undefined,
    year: activeTab === "monthly" ? selectedMonthYear : selectedYear
  })

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
                      ₫{summary?.revenue.monthCollected ? (summary.revenue.monthCollected / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-100">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm">
                        -10% so với tháng trước
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
                    <p className="text-emerald-100 text-sm font-medium">
                      Lợi nhuận ròng T{selectedMonth}/{selectedMonthYear}
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      ₫{summary?.revenue.monthCollected && summary?.payroll.paidAmount ? ((summary.revenue.monthCollected - summary.payroll.paidAmount) / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-100">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm">+12.5% so với tháng trước</span>
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
                      ₫{summary?.payroll.paidAmount ? (summary.payroll.paidAmount / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M
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
                      ₫{summary?.tuition.pendingAmount ? ((summary.tuition.pendingAmount + summary.tuition.overdueAmount) / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-amber-100">
                      <Receipt className="w-4 h-4" />
                      <span className="text-sm">{summary?.tuition.outstandingStudentsCount || 0} học sinh chưa đóng</span>
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
                      <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value}M`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                        formatter={(value: number, name: string) => [
                          `₫${value}M`,
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

            
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        data={summary?.tuition ? [
                          { name: "Đã thu", value: summary.tuition.breakdownPercent.paid },
                          { name: "Chưa thu", value: summary.tuition.breakdownPercent.pending },
                          { name: "Quá hạn", value: summary.tuition.breakdownPercent.overdue }
                        ] : []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(summary?.tuition ? [
                          { name: "Đã thu", value: summary.tuition.breakdownPercent.paid },
                          { name: "Chưa thu", value: summary.tuition.breakdownPercent.pending },
                          { name: "Quá hạn", value: summary.tuition.breakdownPercent.overdue }
                        ] : []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TUITION_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {(summary?.tuition ? [
                    { name: "Đã thu", value: summary.tuition.breakdownPercent.paid },
                    { name: "Chưa thu", value: summary.tuition.breakdownPercent.pending },
                    { name: "Quá hạn", value: summary.tuition.breakdownPercent.overdue }
                  ] : []).map((item, index) => (
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
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-rose-500" />
                      Những học sinh chưa thanh toán học phí {selectedMonth}
                    </CardTitle>
                    <CardDescription>Tình trạng thanh toán học phí</CardDescription>
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

          {/* Monthly Class Revenue & Teacher Salaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  Doanh thu theo lớp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(summary?.classes.topRevenue || []).map((item, index) => (
                    <div key={'classId' in item ? item.classId : `class-${index}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{(((item as any).className ?? (item as any).class) as string) || 'Lớp'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">
                            {(() => {
                              const it: any = item as any
                              const revenueVal: number = 'revenueAmount' in item
                                ? Number((item as any).revenueAmount)
                                : Number(it.revenue ?? 0)
                              return `₫${Math.round(revenueVal / 1_000_000)}M`
                            })()}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">{(() => {
                            const it: any = item as any
                            const count = Number(it.studentCount ?? it.students ?? 0)
                            return `(${count} HS)`
                          })()}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                          style={{
                            width: (() => {
                              const it: any = item as any
                              const current = 'revenueAmount' in item ? Number(it.revenueAmount) : Number(it.revenue ?? 0)
                              const top = summary?.classes.topRevenue?.[0] ? Number((summary.classes.topRevenue[0] as any).revenueAmount) : 1
                              const ratio = top > 0 ? (current / top) : 0
                              return `${ratio * 100}%`
                            })()
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Tổng doanh thu các lớp</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₫{summary?.classes.totalClassRevenue ? (summary.classes.totalClassRevenue / 1_000_000).toFixed(1) : "0"}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-rose-500" />
                      Lương giáo viên tháng {selectedMonth}
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
                    
                    return (
                      <div key={teacher.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${isPaid ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'} flex items-center justify-center text-white text-sm font-semibold`}>
                            {(() => {
                              const t: any = teacher as any
                              const nm: string = (t.teacherName ?? t.name ?? 'T') as string
                              return nm.charAt(0) || 'T'
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{(() => {
                              const t: any = teacher as any
                              return (t.teacherName ?? t.name ?? 'GV') as string
                            })()}</p>
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
                    <p className="text-3xl font-bold mt-2">₫{summary?.revenue.monthCollected ? (summary.revenue.monthCollected / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M</p>
                    <div className="flex items-center gap-1 mt-2 text-blue-100">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm">
                        +11.2% so với năm trước
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
                    <p className="text-3xl font-bold mt-2">₫{summary?.revenue.monthCollected && summary?.payroll.paidAmount ? ((summary.revenue.monthCollected - summary.payroll.paidAmount) / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-100">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm">+11.2% so với năm trước</span>
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
                    <p className="text-3xl font-bold mt-2">₫{summary?.payroll.paidAmount ? (summary.payroll.paidAmount / 1_000_000).toFixed(0) : isLoading ? "..." : "0"}M</p>
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
                        ₫{summary?.revenue.monthCollected ? Math.round((summary.revenue.monthCollected / 1_000_000) / 12) : 0}M
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Tổng doanh thu / 12 tháng</p>
                  </div>

                  <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-700 font-medium">Doanh thu TB/học sinh</span>
                      <span className="text-2xl font-bold text-violet-600">
                        ₫{summary?.revenue.totalPaid ? Math.round(summary.revenue.totalPaid / 1000) : 0}K
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
