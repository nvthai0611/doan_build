"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, CheckCircle, Clock, XCircle, Eye, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedbackDetailDialog } from "./components/DialogDetail"

interface TeacherFeedback {
  id: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  parentName: string
  parentEmail: string
  studentName: string
  className: string
  rating: number
  categories: {
    teaching_quality: number
    communication: number
    punctuality: number
    professionalism: number
  }
  comment: string
  isAnonymous: boolean
  status: "pending" | "approved" | "rejected" | "archived"
  createdAt: string
}

const mockFeedback: TeacherFeedback[] = [
  {
    id: "1",
    teacherId: "t1",
    teacherName: "Thầy Nguyễn Văn A",
    parentName: "Nguyễn Thị Hương",
    parentEmail: "huong@email.com",
    studentName: "Nguyễn Minh Anh",
    className: "Lớp 10A",
    rating: 5,
    categories: {
      teaching_quality: 5,
      communication: 5,
      punctuality: 4,
      professionalism: 5,
    },
    comment: "Giáo viên rất tận tâm, con em tiến bộ rất nhiều trong học tập. Cách giảng dạy rất dễ hiểu.",
    isAnonymous: false,
    status: "approved",
    createdAt: "2025-10-20",
  },
  {
    id: "2",
    teacherId: "t2",
    teacherName: "Cô Trần Thị B",
    parentName: "Trần Văn Hùng",
    parentEmail: "hung@email.com",
    studentName: "Trần Minh Huy",
    className: "Lớp 9B",
    rating: 3,
    categories: {
      teaching_quality: 3,
      communication: 2,
      punctuality: 4,
      professionalism: 3,
    },
    comment: "Giáo viên cần cải thiện kỹ năng giao tiếp với phụ huynh. Mong nhận được phản hồi thường xuyên hơn.",
    isAnonymous: false,
    status: "pending",
    createdAt: "2025-10-22",
  },
  {
    id: "3",
    teacherId: "t1",
    teacherName: "Thầy Nguyễn Văn A",
    parentName: "Lê Thị Lan",
    parentEmail: "lan@email.com",
    studentName: "Lê Quốc Anh",
    className: "Lớp 10A",
    rating: 4,
    categories: {
      teaching_quality: 4,
      communication: 4,
      punctuality: 5,
      professionalism: 4,
    },
    comment: "Thầy giáo rất chuyên nghiệp và luôn đúng giờ. Con em rất thích học với thầy.",
    isAnonymous: true,
    status: "approved",
    createdAt: "2025-10-21",
  },
  {
    id: "4",
    teacherId: "t3",
    teacherName: "Cô Phạm Thị C",
    parentName: "Phạm Minh Tuấn",
    parentEmail: "tuan@email.com",
    studentName: "Phạm Gia Bảo",
    className: "Lớp 8C",
    rating: 2,
    categories: {
      teaching_quality: 2,
      communication: 3,
      punctuality: 2,
      professionalism: 2,
    },
    comment: "Cô giáo thường xuyên đến muộn và không chuẩn bị bài tốt. Cần cải thiện.",
    isAnonymous: false,
    status: "pending",
    createdAt: "2025-10-23",
  },
  {
    id: "5",
    teacherId: "t2",
    teacherName: "Cô Trần Thị B",
    parentName: "Vũ Thị Hồng",
    parentEmail: "hong@email.com",
    studentName: "Vũ Minh Khôi",
    className: "Lớp 9B",
    rating: 5,
    categories: {
      teaching_quality: 5,
      communication: 5,
      punctuality: 5,
      professionalism: 5,
    },
    comment: "Cảm ơn cô giáo đã giúp con em chuẩn bị tốt cho kỳ thi. Cô rất tâm huyết.",
    isAnonymous: false,
    status: "approved",
    createdAt: "2025-10-19",
  },
]

const statusConfig = {
  pending: { label: "Chờ duyệt", color: "bg-blue-100 text-blue-800", icon: Clock },
  approved: { label: "Đã duyệt", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-800", icon: XCircle },
  archived: { label: "Lưu trữ", color: "bg-gray-100 text-gray-800", icon: Clock },
}

const categoryLabels = {
  teaching_quality: "Chất lượng giảng dạy",
  communication: "Giao tiếp",
  punctuality: "Đúng giờ",
  professionalism: "Chuyên nghiệp",
}

export function FeedbackTeacher() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState<string>("all")
  const [filterTeacher, setFilterTeacher] = useState<string>("all")
  const [filterClass, setFilterClass] = useState<string>("all")
  const [selectedFeedback, setSelectedFeedback] = useState<TeacherFeedback | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const uniqueTeachers = Array.from(new Set(mockFeedback.map((f) => f.teacherName))).sort()
  const uniqueClasses = Array.from(new Set(mockFeedback.map((f) => f.className))).sort()

  const filteredFeedback = mockFeedback.filter((item) => {
    const matchesSearch =
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRating = filterRating === "all" || item.rating === Number.parseInt(filterRating)
    const matchesTeacher = filterTeacher === "all" || item.teacherName === filterTeacher
    const matchesClass = filterClass === "all" || item.className === filterClass

    return matchesSearch && matchesRating && matchesTeacher && matchesClass
  })

  const stats = {
    total: mockFeedback.length,
    avgRating: (mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1),
  }

  const handleOpenDetail = (feedback: TeacherFeedback) => {
    setSelectedFeedback(feedback)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Quản lý Feedback Giáo Viên</h1>
        <p className="text-muted-foreground mt-1">Theo dõi và xử lý các đánh giá từ phụ huynh về giáo viên</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Feedback</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tất cả đánh giá</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh Giá TB</CardTitle>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Trên 5 sao</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giáo viên, phụ huynh, học sinh..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo giáo viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giáo viên</SelectItem>
                {uniqueTeachers.map((teacher) => (
                  <SelectItem key={teacher} value={teacher}>
                    {teacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground pt-2">
              Hiển thị {filteredFeedback.length} / {mockFeedback.length} đánh giá
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Feedback</CardTitle>
          <CardDescription>Quản lý và duyệt các đánh giá từ phụ huynh</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giáo Viên</TableHead>
                  <TableHead>Phụ Huynh / Học Sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Đánh Giá</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((feedback) => {
                  const StatusIcon = statusConfig[feedback.status].icon
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={feedback.teacherAvatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {feedback.teacherName.split(" ").slice(-1)[0].substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{feedback.teacherName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{feedback.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {feedback.isAnonymous ? "Ẩn danh" : feedback.parentName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{feedback.className}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusConfig[feedback.status].color}>
                            {statusConfig[feedback.status].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{feedback.createdAt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(feedback)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Hành Động
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FeedbackDetailDialog feedback={selectedFeedback} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
