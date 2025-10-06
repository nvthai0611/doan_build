"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Users, BookOpen } from "lucide-react"

const mockGrades = [
  {
    id: 1,
    studentId: 1,
    studentName: "Nguyễn Văn An",
    studentCode: "HS001",
    avatar: "/diverse-avatars.png",
    subject: "Toán",
    class: "10A",
    grades: [
      { type: "Kiểm tra 15 phút", score: 8.5, date: "2024-09-15", weight: 1 },
      { type: "Kiểm tra giữa kỳ", score: 9.0, date: "2024-10-15", weight: 2 },
      { type: "Kiểm tra cuối kỳ", score: 8.0, date: "2024-11-20", weight: 3 },
    ],
    average: 8.4,
    trend: "up",
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Trần Thị Bình",
    studentCode: "HS002",
    avatar: "/diverse-avatars.png",
    subject: "Toán",
    class: "10A",
    grades: [
      { type: "Kiểm tra 15 phút", score: 9.5, date: "2024-09-15", weight: 1 },
      { type: "Kiểm tra giữa kỳ", score: 9.0, date: "2024-10-15", weight: 2 },
      { type: "Kiểm tra cuối kỳ", score: 9.5, date: "2024-11-20", weight: 3 },
    ],
    average: 9.2,
    trend: "up",
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Lê Văn Cường",
    studentCode: "HS003",
    avatar: "/diverse-avatars.png",
    subject: "Hóa",
    class: "11A",
    grades: [
      { type: "Kiểm tra 15 phút", score: 7.0, date: "2024-09-15", weight: 1 },
      { type: "Kiểm tra giữa kỳ", score: 7.5, date: "2024-10-15", weight: 2 },
      { type: "Kiểm tra cuối kỳ", score: 6.5, date: "2024-11-20", weight: 3 },
    ],
    average: 7.0,
    trend: "down",
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Phạm Thị Dung",
    studentCode: "HS004",
    avatar: "/diverse-avatars.png",
    subject: "Văn",
    class: "12A",
    grades: [
      { type: "Kiểm tra 15 phút", score: 8.0, date: "2024-09-15", weight: 1 },
      { type: "Kiểm tra giữa kỳ", score: 9.0, date: "2024-10-15", weight: 2 },
      { type: "Kiểm tra cuối kỳ", score: 8.5, date: "2024-11-20", weight: 3 },
    ],
    average: 8.5,
    trend: "up",
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Hoàng Văn Em",
    studentCode: "HS005",
    avatar: "/diverse-avatars.png",
    subject: "Anh",
    class: "11B",
    grades: [
      { type: "Kiểm tra 15 phút", score: 6.0, date: "2024-09-15", weight: 1 },
      { type: "Kiểm tra giữa kỳ", score: 6.5, date: "2024-10-15", weight: 2 },
      { type: "Kiểm tra cuối kỳ", score: 7.0, date: "2024-11-20", weight: 3 },
    ],
    average: 6.5,
    trend: "up",
  },
]

const subjectStats = [
  { subject: "Toán", totalStudents: 45, averageGrade: 8.2, passRate: 92 },
  { subject: "Lý", totalStudents: 38, averageGrade: 7.8, passRate: 87 },
  { subject: "Hóa", totalStudents: 32, averageGrade: 7.5, passRate: 84 },
  { subject: "Văn", totalStudents: 50, averageGrade: 8.0, passRate: 90 },
  { subject: "Anh", totalStudents: 42, averageGrade: 7.3, passRate: 81 },
]

