"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type Column } from "../../../components/common/Table/DataTable"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Search, Filter, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface Incident {
  id: string
  teacherName: string
  teacherId: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "processing" | "resolved"
  title: string
  description: string
  date: string
  time: string
  location: string
  studentsInvolved: string[]
  actionsTaken: string
  reportedAt: string
  resolvedAt?: string
}

import { adminIncidentService } from "../../../services/center-owner/incident-handle/incident.service"
import type { AdminIncidentItem } from "../../../services/center-owner/incident-handle/incident.types"

export default function CenterOwnerIncidentsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-incident-list'],
    queryFn: () => adminIncidentService.list({ page: 1, limit: 100 }),
    staleTime: 30_000,
  })
  const incidentsApi: AdminIncidentItem[] = (data as any)?.data ?? []
  const incidents: Incident[] = incidentsApi.map((i) => ({
    id: i.id,
    reportId: i.id.slice(0, 8).toUpperCase(),
    teacherName: i.reportedBy?.user?.fullName || '-',
    teacherId: i.reportedBy?.id || '-',
    type: i.incidentType,
    severity: (i.severity?.toLowerCase?.() || 'low') as Incident['severity'],
    status: ((i.status || 'pending').toLowerCase()) as Incident['status'],
    title: i.incidentType,
    description: i.description,
    date: String(i.date).slice(0,10),
    time: i.time,
    location: i.location || '-',
    studentsInvolved: (i.studentsInvolved || '').split(',').filter(Boolean),
    actionsTaken: i.actionsTaken || '-',
    reportedAt: new Date(i.createdAt).toLocaleString('vi-VN'),
    resolvedAt: undefined,
  }))
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [newStatus, setNewStatus] = useState<string>("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  function getIncidentTypeLabel(type: string) {
    const map: Record<string, string> = {
      behavior: 'Hành vi học sinh',
      safety: 'An toàn lớp học',
      facility: 'Cơ sở vật chất',
      health: 'Sức khỏe học sinh',
      other: 'Khác',
    }
    return map[type] || type
  }

  const filteredIncidents = incidents.filter((incident) => {
    const typeText = getIncidentTypeLabel(incident.type).toLowerCase()
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      incident.title.toLowerCase().includes(q) ||
      incident.teacherName.toLowerCase().includes(q) ||
      typeText.includes(q) ||
      incident.type.toLowerCase().includes(q)
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus
    const matchesSeverity = filterSeverity === "all" || incident.severity === filterSeverity
    const matchesType = filterType === "all" || incident.type === filterType
    return matchesSearch && matchesStatus && matchesSeverity && matchesType
  })

  // Paginate data
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ"
      case "processing":
        return "Đang xử lý"
      case "resolved":
        return "Đã xử lý"
      default:
        return status
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "low":
        return "Thấp"
      case "medium":
        return "Trung bình"
      case "high":
        return "Cao"
      case "critical":
        return "Nghiêm trọng"
      default:
        return severity
    }
  }

  

  const handleViewDetail = (incident: Incident) => {
    setSelectedIncident(incident)
    setNewStatus(incident.status)
    setIsDetailOpen(true)
  }

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await adminIncidentService.updateStatus(id, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-incident-list'] })
      if (selectedIncident && newStatus === 'resolved') {
        setSelectedIncident({ ...selectedIncident, status: newStatus as Incident['status'], resolvedAt: new Date().toLocaleString('vi-VN') })
      }
      toast.success('Cập nhật thành công')
      setIsDetailOpen(false)
      setSelectedIncident(null)
    }
  })

  const handleUpdateStatus = () => {
    if (!selectedIncident || !newStatus) return
    updateStatusMutation.mutate({ id: selectedIncident.id, status: newStatus })
  }

  const stats = {
    total: incidents.length,
    pending: incidents.filter((i) => i.status === "pending").length,
    processing: incidents.filter((i) => i.status === "processing").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  }

  // Table columns
  const columns: Column<Incident>[] = [
    {
      key: 'type',
      header: 'Loại sự cố',
      render: (item) => getIncidentTypeLabel(item.type),
    },
    {
      key: 'teacherName',
      header: 'Giáo viên',
      render: (item) => item.teacherName,
    },
    {
      key: 'severity',
      header: 'Mức độ',
      render: (item) => (
        <Badge variant="outline" className={getSeverityColor(item.severity)}>
          {getSeverityLabel(item.severity)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item) => (
        <Badge variant="outline" className={cn("gap-1", getStatusColor(item.status))}>
          {getStatusIcon(item.status)}
          {getStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: 'reportedAt',
      header: 'Ngày báo cáo',
      render: (item) => item.reportedAt,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
          <Eye className="w-4 h-4 mr-1" />
          Xem chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-8 h-8" />
          Quản lý báo cáo sự cố
        </h1>
        <p className="text-muted-foreground mt-1">Xem và xử lý các báo cáo sự cố từ giáo viên</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang chờ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>


      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo sự cố</CardTitle>
          <CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm theo loại sự cố, giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="critical">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Loại sự cố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="behavior">{getIncidentTypeLabel('behavior')}</SelectItem>
                  <SelectItem value="safety">{getIncidentTypeLabel('safety')}</SelectItem>
                  <SelectItem value="facility">{getIncidentTypeLabel('facility')}</SelectItem>
                  <SelectItem value="health">{getIncidentTypeLabel('health')}</SelectItem>
                  <SelectItem value="other">{getIncidentTypeLabel('other')}</SelectItem>
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo sự cố</DialogTitle>
            <DialogDescription>Xem và cập nhật trạng thái xử lý sự cố</DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Giáo viên báo cáo</Label>
                  <p className="font-medium">{selectedIncident.teacherName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loại sự cố</Label>
                  <p className="font-medium">{getIncidentTypeLabel(selectedIncident.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mức độ nghiêm trọng</Label>
                  <Badge variant="outline" className={getSeverityColor(selectedIncident.severity)}>
                    {getSeverityLabel(selectedIncident.severity)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày xảy ra</Label>
                  <p className="font-medium">{selectedIncident.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Thời gian</Label>
                  <p className="font-medium">{selectedIncident.time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Địa điểm</Label>
                  <p className="font-medium">{selectedIncident.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái hiện tại</Label>
                  <Badge variant="outline" className={cn("gap-1", getStatusColor(selectedIncident.status))}>
                    {getStatusIcon(selectedIncident.status)}
                    {getStatusLabel(selectedIncident.status)}
                  </Badge>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tiêu đề</Label>
                <p className="font-medium">{selectedIncident.title}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Mô tả chi tiết</Label>
                <p className="text-sm">{selectedIncident.description}</p>
              </div>

              {/* Students Involved */}
              {selectedIncident.studentsInvolved.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Học sinh liên quan</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.studentsInvolved.map((student, index) => (
                      <Badge key={index} variant="secondary">
                        {student}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Taken */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Hành động đã thực hiện</Label>
                <p className="text-sm">{selectedIncident.actionsTaken}</p>
              </div>

              {/* Update Status Section */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Cập nhật trạng thái</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trạng thái mới</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Đang chờ</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="resolved">Đã xử lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleUpdateStatus} className="w-full" disabled={updateStatusMutation.isPending}>
                    Cập nhật trạng thái
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
