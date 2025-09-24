"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Search } from "lucide-react"
import type { StudentFilters, StudentStatus, StudentWithDetails } from "./types/database"
import { mockStudents } from "./utils/mock-data"
import { StudentTable } from "./components/student-table"
import { StatusTabs } from "./components/status-tabs"
import { DateFilters } from "./components/date-filters"
import { AdvancedFilters } from "./components/advanced-filters"
import { StudentPagination } from "./components/student-pagination"
import { ExportDropdown } from "./components/export-dropdown"
import { filterStudents, sortStudents, getStatusCounts, exportStudentsToCSV } from "./utils/student-utils"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../../utils/clientAxios"

export default function StudentManagement() {
  const [filters, setFilters] = useState<StudentFilters>({
    search: "",
    status: "all",
    sortBy: "name",
    sortOrder: "asc",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const {data, isLoading, isError} = useQuery({
    queryKey: ['student-management'],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/students/with-parents`);
      console.log(res);
      return res.data
    },
  })

  const filteredStudents = useMemo(() => {
    const filtered = filterStudents(mockStudents, filters)
    return sortStudents(filtered, filters.sortBy, filters.sortOrder)
  }, [filters])

  const totalPages = Math.ceil(filteredStudents.length / pageSize)
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredStudents.slice(startIndex, startIndex + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const dynamicStatusCounts = useMemo(() => {
    return getStatusCounts(mockStudents)
  }, [])

  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleStatusChange = (status: StudentStatus) => {
    setFilters((prev) => ({ ...prev, status }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      sortBy: "name",
      sortOrder: "asc",
    })
    setCurrentPage(1)
  }

  const handleExportPage = () => {
    const csvContent = exportStudentsToCSV(paginatedStudents)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `danh-sach-hoc-vien-trang-${currentPage}-${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportAll = () => {
    const csvContent = exportStudentsToCSV(filteredStudents)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `danh-sach-hoc-vien-tat-ca-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Danh sách tài khoản học viên</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Danh sách tài khoản học viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Thêm học viên
            </Button>
            <Button variant="outline" className="text-muted-foreground border-border bg-transparent">
              Mời Học viên
            </Button>
          </div>
        </div>

        {/* Date Filters */}
        <DateFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã học thông tin liên hệ"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 border-border"
            />
          </div>

          <AdvancedFilters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
          <ExportDropdown onExportPage={handleExportPage} onExportAll={handleExportAll} />
        </div>

        {/* Status Tabs */}
        <StatusTabs
          activeStatus={filters.status}
          onStatusChange={handleStatusChange}
          statusCounts={dynamicStatusCounts}
        />

        {/* Student Table */}
        <StudentTable students={paginatedStudents} filters={filters} onFilterChange={handleFilterChange} />

        <StudentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredStudents.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  )
}