export default function StudentGradesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [grades] = useState(mockGrades)

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = subjectFilter === "all" || grade.subject === subjectFilter
    const matchesClass = classFilter === "all" || grade.class === classFilter

    return matchesSearch && matchesSubject && matchesClass
  })

  const getGradeColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6.5) return "text-blue-600"
    if (score >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeClassification = (score: number) => {
    if (score >= 9) return { label: "Giỏi", variant: "default" as const }
    if (score >= 8) return { label: "Khá", variant: "secondary" as const }
    if (score >= 6.5) return { label: "TB", variant: "outline" as const }
    if (score >= 5) return { label: "Yếu", variant: "destructive" as const }
    return { label: "Kém", variant: "destructive" as const }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Điểm số học sinh</h1>
            <p className="text-muted-foreground">Theo dõi và phân tích kết quả học tập</p>
          </div>
        </div>

        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grades">Bảng điểm</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Tìm kiếm và lọc</CardTitle>
                <CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả môn</SelectItem>
                        <SelectItem value="Toán">Toán</SelectItem>
                        <SelectItem value="Lý">Lý</SelectItem>
                        <SelectItem value="Hóa">Hóa</SelectItem>
                        <SelectItem value="Văn">Văn</SelectItem>
                        <SelectItem value="Anh">Anh</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Lớp học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                        <SelectItem value="10A">Lớp 10A</SelectItem>
                        <SelectItem value="10B">Lớp 10B</SelectItem>
                        <SelectItem value="11A">Lớp 11A</SelectItem>
                        <SelectItem value="11B">Lớp 11B</SelectItem>
                        <SelectItem value="12A">Lớp 12A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Hiển thị {filteredGrades.length} / {grades.length} bản ghi điểm
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học sinh</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Điểm chi tiết</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Xếp loại</TableHead>
                      <TableHead>Xu hướng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => {
                      const classification = getGradeClassification(grade.average)
                      return (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={grade.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {grade.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{grade.studentName}</p>
                                <p className="text-sm text-muted-foreground">{grade.studentCode}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline">{grade.subject}</Badge>
                              <p className="text-sm text-muted-foreground mt-1">Lớp {grade.class}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {grade.grades.map((g, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{g.type}:</span>
                                  <span className={`font-medium ${getGradeColor(g.score)}`}>{g.score}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`text-lg font-bold ${getGradeColor(grade.average)}`}>{grade.average}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={classification.variant}>{classification.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(grade.trend)}
                              <span className="text-sm text-muted-foreground">
                                {grade.trend === "up" ? "Tăng" : grade.trend === "down" ? "Giảm" : "Ổn định"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {/* Subject Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{grades.length}</div>
                  <p className="text-xs text-muted-foreground">Có điểm số</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Điểm TB chung</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(grades.reduce((sum, g) => sum + g.average, 0) / grades.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Trên tất cả môn học</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ đạt</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((grades.filter((g) => g.average >= 5).length / grades.length) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Điểm ≥ 5.0</p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê theo môn học</CardTitle>
                <CardDescription>Hiệu suất học tập của từng môn học</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectStats.map((stat) => (
                    <div key={stat.subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{stat.subject}</Badge>
                          <span className="text-sm text-muted-foreground">{stat.totalStudents} học sinh</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">Điểm TB: {stat.averageGrade}</div>
                            <div className="text-xs text-muted-foreground">Tỷ lệ đạt: {stat.passRate}%</div>
                          </div>
                        </div>
                      </div>
                      <Progress value={stat.passRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố điểm số</CardTitle>
                <CardDescription>Thống kê xếp loại học sinh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Giỏi",
                      range: "≥ 9.0",
                      count: grades.filter((g) => g.average >= 9).length,
                      color: "bg-green-100 text-green-800",
                    },
                    {
                      label: "Khá",
                      range: "8.0-8.9",
                      count: grades.filter((g) => g.average >= 8 && g.average < 9).length,
                      color: "bg-blue-100 text-blue-800",
                    },
                    {
                      label: "TB",
                      range: "6.5-7.9",
                      count: grades.filter((g) => g.average >= 6.5 && g.average < 8).length,
                      color: "bg-yellow-100 text-yellow-800",
                    },
                    {
                      label: "Yếu",
                      range: "5.0-6.4",
                      count: grades.filter((g) => g.average >= 5 && g.average < 6.5).length,
                      color: "bg-orange-100 text-orange-800",
                    },
                    {
                      label: "Kém",
                      range: "< 5.0",
                      count: grades.filter((g) => g.average < 5).length,
                      color: "bg-red-100 text-red-800",
                    },
                  ].map((item) => (
                    <Card key={item.label}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{item.count}</div>
                        <Badge className={item.color}>{item.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{item.range}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
