"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, type Column } from "../../../components/common/Table/DataTable"
import {
  FileText,
  ImageIcon,
  File,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  FolderOpen,
  Calendar,
  Search,
} from "lucide-react"
import { teacherFileManagementService } from "../../../services/teacher/file-management/file.service"
import type { Material } from "../../../services/teacher/file-management/file.types"


// Fallback toast hook
const useToast = () => {
  const toast = ({ title, description, variant }: any = {}) => {
    if (variant === "destructive") {
      console.error("[toast][destructive]", { title, description })
    } else {
      console.info("[toast]", { title, description })
    }
  }
  return { toast }
}

export default function DocumentManagePage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch materials from API
  const { data: materialsData, isLoading, isError } = useQuery({
    queryKey: ['teacher-materials', { category: categoryFilter, classId: classFilter, page, pageSize }],
    queryFn: () => teacherFileManagementService.getMaterials({
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      classId: classFilter !== "all" ? classFilter : undefined,
      page,
      limit: pageSize,
    }),
    staleTime: 30000, // Cache 30 seconds
    refetchOnWindowFocus: false,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (materialId: number) => teacherFileManagementService.deleteMaterial(materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-materials'] })
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

  // Filter documents by search term (search trong cả title và fileName)
  const documents = allDocuments.filter((doc) => {
    if (!searchTerm.trim()) return true
    const search = searchTerm.toLowerCase()
    return (
      doc.title.toLowerCase().includes(search) ||
      doc.fileName.toLowerCase().includes(search)
    )
  })

  // Handlers
  const handleDownload = async (material: Material) => {
    try {
      // Show loading toast
      toast({
        title: "Đang tải xuống",
        description: `Đang tải ${material.fileName}...`,
      });
      
      // Fetch file as blob (prevents opening in new tab)
      const response = await fetch(material.fileUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = material.fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      
      // Increment download count
      try {
        await teacherFileManagementService.incrementDownload(material.id);
      } catch (countError) {
        console.warn('Failed to increment download count:', countError);
      }
      
      toast({
        title: "Tải xuống thành công",
        description: `Đã tải ${material.fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống tài liệu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = (materialId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      deleteMutation.mutate(materialId)
    }
  }

  const handleView = (material: Material) => {
    // Mở file trong tab mới
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
    // Check by file extension first
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
    // Fallback to MIME type
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

  // Get stats from meta (tổng của tất cả tài liệu, không chỉ trang hiện tại)
  const totalSize = meta?.totalSize || allDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
  const totalDownloads = meta?.totalDownloads || allDocuments.reduce((sum, doc) => sum + doc.downloads, 0)
  const recentUploadsCount = meta?.recentUploads

  // Table columns
  const columns: Column<Material>[] = [
    {
      key: 'title',
      header: 'File name',
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
      key: 'className',
      header: 'Lớp học',
      render: (item) => <Badge variant="secondary">{item.className}</Badge>,
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
    <>
      <style>{`
        /* Override DataTable default overflow and set fixed layout for document management */
        .document-management-page .overflow-x-auto {
          overflow-x: visible !important;
        }
        
        .document-management-page .overflow-x-auto table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        
        .document-management-page .overflow-x-auto th,
        .document-management-page .overflow-x-auto td {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        /* Specific column widths for document management table */
        .document-management-page .overflow-x-auto th:nth-child(1),
        .document-management-page .overflow-x-auto td:nth-child(1) {
          width: 35% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(2),
        .document-management-page .overflow-x-auto td:nth-child(2) {
          width: 12% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(3),
        .document-management-page .overflow-x-auto td:nth-child(3) {
          width: 15% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(4),
        .document-management-page .overflow-x-auto td:nth-child(4) {
          width: 8% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(5),
        .document-management-page .overflow-x-auto td:nth-child(5) {
          width: 12% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(6),
        .document-management-page .overflow-x-auto td:nth-child(6) {
          width: 8% !important;
        }
        
        .document-management-page .overflow-x-auto th:nth-child(7),
        .document-management-page .overflow-x-auto td:nth-child(7) {
          width: 8% !important;
        }
      `}</style>
      <div className="space-y-6 p-6 document-management-page">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Quản lý tài liệu</h1>
            <p className="text-muted-foreground">Xem và quản lý tất cả tài liệu đã upload</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/teacher/documents/upload")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
          >
            Upload tài liệu mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-blue-900">Tổng tài liệu</CardTitle>
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{meta?.total || allDocuments.length}</div>
              <p className="text-xs text-blue-700 font-medium mt-1">Tất cả file</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-purple-900">Dung lượng</CardTitle>
              <FileText className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{formatFileSize(totalSize)}</div>
              <p className="text-xs text-purple-700 font-medium mt-1">Tổng dung lượng</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-green-900">Lượt tải</CardTitle>
              <Download className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{totalDownloads}</div>
              <p className="text-xs text-green-700 font-medium mt-1">Tổng lượt tải xuống</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-orange-900">Upload gần đây</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {recentUploadsCount !== undefined ? recentUploadsCount : allDocuments.filter(d => {
                  const uploadDate = new Date(d.uploadedAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return uploadDate >= weekAgo
                }).length}
              </div>
              <p className="text-xs text-orange-700 font-medium mt-1">Trong 7 ngày qua</p>
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
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {Array.from(new Set(allDocuments.map(d => d.classId))).map((classId) => {
                      const doc = allDocuments.find(d => d.classId === classId)
                      return (
                        <SelectItem key={classId} value={classId}>
                          {doc?.className || classId}
                        </SelectItem>
                      )
                    })}
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
              emptyMessage="Chưa có tài liệu nào. Upload tài liệu đầu tiên của bạn ngay!"
              enableSearch={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
