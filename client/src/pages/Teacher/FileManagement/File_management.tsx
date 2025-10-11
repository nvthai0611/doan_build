"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  ImageIcon,
  File,
  Search,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Edit,
  FolderOpen,
  Calendar,
  Loader2,
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
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch materials from API
  const { data: materialsData, isLoading, isError } = useQuery({
    queryKey: ['teacher-materials', { search: searchTerm, category: categoryFilter, classId: classFilter, page }],
    queryFn: () => teacherFileManagementService.getMaterials({
      search: searchTerm || undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      classId: classFilter !== "all" ? classFilter : undefined,
      page,
      limit: 100, // Load nhiều để không phải phân trang
    }),
    staleTime: 30000, // Cache 30 giây
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

  const documents = materialsData?.data || []
  const meta = materialsData?.meta

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

  const getFileIcon = (type?: string) => {
    if (!type) return <File className="w-5 h-5 text-gray-600" />
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-600" />
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-600" />
    return <File className="w-5 h-5 text-gray-600" />
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

  const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloads, 0)

  // // Loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Loader2 className="w-8 h-8 animate-spin text-[rgb(255,127,80)]" />
  //       <span className="ml-2">Đang tải dữ liệu...</span>
  //     </div>
  //   )
  // }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
      <div className="space-y-6 p-6">      

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Quản lý tài liệu</h1>
            <p className="text-muted-foreground">Xem và quản lý tất cả tài liệu đã upload</p>
          </div>
          <Button
            onClick={() => (window.location.href = "/teacher/documents/upload")}
            className="bg-[rgb(255,127,80)] hover:bg-[rgb(255,107,60)] text-white"
          >
            Upload tài liệu mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tài liệu</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meta?.total || documents.length}</div>
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
              <div className="text-2xl font-bold">{documents.filter(d => {
                const uploadDate = new Date(d.uploadedAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate >= weekAgo
              }).length}</div>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm tài liệu..."
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
                    {/* Unique class list from documents */}
                    {Array.from(new Set(documents.map(d => d.classId))).map((classId) => {
                      const doc = documents.find(d => d.classId === classId)
                      return (
                        <SelectItem key={classId} value={classId}>
                          {doc?.className || classId}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Hiển thị {documents.length} tài liệu {meta?.total && `(Tổng: ${meta.total})`}
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Chưa có tài liệu nào</p>
                <p className="text-sm">Upload tài liệu đầu tiên của bạn ngay!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Lớp học</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Ngày upload</TableHead>
                    <TableHead>Lượt tải</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-md">
                            <AvatarFallback className="rounded-md bg-muted">{getFileIcon(doc.fileType)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(doc.category)}>
                          {getCategoryLabel(doc.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.className}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell className="text-sm">{new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.downloads}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(doc)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="w-4 h-4 mr-2" />
                              Tải xuống
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
