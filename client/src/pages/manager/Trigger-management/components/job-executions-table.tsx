"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { DataTable, type Column } from "@/components/common/Table/DataTable"

interface JobExecutionsTableProps {
  jobs: any[]
  filters: {
    status: string
    jobType: string
    dateRange: {
      startDate: Date
      endDate: Date
    }
    quickPreset?: string // NEW: control quick date UI from parent
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  jobTypes: string[]
  onFilterChange: (filters: any) => void
  onPageChange: (page: number) => void
  onSelectJob: (job: any) => void
  onRefresh: () => void
  loading?: boolean // NEW: to show table loading
  formatDate: (date: string | Date) => string
}
const jobTypeLabels: Record<string, string> = {
  "bill_generation": "Tạo hóa đơn",
  "bill_publishing": "Công bố hóa đơn",
  "change-status-session": "Thay đổi trạng thái buổi học",
  "daily_teacher_payout": "Chi trả giáo viên hàng ngày",
  "fee_reminder_due": "Nhắc nhở học phí đến hạn",
  "fee_reminder_early": "Nhắc nhở học phí sớm",
  "payroll_notification": "Thông báo bảng lương",
  "teacher_payroll_generation": "Tạo bảng lương giáo viên"
}

export function JobExecutionsTable({
  jobs,
  filters,
  pagination,
  jobTypes,
  onFilterChange,
  onPageChange,
  onSelectJob,
  onRefresh,
  loading = false,
  formatDate 
}: JobExecutionsTableProps) {
  const statuses = ["all", "running", "completed", "failed"]
  
  // Quick date filter handler
  const handleQuickDateFilter = (preset: string) => {
    const now = new Date()
    const startDate = new Date()
    switch (preset) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
    }
    onFilterChange({
      ...filters,
      quickPreset: preset, // persist in parent to avoid reset on remount
      dateRange: { startDate, endDate: now },
    })
  }
  

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatJobType = (jobType: string) => {
  return jobTypeLabels[jobType] || jobType.replace(/_/g, " ").charAt(0).toUpperCase() + jobType.slice(1).replace(/_/g, " ")
}

  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: "status",
      header: "Trạng thái",
      width: "80px",
      align: "center",
      render: (job) => getStatusIcon(job.status),
      sortKey: "status",
      searchPlaceholder: "Search status...",
    },
    {
      key: "jobType",
      header: "Job Type",
      render: (job) => <span className="font-medium text-sm">{formatJobType(job.jobType)}</span>,
      sortKey: "jobType",
      searchPlaceholder: "Search job type...",
    },
    {
      key: "startedAt",
      header: "Started At",
      render: (job) => <span className="text-xs text-muted-foreground">{formatDate(job.startedAt)}</span>,
      sortKey: "startedAt",
    },
    {
      key: "durationMs",
      header: "Duration",
      render: (job) => <span className="text-sm">{formatDuration(job.durationMs)}</span>,
      sortKey: "durationMs",
    },
    {
      key: "items",
      header: "Thành công",
      render: (job) => (
        <div className="flex  gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
            {job.successCount || 0} ✓
          </Badge>
          {job.failedCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
              {job.failedCount} ✗
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "action",
      header: "Hành động",
      width: "100px",
      align: "right",
      render: (job) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelectJob(job)
          }}
          className="text-primary hover:bg-primary/10 h-7 px-2"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ]
  
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader className="border-b border-border/40">
        <div className="space-y-4">
          {/* Header with title and action buttons */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg">Bảng thực hiện công việc hệ thống</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {pagination.total} tổng số lần thực hiện
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange({ ...filters, status: value })}
              >
                <SelectTrigger className="w-40 bg-card/50 border-border/50 hover:border-border/80 transition-colors">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Job Type Filter */}
              <Select
                value={filters.jobType}
                onValueChange={(value) => onFilterChange({ ...filters, jobType: value })}
              >
                <SelectTrigger className="w-40 bg-card/50 border-border/50 hover:border-border/80 transition-colors">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {/* {formatJobType(type)} */}
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="bg-card/50 border-border/50 hover:border-border/80"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              Quick Filter:
            </span>
            {[
              { value: "today", label: "Today" },
              { value: "week", label: "Last Week" },
              { value: "month", label: "Last Month" },
              { value: "quarter", label: "Last 3 Months" },
            ].map((preset) => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => handleQuickDateFilter(preset.value)}
                className={`capitalize text-xs ${
                  (filters.quickPreset || "month") === preset.value
                    ? "bg-primary/20 border-primary/50 text-foreground"
                    : "bg-card/50 border-border/50 hover:border-border/80 hover:bg-card/70 transition-all"
                }`}>
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <DataTable
          data={jobs}
          columns={columns}
          rowKey="id"
          onRowClick={onSelectJob}
          hoverable={true}
          striped={false}
          enableSearch={true}
          searchPlaceholder="Search nhiệm vụ hệ thống..."
          enableSort={true}
          loading={loading}
          emptyMessage="Không có dữ liệu về nhiệm vụ hệ thống. Thử thay đổi bộ lọc hoặc khoảng thời gian."
          pagination={{
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total,
            itemsPerPage: pagination.limit,
            onPageChange: onPageChange,
            onItemsPerPageChange: (limit) => onFilterChange({ ...filters, limit }),
            showItemsPerPage: true,
            showPageInfo: true,
          }}
          className="border-0 shadow-none"
        />
      </CardContent>
    </Card>
  )
}
