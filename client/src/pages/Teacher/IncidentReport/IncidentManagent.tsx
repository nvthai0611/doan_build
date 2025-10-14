"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "../../../components/common/Table/DataTable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Search, Eye, Calendar, MapPin, Users, FileText, Filter, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { teacherIncidentReportService } from "../../../services/teacher/incident-report/incident.service"
import type { IncidentReportItem } from "../../../services/teacher/incident-report/incident.types"

export default function ManageIncidentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedIncident, setSelectedIncident] = useState<IncidentReportItem | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['incident-reports', { filterSeverity, filterStatus, searchTerm }],
    queryFn: () => teacherIncidentReportService.getMyIncidentReports({ page: 1, limit: 50 }),
    staleTime: 30_000,
  })

  const incidents: IncidentReportItem[] = (data as any)?.data ?? []

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.studentsInvolved || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.class?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity
    const statusValue = (incident.status || '').toLowerCase()
    const matchesStatus = filterStatus === "all" || statusValue === filterStatus

    return matchesSearch && matchesSeverity && matchesStatus
  })

  // Paginate data
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Nghiêm trọng
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Cao
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Trung bình
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Thấp
          </Badge>
        )
      default:
        return null
    }
  }

  const getIncidentTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      behavior: 'Hành vi học sinh',
      safety: 'An toàn lớp học',
      facility: 'Cơ sở vật chất',
      health: 'Sức khỏe học sinh',
      other: 'Khác',
    }
    return map[type] || type
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-4 h-4 mr-1" />
            Đang chờ
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-4 h-4 mr-1" />
            Đang xử lý
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Đã xử lý
          </Badge>
        )
      default:
        return null
    }
  }

  // Table columns
  const columns: Column<IncidentReportItem>[] = [
    {
      key: 'date',
      header: 'Ngày giờ',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{String(item.date).slice(0,10)}</span>
          <span className="text-sm text-muted-foreground">{item.time}</span>
        </div>
      ),
    },
    {
      key: 'incidentType',
      header: 'Loại sự cố',
      render: (item) => getIncidentTypeLabel(item.incidentType),
    },
    {
      key: 'severity',
      header: 'Mức độ',
      render: (item) => getSeverityBadge(item.severity),
    },
    {
      key: 'class',
      header: 'Lớp học',
      render: (item) => (
        <Badge variant="outline">{item.class?.name || '-'}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item) => getStatusBadge((item.status || '').toLowerCase()),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
                      <Dialog>
                        <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setSelectedIncident(item)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-600" />
                              Chi tiết báo cáo sự cố
                            </DialogTitle>
                            <DialogDescription>Thông tin chi tiết về sự cố đã báo cáo</DialogDescription>
                          </DialogHeader>

                          {selectedIncident && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Loại sự cố</p>
                    <p className="text-sm">{getIncidentTypeLabel(selectedIncident.incidentType)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Mức độ</p>
                                  {getSeverityBadge(selectedIncident.severity)}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
                                    <p className="text-sm">
                        {String(selectedIncident.date).slice(0,10)} - {selectedIncident.time}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Địa điểm</p>
                                    <p className="text-sm">{selectedIncident.location}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Lớp học</p>
                                <Badge variant="outline" className="mt-1">
                    {selectedIncident.class?.name || '-'}
                                </Badge>
                              </div>

                              {selectedIncident.studentsInvolved && (
                                <div className="flex items-start gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground mt-1" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">Học sinh liên quan</p>
                                    <p className="text-sm">{selectedIncident.studentsInvolved}</p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-muted-foreground">Mô tả sự cố</p>
                                  <p className="text-sm mt-1">{selectedIncident.description}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-muted-foreground">Hành động đã thực hiện</p>
                                  <p className="text-sm mt-1">{selectedIncident.actionsTaken}</p>
                                </div>
                              </div>

                              <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                      {getStatusBadge((selectedIncident.status || '').toLowerCase())}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Người báo cáo</p>
                      <p className="text-sm">{selectedIncident.reportedBy?.user?.fullName || '-'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
      ),
    },
  ]

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              Quản lý báo cáo sự cố
            </h1>
            <p className="text-muted-foreground mt-1">Xem và theo dõi các báo cáo sự cố đã gửi</p>
          </div>
          <Button onClick={() => (window.location.href = "/teacher/incidents/report")}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Báo cáo sự cố mới
          </Button>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách báo cáo</CardTitle>
            <CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sự cố..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Mức độ nghiêm trọng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mức độ</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Đang chờ</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>                  
                    <SelectItem value="resolved">Đã xử lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={paginatedIncidents}
              pagination={{
                currentPage: page,
                totalPages: Math.ceil(filteredIncidents.length / pageSize),
                totalItems: filteredIncidents.length,
                itemsPerPage: pageSize,
                onPageChange: setPage,
                onItemsPerPageChange: (newPageSize) => {
                  setPageSize(newPageSize)
                  setPage(1) // Reset về trang 1 khi thay đổi page size
                },
              }}
              loading={isLoading}
              error={null}
              emptyMessage="Chưa có báo cáo sự cố nào"
              enableSearch={false}
            />
          </CardContent>
        </Card>
      </div>
  )
}
