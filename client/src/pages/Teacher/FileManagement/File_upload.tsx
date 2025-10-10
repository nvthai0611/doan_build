"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, ImageIcon, File, X, CheckCircle, AlertCircle } from "lucide-react"

// Fallback local useToast hook when '@/hooks/use-toast' module is not available.
// This provides the same API used in this file: const { toast } = useToast()
const useToast = () => {
  const toast = ({
    title,
    description,
    variant,
  }: {
    title?: string
    description?: string
    variant?: "default" | "destructive" | string
  } = {}) => {
    // Basic fallback: log to console; replace with real toast UI if available
    if (variant === "destructive") {
      console.error("[toast][destructive]", { title, description })
    } else {
      console.info("[toast]", { title, description })
    }
  }

  return { toast }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "success" | "error"
}

export default function DocumentUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [category, setCategory] = useState("")
  const [targetClass, setTargetClass] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading" as const,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((file) => {
      simulateUpload(file.id)
    })
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress,
                status: progress === 100 ? "success" : "uploading",
              }
            : f,
        ),
      )

      if (progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleUploadAll = () => {
    if (!category || !targetClass) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn danh mục và lớp học",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "Chưa có file",
        description: "Vui lòng chọn ít nhất một file để upload",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Upload thành công",
      description: `Đã upload ${files.length} tài liệu`,
    })

    // Reset form
    setTimeout(() => {
      setFiles([])
      setCategory("")
      setTargetClass("")
      setDescription("")
    }, 1500)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />
    if (type.includes("pdf")) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (   
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Upload tài liệu</h1>
          <p className="text-muted-foreground">Tải lên tài liệu giảng dạy, bài tập và tài liệu học tập</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[3px] border-[rgb(25,40,80)]">
              <CardHeader className="bg-[rgb(240,225,200)]">
                <CardTitle className="text-[rgb(25,40,80)] font-bold">BƯỚC 1: CHỌN FILE</CardTitle>
                <CardDescription className="text-[rgb(25,40,80)]">
                  Kéo thả file hoặc click để chọn. Hỗ trợ PDF, Word, Excel, PowerPoint, hình ảnh
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-[rgb(240,225,200)]">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-[3px] border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? "border-[rgb(255,127,80)] bg-[rgb(255,127,80)]/10" : "border-[rgb(25,40,80)] bg-white"
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[rgb(25,40,80)]" />
                  <p className="text-lg font-semibold text-[rgb(25,40,80)] mb-2">Kéo & Thả file vào đây</p>
                  <p className="text-sm text-[rgb(25,40,80)] mb-4">hoặc</p>
                  <Label htmlFor="file-upload">
                    <div className="inline-block">
                      <Button
                        type="button"
                        className="bg-[rgb(255,127,80)] hover:bg-[rgb(255,107,60)] text-white font-bold border-[3px] border-[rgb(25,40,80)]"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Chọn file
                      </Button>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                  />
                  <p className="text-xs text-[rgb(25,40,80)] mt-4">Kích thước tối đa: 50MB mỗi file</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-[rgb(25,40,80)]">Danh sách file ({files.length})</h3>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 bg-white border-[2px] border-[rgb(25,40,80)] rounded-lg"
                      >
                        <div className="text-[rgb(25,40,80)]">{getFileIcon(file.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[rgb(25,40,80)] truncate">{file.name}</p>
                          <p className="text-xs text-[rgb(25,40,80)]/70">{formatFileSize(file.size)}</p>
                          {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-2" />}
                        </div>
                        {file.status === "success" && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                        {file.status === "error" && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0 text-[rgb(25,40,80)] hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[3px] border-[rgb(25,40,80)]">
              <CardHeader className="bg-[rgb(240,225,200)]">
                <CardTitle className="text-[rgb(25,40,80)] font-bold">BƯỚC 2: THÔNG TIN TÀI LIỆU</CardTitle>
                <CardDescription className="text-[rgb(25,40,80)]">
                  Điền thông tin để phân loại và quản lý tài liệu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-[rgb(240,225,200)] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[rgb(25,40,80)] font-bold">
                      DANH MỤC:
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-[3px] border-[rgb(25,40,80)] bg-white">
                        <SelectValue placeholder="Chọn danh mục..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Giáo án</SelectItem>
                        <SelectItem value="exercise">Bài tập</SelectItem>
                        <SelectItem value="exam">Đề thi</SelectItem>
                        <SelectItem value="material">Tài liệu học tập</SelectItem>
                        <SelectItem value="reference">Tài liệu tham khảo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class" className="text-[rgb(25,40,80)] font-bold">
                      LỚP HỌC:
                    </Label>
                    <Select value={targetClass} onValueChange={setTargetClass}>
                      <SelectTrigger className="border-[3px] border-[rgb(25,40,80)] bg-white">
                        <SelectValue placeholder="Chọn lớp học..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10a">Lớp 10A - Toán</SelectItem>
                        <SelectItem value="11b">Lớp 11B - Toán</SelectItem>
                        <SelectItem value="12a">Lớp 12A - Toán</SelectItem>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[rgb(25,40,80)] font-bold">
                    MÔ TẢ:
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về tài liệu..."
                    className="border-[3px] border-[rgb(25,40,80)] bg-white min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleUploadAll}
                  className="w-full bg-[rgb(255,127,80)] hover:bg-[rgb(255,107,60)] text-white font-bold py-6 text-lg border-[3px] border-[rgb(25,40,80)]"
                  disabled={files.length === 0 || files.some((f) => f.status === "uploading")}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload tất cả
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="border-[3px] border-[rgb(25,40,80)]">
              <CardHeader className="bg-[rgb(240,225,200)]">
                <CardTitle className="text-[rgb(25,40,80)] font-bold">HƯỚNG DẪN</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-[rgb(240,225,200)]">
                <div className="space-y-4 text-sm text-[rgb(25,40,80)]">
                  <div>
                    <h4 className="font-bold mb-2">Định dạng hỗ trợ:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Tài liệu: PDF, Word, Excel, PowerPoint</li>
                      <li>Hình ảnh: JPG, PNG, GIF</li>
                      <li>Kích thước tối đa: 50MB/file</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Lưu ý:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Đặt tên file rõ ràng, dễ hiểu</li>
                      <li>Chọn đúng danh mục và lớp học</li>
                      <li>Thêm mô tả để dễ tìm kiếm sau này</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[3px] border-[rgb(25,40,80)]">
              <CardHeader className="bg-[rgb(240,225,200)]">
                <CardTitle className="text-[rgb(25,40,80)] font-bold">THỐNG KÊ</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-[rgb(240,225,200)] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[rgb(25,40,80)]">File đã chọn:</span>
                  <Badge className="bg-[rgb(255,127,80)] text-white border-[2px] border-[rgb(25,40,80)]">
                    {files.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[rgb(25,40,80)]">Đã upload:</span>
                  <Badge className="bg-green-600 text-white border-[2px] border-[rgb(25,40,80)]">
                    {files.filter((f) => f.status === "success").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[rgb(25,40,80)]">Đang upload:</span>
                  <Badge className="bg-blue-600 text-white border-[2px] border-[rgb(25,40,80)]">
                    {files.filter((f) => f.status === "uploading").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>    
  )
}
