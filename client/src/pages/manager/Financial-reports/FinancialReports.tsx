"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedButton } from "@/components/ui/protected-button"
import { Badge } from "@/components/ui/badge"
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
} from "recharts"
import { PermissionGuard } from "@/pages/Auth/Permission-guard"

const revenueData = [
  { month: "T1", revenue: 45, salary: 18 },
  { month: "T2", revenue: 52, salary: 20 },
  { month: "T3", revenue: 48, salary: 18 },
  { month: "T4", revenue: 61, salary: 22 },
  { month: "T5", revenue: 55, salary: 20 },
  { month: "T6", revenue: 67, salary: 24 },
  { month: "T7", revenue: 72, salary: 26 },
  { month: "T8", revenue: 69, salary: 25 },
  { month: "T9", revenue: 78, salary: 28 },
  { month: "T10", revenue: 82, salary: 30 },
  { month: "T11", revenue: 88, salary: 32 },
  { month: "T12", revenue: 95, salary: 35 },
  ] // Will be replaced by dynamic data

const TUITION_COLORS = ["#10b981", "#f59e0b", "#ef4444"]

const classRevenue = [
  { class: "Toán 10A", revenue: 35, students: 25 },
  { class: "Văn 11B", revenue: 28, students: 20 },
  { class: "Anh 12A", revenue: 42, students: 30 },
  { class: "Lý 10B", revenue: 21, students: 15 },
  { class: "Hóa 11A", revenue: 25, students: 18 },
  ] // Will be replaced by dynamic data

