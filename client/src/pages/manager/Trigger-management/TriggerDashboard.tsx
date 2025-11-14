"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { DashboardOverview } from "./components/dashboard-overview"
import { JobExecutionsTable } from "./components/job-executions-table"
import { JobDetailModal } from "./components/job-detail-modal"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { listCronJobExecutions, getJobTypes } from "@/services/center-owner/trigger-cronjobs/trigger-management.service"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Helper function to get last month date range
 */
const getLastMonthRange = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
  return { startDate: firstDay, endDate: lastDay }
}

export default function TriggerDashboard() {
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const lastMonthRange = getLastMonthRange()
  
  const [filters, setFilters] = useState({
    status: "all",
    jobType: "all",
    dateRange: lastMonthRange,
    quickPreset: "month", // default Last month
    page: 1,
    limit: 10,
  })

  // Fetch job types for filter
  const { data: jobTypesData } = useQuery({
    queryKey: ["jobTypes"],
    queryFn: getJobTypes,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch cron job executions
  const {
    data: executionsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [
      "cronJobExecutions",
      filters.status !== "all" ? filters.status : undefined,
      filters.jobType !== "all" ? filters.jobType : undefined,
      filters.dateRange.startDate.toISOString(),
      filters.dateRange.endDate.toISOString(),
      filters.page,
      filters.limit,
    ],
    queryFn: () =>
      listCronJobExecutions({
        status: filters.status !== "all" ? filters.status : undefined,
        jobType: filters.jobType !== "all" ? filters.jobType : undefined,
        startDate: filters.dateRange.startDate.toISOString(),
        endDate: filters.dateRange.endDate.toISOString(),
        page: filters.page,
        limit: filters.limit,
      }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
    retry: 1,
  })

  // Extract jobs array from response.data
  const jobs = useMemo(() => {
    if (!executionsData) return []
    return executionsData
  }, [executionsData])
  
  // Extract pagination from response.pagination
  const pagination = useMemo(() => {
    if (!executionsData?.pagination) {
      return { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
    return executionsData.pagination
  }, [executionsData])

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertDescription>
              Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Unknown error"}
              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
                Tải lại
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý nhiệm vụ thực thi</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Giám sát và quản lý các lần thực thi công việc đã lên lịch (Mặc định: Tháng trước)
              </p>
            </div>
            <Link to="/manual-trigger">
              <Button
                variant="default"
                className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              >
                Manual Trigger
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mx-auto space-y-6">
          {/* Keep table mounted; show fetch state subtly */}
          {isLoading && jobs.length === 0 ? (
            // initial load
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải dữ liệu nhiệm vụ...</span>
            </div>
          ) : (
            <>
              <DashboardOverview jobs={jobs} />
              <JobExecutionsTable
                jobs={jobs}
                filters={filters}
                pagination={pagination}
                jobTypes={jobTypesData?.data || []}
                onFilterChange={handleFilterChange}
                onPageChange={handlePageChange}
                onSelectJob={setSelectedJob}
                onRefresh={refetch}
                loading={isFetching} // NEW: pass fetching state
              />
              {selectedJob && (
                <JobDetailModal job={selectedJob} isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
