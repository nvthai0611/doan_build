"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../assets/shadcn-ui/components/card"
import { Button } from "../../../../assets/shadcn-ui/components/button"
import { Input } from "../../../../assets/shadcn-ui/components/input"
import { Badge } from "../../../../assets/shadcn-ui/components/badge"
import { Plus, Search, MoreHorizontal, FileText, Download, Eye, Calendar, User } from "lucide-react"

interface DocumentsInfoProps {
  classId: string
}

export default function DocumentsInfo({ classId }: DocumentsInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "pdf" | "doc" | "image" | "video">("all")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const documents = [
    {
      id: "1",
      name: "Giáo trình tiếng Anh cơ bản",
      description: "Tài liệu học tập chính cho khóa học",
      type: "pdf",
      size: "2.5 MB",
      uploadDate: "2024-01-15",
      uploadedBy: "Nguyễn Thị Lan",
      downloads: 45,
      views: 120
    },
    {
      id: "2",
      name: "Bài tập ngữ pháp tuần 1",
      description: "Bài tập về thì hiện tại đơn",
      type: "doc",
      size: "1.2 MB",
      uploadDate: "2024-01-16",
      uploadedBy: "Nguyễn Thị Lan",
      downloads: 38,
      views: 95
    },
    {
      id: "3",
      name: "Hình ảnh minh họa từ vựng",
      description: "Bộ hình ảnh hỗ trợ học từ vựng",
      type: "image",
      size: "5.8 MB",
      uploadDate: "2024-01-17",
      uploadedBy: "Nguyễn Thị Lan",
      downloads: 25,
      views: 78
    },
    {
      id: "4",
      name: "Video bài giảng phát âm",
      description: "Video hướng dẫn phát âm chuẩn",
      type: "video",
      size: "15.2 MB",
      uploadDate: "2024-01-18",
      uploadedBy: "Nguyễn Thị Lan",
      downloads: 32,
      views: 156
    },
    {
      id: "5",
      name: "Đề thi thử giữa kỳ",
      description: "Đề thi tham khảo cho kỳ thi giữa khóa",
      type: "pdf",
      size: "890 KB",
      uploadDate: "2024-01-20",
      uploadedBy: "Nguyễn Thị Lan",
      downloads: 28,
      views: 67
    }
  ]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && doc.type === activeTab
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "pdf":
        return <Badge className="bg-red-100 text-red-800">PDF</Badge>
      case "doc":
        return <Badge className="bg-blue-100 text-blue-800">DOC</Badge>
      case "image":
        return <Badge className="bg-green-100 text-green-800">Hình ảnh</Badge>
      case "video":
        return <Badge className="bg-purple-100 text-purple-800">Video</Badge>
      default:
        return <Badge variant="secondary">Khác</Badge>
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-600" />
      case "doc":
        return <FileText className="h-8 w-8 text-blue-600" />
      case "image":
        return <FileText className="h-8 w-8 text-green-600" />
      case "video":
        return <FileText className="h-8 w-8 text-purple-600" />
      default:
        return <FileText className="h-8 w-8 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tài liệu</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý tài liệu học tập và tài nguyên
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tải lên tài liệu
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Tất cả ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab("pdf")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "pdf"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                PDF ({documents.filter(d => d.type === "pdf").length})
              </button>
              <button
                onClick={() => setActiveTab("doc")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "doc"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                DOC ({documents.filter(d => d.type === "doc").length})
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "image"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Hình ảnh ({documents.filter(d => d.type === "image").length})
              </button>
              <button
                onClick={() => setActiveTab("video")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "video"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Video ({documents.filter(d => d.type === "video").length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài liệu ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {getFileIcon(document.type)}
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {document.size}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {document.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {document.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(document.uploadDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {document.uploadedBy}
                      </div>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {document.downloads} lượt tải
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {document.views} lượt xem
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-2">
                    {getTypeBadge(document.type)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có tài liệu nào</p>
                  <p className="text-sm">Tải lên tài liệu đầu tiên cho lớp học</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