export default function FinancialReports() {
  const currentYear = new Date().getFullYear()
  const currentMonth = String(new Date().getMonth() + 1)
  
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear))
  
  const { summary, isLoading } = useFinancialSummary({
    month: selectedMonth === "all" ? undefined : selectedMonth,
    year: selectedYear
  })
  
    const revenueDataDynamic = summary?.revenue.monthlyTrend.map(m => ({
      month: m.label,
      revenue: m.revenue / 1_000_000,
      salary: m.salary / 1_000_000
    })) || revenueData
  
    const tuitionData = summary ? [
      { name: "Đã thu", value: summary.tuition.breakdownPercent.paid },
      { name: "Chưa thu", value: summary.tuition.breakdownPercent.pending },
      { name: "Quá hạn", value: summary.tuition.breakdownPercent.overdue }
    ] : [
      { name: "Đã thu", value: 0 },
      { name: "Chưa thu", value: 0 },
      { name: "Quá hạn", value: 0 }
    ]
  
    const classRevenueDynamic = summary?.classes.topRevenue.map(c => ({
      class: c.className,
      revenue: c.revenueAmount / 1_000_000,
      students: c.studentCount
    })) || classRevenue
  
    const totalSalaryPaid = summary?.payroll.paidAmount || 0
    const totalSalaryPending = summary?.payroll.pendingAmount || 0

  return (
    <div className="p-6 space-y-6 bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tổng quan doanh thu</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? 'Đang tải dữ liệu...' : 'Theo dõi doanh thu, lương giáo viên và tình hình tài chính của trung tâm'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tháng</SelectItem>
              <SelectItem value="1">Tháng 1</SelectItem>
              <SelectItem value="2">Tháng 2</SelectItem>
              <SelectItem value="3">Tháng 3</SelectItem>
              <SelectItem value="4">Tháng 4</SelectItem>
              <SelectItem value="5">Tháng 5</SelectItem>
              <SelectItem value="6">Tháng 6</SelectItem>
              <SelectItem value="7">Tháng 7</SelectItem>
              <SelectItem value="8">Tháng 8</SelectItem>
              <SelectItem value="9">Tháng 9</SelectItem>
              <SelectItem value="10">Tháng 10</SelectItem>
              <SelectItem value="11">Tháng 11</SelectItem>
              <SelectItem value="12">Tháng 12</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, currentYear - 5].map(year => (
                <SelectItem key={year} value={String(year)}>Năm {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ProtectedButton permission="reports.view" variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </ProtectedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-3xl font-bold mt-2">₫{((summary?.revenue.totalPaid || 0) / 1_000_000).toFixed(1)}M</p>
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
        </PermissionGuard>

        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Đã thu tháng này</p>
                  <p className="text-3xl font-bold mt-2">₫{((summary?.revenue.monthCollected || 0) / 1_000_000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 mt-2 text-blue-100">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">78% mục tiêu</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Lương giáo viên</p>
                  <p className="text-3xl font-bold mt-2">₫{(totalSalaryPaid / 1_000_000).toFixed(1)}M</p>
                  <div className="flex items-center gap-1 mt-2 text-rose-100">
                    <ArrowDownRight className="w-4 h-4" />
                    <span className="text-sm">{summary?.payroll.teacherCountPaid || 0} bảng lương</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <UserCheck className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Công nợ học phí</p>
                  <p className="text-3xl font-bold mt-2">₫{(((summary?.tuition.pendingAmount || 0) + (summary?.tuition.overdueAmount || 0)) / 1_000_000).toFixed(1)}M</p>
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
        </PermissionGuard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PermissionGuard permission="finance.view">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Doanh thu & Lương giáo viên
                  </CardTitle>
                  <CardDescription>So sánh doanh thu và chi phí lương theo tháng</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueDataDynamic}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorRevenue)"
                      name="revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="salary"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fill="url(#colorSalary)"
                      name="salary"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>

        {/* Tuition Collection Pie Chart */}
        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-violet-500" />
                Tình trạng thu học phí
              </CardTitle>
              <CardDescription>Tỷ lệ thu học phí tháng này</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tuitionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {tuitionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TUITION_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {tuitionData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TUITION_COLORS[index] }}></div>
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      {/* Second Row Charts */}
      <div>
        {/* Doanh thu theo lớp */}
        <PermissionGuard permission="finance.view">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Doanh thu theo lớp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classRevenueDynamic.map((item, index) => (
                  <div key={item.class}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{item.class}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">₫{item.revenue}M</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.students} HS)</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                        style={{
                            width: `${(item.revenue / (classRevenueDynamic[0]?.revenue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tổng doanh thu các lớp</span>
                    <span className="text-xl font-bold text-blue-600">₫{((summary?.classes.totalClassRevenue || 0) / 1_000_000).toFixed(1)}M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>

      <PermissionGuard permission="finance.view">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-500" />
                  Thanh toán lương giáo viên
                </CardTitle>
                <CardDescription>Tình trạng thanh toán lương tháng này</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Đã trả</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {new Intl.NumberFormat("vi-VN").format(totalSalaryPaid)}₫
                  </p>
                </div>
                <div className="w-px bg-border"></div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Chưa trả</p>
                  <p className="text-lg font-bold text-amber-600">
                    {new Intl.NumberFormat("vi-VN").format(totalSalaryPending)}₫
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.payroll.teacherSalaries && summary.payroll.teacherSalaries.length > 0 ? (
                summary.payroll.teacherSalaries.map((teacher) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    paid: { label: "Đã trả", color: "bg-emerald-500" },
                    pending: { label: "Chưa trả", color: "bg-amber-500" },
                    waiting_teacher_approval: { label: "Chờ GV duyệt", color: "bg-blue-500" },
                    approved_by_teacher: { label: "GV đã duyệt", color: "bg-violet-500" }
                  }
                  
                  const status = statusMap[teacher.status] || { label: teacher.status, color: "bg-gray-500" }
                  const initials = teacher.teacherName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  const isPaid = teacher.status === 'paid'
                  
                  return (
                    <div key={teacher.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${isPaid ? 'from-rose-500 to-rose-600' : 'from-amber-500 to-amber-600'} flex items-center justify-center text-white font-semibold text-sm`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium">{teacher.teacherName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(teacher.periodStart).toLocaleDateString('vi-VN')} - {new Date(teacher.periodEnd).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{new Intl.NumberFormat("vi-VN").format(teacher.salary)}₫</p>
                          {teacher.email && (
                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                          )}
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có dữ liệu lương giáo viên</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  )
}
