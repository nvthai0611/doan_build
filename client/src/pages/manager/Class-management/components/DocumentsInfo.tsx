"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, FileText, Download, Eye, Calendar, User, Trash2, ImageIcon, File, FolderOpen } from "lucide-react"
import { centerOwnerFileManagementService } from "../../../../services/center-owner/file-management/file.service"
import type { Material } from "../../../../services/center-owner/file-management/file.types"
import { DataTable, type Column } from "../../../../components/common/Table/DataTable"
import { useToast } from "../../../../hooks/use-toast"

interface DocumentsInfoProps {
  classId: string
}

export default function DocumentsInfo({ classId }: DocumentsInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch materials from API
  const { data: materialsData, isLoading, isError } = useQuery({
    queryKey: ['center-materials', { classId, category: categoryFilter, page, pageSize }],
    queryFn: () => centerOwnerFileManagementService.getMaterials({
      classId,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      page,
      limit: pageSize,
    }),
    staleTime: 30000, // Cache 30 seconds
    refetchOnWindowFocus: false,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (materialId: number) => centerOwnerFileManagementService.deleteMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['center-materials'] })
      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tài liệu",
        variant: "destructive",
      })
    },
  })

  const allDocuments = materialsData?.data || []
  const meta = materialsData?.meta

  // Filter documents by search term
  const documents = allDocuments.filter((doc) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      doc.title.toLowerCase().includes(search) ||
      doc.fileName.toLowerCase().includes(search) ||
      (doc.description && doc.description.toLowerCase().includes(search))
    )
  })

  // Handlers
  const handleDownload = async (material: Material) => {
    try {
      toast({
        title: "Đang tải xuống",
        description: `Đang tải ${material.fileName}...`,
      })
      
      const response = await fetch(material.fileUrl, {
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = material.fileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
      
      try {
        await centerOwnerFileManagementService.incrementDownload(material.id)
      } catch (countError) {
        console.warn('Failed to increment download count:', countError)
      }
      
      toast({
        title: "Tải xuống thành công",
        description: `Đã tải ${material.fileName}`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống tài liệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (materialId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      deleteMutation.mutate(materialId)
    }
  }

  const handleView = (material: Material) => {
    window.open(material.fileUrl, '_blank')
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (type?: string, fileName?: string) => {
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase()
      if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />
      if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-500" />
      if (['xls', 'xlsx'].includes(ext || '')) return <FileText className="w-5 h-5 text-green-500" />
      if (['ppt', 'pptx'].includes(ext || '')) return <FileText className="w-5 h-5 text-orange-500" />
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
        return <ImageIcon className="w-5 h-5 text-purple-500" />
      }
    }
    if (type?.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-purple-500" />
    if (type?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      lesson: "Giáo án",
      exercise: "Bài tập",
      exam: "Đề thi",
      material: "Tài liệu học tập",
      reference: "Tài liệu tham khảo",
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      lesson: "bg-purple-100 text-purple-800 border-purple-300",
      exercise: "bg-blue-100 text-blue-800 border-blue-300",
      exam: "bg-red-100 text-red-800 border-red-300",
      material: "bg-green-100 text-green-800 border-green-300",
      reference: "bg-yellow-100 text-yellow-800 border-yellow-300",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  // Get stats from meta
  const totalSize = meta?.totalSize || allDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
  const totalDownloads = meta?.totalDownloads || allDocuments.reduce((sum, doc) => sum + doc.downloads, 0)
  const recentUploadsCount = meta?.recentUploads

  // Table columns
  const columns: Column<Material>[] = [
    {
      key: 'title',
      header: 'Tên tài liệu',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
            {getFileIcon(item.fileType, item.fileName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm break-words">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground break-words mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      render: (item) => (
        <Badge variant="outline" className={getCategoryColor(item.category)}>
          {getCategoryLabel(item.category)}
        </Badge>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Người tải lên',
      render: (item) => <span className="text-sm">{item.uploadedBy}</span>,
    },
    {
      key: 'fileSize',
      header: 'Kích thước',
      render: (item) => <span className="text-sm">{formatFileSize(item.fileSize)}</span>,
    },
    {
      key: 'uploadedAt',
      header: 'Ngày upload',
      render: (item) => (
        <span className="text-sm">{new Date(item.uploadedAt).toLocaleDateString("vi-VN")}</span>
      ),
    },
    {
      key: 'downloads',
      header: 'Lượt tải',
      align: 'center',
      render: (item) => <Badge variant="outline">{item.downloads}</Badge>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(item)}>
              <Eye className="w-4 h-4 mr-2" />
              Xem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(item)}>
              <Download className="w-4 h-4 mr-2" />
              Tải xuống
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleDelete(item.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tài liệu lớp học</h2>
          <p className="text-muted-foreground">Xem và quản lý tài liệu học tập của lớp</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tài liệu</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta?.total || allDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Tất cả file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dung lượng</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">Tổng dung lượng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt tải</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Tổng lượt tải xuống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload gần đây</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentUploadsCount !== undefined ? recentUploadsCount : allDocuments.filter(d => {
                const uploadDate = new Date(d.uploadedAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate >= weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Trong 7 ngày qua</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài liệu</CardTitle>
          <CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="lesson">Giáo án</SelectItem>
                  <SelectItem value="exercise">Bài tập</SelectItem>
                  <SelectItem value="exam">Đề thi</SelectItem>
                  <SelectItem value="material">Tài liệu học tập</SelectItem>
                  <SelectItem value="reference">Tài liệu tham khảo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 / trang</SelectItem>
                  <SelectItem value="10">10 / trang</SelectItem>
                  <SelectItem value="20">20 / trang</SelectItem>
                  <SelectItem value="50">50 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={documents}
            pagination={{
              currentPage: page,
              totalPages: meta?.totalPages || 0,
              totalItems: meta?.total || 0,
              itemsPerPage: pageSize,
              onPageChange: setPage,
              onItemsPerPageChange: setPageSize,
            }}
            loading={isLoading}
            error={isError ? 'Có lỗi xảy ra khi tải dữ liệu' : null}
            emptyMessage="Chưa có tài liệu nào cho lớp học này"
            enableSearch={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
