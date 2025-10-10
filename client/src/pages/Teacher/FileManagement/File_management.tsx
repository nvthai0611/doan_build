"use client"

import { useState } from "react"
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
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  category: string
  class: string
  size: number
  uploadDate: string
  downloads: number
  description?: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Giáo án Hàm số bậc nhất.pdf",
    type: "application/pdf",
    category: "Giáo án",
    class: "Lớp 10A",
    size: 2500000,
    uploadDate: "2025-01-15",
    downloads: 45,
    description: "Giáo án chi tiết về hàm số bậc nhất",
  },
  {
    id: "2",
    name: "Bài tập Đạo hàm.docx",
    type: "application/docx",
    category: "Bài tập",
    class: "Lớp 11B",
    size: 1200000,
    uploadDate: "2025-01-14",
    downloads: 32,
    description: "Bài tập về đạo hàm cơ bản và nâng cao",
  },
  {
    id: "3",
    name: "Đề thi giữa kỳ 1.pdf",
    type: "application/pdf",
    category: "Đề thi",
    class: "Lớp 12A",
    size: 800000,
    uploadDate: "2025-01-13",
    downloads: 67,
    description: "Đề thi giữa kỳ 1 môn Toán",
  },
  {
    id: "4",
    name: "Hình minh họa Hình học.jpg",
    type: "image/jpeg",
    category: "Tài liệu học tập",
    class: "Tất cả lớp",
    size: 3500000,
    uploadDate: "2025-01-12",
    downloads: 23,
    description: "Hình ảnh minh họa các định lý hình học",
  },
  {
    id: "5",
    name: "Tài liệu tham khảo Tích phân.pdf",
    type: "application/pdf",
    category: "Tài liệu tham khảo",
    class: "Lớp 12A",
    size: 4200000,
    uploadDate: "2025-01-11",
    downloads: 18,
    description: "Tài liệu tham khảo về tích phân",
  },
]

export default function DocumentManagePage() {
  const [documents] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
    const matchesClass = classFilter === "all" || doc.class === classFilter

    return matchesSearch && matchesCategory && matchesClass
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-600" />
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-red-600" />
    return <File className="w-5 h-5 text-gray-600" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Giáo án": "bg-purple-100 text-purple-800 border-purple-300",
      "Bài tập": "bg-blue-100 text-blue-800 border-blue-300",
      "Đề thi": "bg-red-100 text-red-800 border-red-300",
      "Tài liệu học tập": "bg-green-100 text-green-800 border-green-300",
      "Tài liệu tham khảo": "bg-yellow-100 text-yellow-800 border-yellow-300",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0)
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloads, 0)

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
              <div className="text-2xl font-bold">{documents.length}</div>
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
              <div className="text-2xl font-bold">5</div>
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
                    <SelectItem value="Giáo án">Giáo án</SelectItem>
                    <SelectItem value="Bài tập">Bài tập</SelectItem>
                    <SelectItem value="Đề thi">Đề thi</SelectItem>
                    <SelectItem value="Tài liệu học tập">Tài liệu học tập</SelectItem>
                    <SelectItem value="Tài liệu tham khảo">Tài liệu tham khảo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    <SelectItem value="Lớp 10A">Lớp 10A</SelectItem>
                    <SelectItem value="Lớp 11B">Lớp 11B</SelectItem>
                    <SelectItem value="Lớp 12A">Lớp 12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Hiển thị {filteredDocuments.length} / {documents.length} tài liệu
            </div>
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
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-md">
                          <AvatarFallback className="rounded-md bg-muted">{getFileIcon(doc.type)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.class}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatFileSize(doc.size)}</TableCell>
                    <TableCell className="text-sm">{new Date(doc.uploadDate).toLocaleDateString("vi-VN")}</TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Tải xuống
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}
