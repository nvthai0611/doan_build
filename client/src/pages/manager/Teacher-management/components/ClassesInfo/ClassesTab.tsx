"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, GraduationCap, Users, Clock, Eye, AlertCircle, MoreHorizontal } from "lucide-react"
import { useTeacherClasses } from "./hooks"
import { classService } from "../../../../../services/center-owner/class-management/class.service"
import { toast } from "sonner"
import Loading from "../../../../../components/Loading/LoadingPage"
import { SimpleTable, SimpleColumn } from "../../../../../components/common/Table"

interface ClassesTabProps {
  employeeId: string
  activeTab: string
  search: string
  setActiveTab: (tab: string) => void
  setSearch: (search: string) => void
}

export default function ClassesTab({
  employeeId,
  activeTab,
  search,
  setActiveTab,
  setSearch
}: ClassesTabProps) {
  const { classes, stats, loading, error, refetch } = useTeacherClasses(employeeId, activeTab, search)
  console.log("check classes", classes);
  
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
      case "completed":
        return <Badge variant="secondary">Đã kết thúc</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ bắt đầu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewDetails = async (classId: number) => {
    try {
      const classDetails = await classService.getClassDetails(classId)
      setSelectedClass(classDetails)
      setIsDetailOpen(true)
    } catch (error) {
      console.error('Error fetching class details:', error)
      toast.error('Không thể tải chi tiết lớp học')
    }
  }

  const handleUpdateStatus = async (classId: number, newStatus: string) => {
    try {
      await classService.updateClassStatus(classId, newStatus)
      toast.success('Cập nhật trạng thái thành công')
      refetch()
    } catch (error) {
      console.error('Error updating class status:', error)
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  // Define columns for SimpleTable
  const columns: SimpleColumn<any>[] = [
    {
      key: 'name',
      header: 'Tên lớp',
      width: '200px',
      render: (cls: any) => (
        <div className="font-medium">{cls.name}</div>
      )
    },
    {
      key: 'subject',
      header: 'Môn học',
      width: '150px',
      render: (cls: any) => cls.subject
    },
    {
      key: 'students',
      header: 'Số học sinh',
      width: '120px',
      align: 'center',
      render: (cls: any) => cls.students
    },
    {
      key: 'schedule',
      header: 'Lịch học',
      width: '200px',
      render: (cls: any) => cls.schedule
    },
    {
      key: 'room',
      header: 'Phòng',
      width: '120px',
      render: (cls: any) => cls.room
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '150px',
      render: (cls: any) => getStatusBadge(cls.status)
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '200px',
      align: 'center',
      render: (cls: any) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(cls.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Button>
          {cls.status === "pending" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus(cls.id, "active")}
              className="text-green-600 hover:text-green-700"
            >
              Bắt đầu
            </Button>
          )}
          {cls.status === "active" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus(cls.id, "completed")}
              className="text-blue-600 hover:text-blue-700"
            >
              Kết thúc
            </Button>
          )}
        </div>
      )
    }
  ]

  // Loading state
  if (loading) {
    return (
      <Loading/>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-auto"
            >
              Thử lại
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lớp học</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm lớp học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="completed">Đã kết thúc</SelectItem>
                <SelectItem value="pending">Chờ bắt đầu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng số lớp</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats?.totalClasses || classes?.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.totalStudents || classes?.reduce((sum, cls) => sum + cls.students, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Lớp đang hoạt động</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats?.activeClasses || classes?.filter(cls => cls.status === "active").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lớp học</h3>
        <SimpleTable
          data={classes || []}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={refetch}
          emptyMessage="Không có lớp học nào"
          rowKey="id"
          hoverable={true}
          striped={true}
        />
      </div>

      {/* Class Details Modal */}
      {isDetailOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết lớp học</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDetailOpen(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên lớp</label>
                  <p className="text-sm font-semibold">{selectedClass.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Môn học</label>
                  <p className="text-sm">{selectedClass.subject}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Số học sinh</label>
                  <p className="text-sm">{selectedClass.students}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng học</label>
                  <p className="text-sm">{selectedClass.room}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <p className="text-sm">{selectedClass.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="text-sm">{selectedClass.endDate}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Lịch học</label>
                <p className="text-sm">{selectedClass.schedule}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-sm">{selectedClass.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(selectedClass.status)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDetailOpen(false)}
              >
                Đóng
              </Button>
              {selectedClass.status === "pending" && (
                <Button 
                  onClick={() => {
                    handleUpdateStatus(selectedClass.id, "active")
                    setIsDetailOpen(false)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Bắt đầu lớp
                </Button>
              )}
              {selectedClass.status === "active" && (
                <Button 
                  onClick={() => {
                    handleUpdateStatus(selectedClass.id, "completed")
                    setIsDetailOpen(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Kết thúc lớp
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
