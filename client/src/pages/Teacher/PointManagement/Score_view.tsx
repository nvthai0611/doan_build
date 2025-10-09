"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Users,
  BookOpen,
  LineChart,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { teacherPointService } from "../../../services/teacher/point-management/point.service"
import type { StudentGradeDetail, SubjectStats, GradeViewFilters, GradeEntry } from "../../../services/teacher/point-management/point.types"
import LoadingPage from "../../../components/Loading/LoadingPage"

// Mock data đã được thay thế bằng API calls

export default function StudentGradesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailStudent, setDetailStudent] = useState<StudentGradeDetail | null>(null)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [editedScore, setEditedScore] = useState<number>(0)
  const [testTypeFilter, setTestTypeFilter] = useState("all")

  // Tạo filters object cho API
  const filters: GradeViewFilters = {
    searchTerm: searchTerm || undefined,
    subjectFilter: subjectFilter !== "all" ? subjectFilter : undefined,
    classFilter: classFilter !== "all" ? classFilter : undefined,
    testTypeFilter: testTypeFilter !== "all" ? testTypeFilter : undefined,
  }

  // Fetch danh sách lớp học của giáo viên (sử dụng service)
  const { 
    data: teacherClasses 
  } = useQuery({
    queryKey: ['teacherActiveClasses'],
    queryFn: () => teacherPointService.getTeacherActiveClasses(),
    staleTime: 30000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch data từ API
  const { 
    data: gradeViewData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['gradeViewData', filters],
    queryFn: () => teacherPointService.getGradeViewData(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  })

  const grades = gradeViewData?.students || []
  const subjectStats = gradeViewData?.subjectStats || []
  const totalStudents = gradeViewData?.totalStudents || 0
  const overallAverage = gradeViewData?.overallAverage || 0
  const passRate = gradeViewData?.passRate || 0
  
  // Extract classes từ service response
  const classes = teacherClasses || []
  
  // Extract unique subjects từ các lớp của giáo viên
  // subject có thể là string hoặc object {id, code, name, description}
  const subjectsMap = new Map()
  classes.forEach((cls: any) => {
    if (cls.subject) {
      // Nếu subject là object, lấy name; nếu là string thì giữ nguyên
      const subjectName = typeof cls.subject === 'string' ? cls.subject : cls.subject.name
      const subjectId = typeof cls.subject === 'string' ? cls.subject : cls.subject.id
      
      if (!subjectsMap.has(subjectId)) {
        subjectsMap.set(subjectId, {
          id: subjectId,
          name: subjectName
        })
      }
    }
  })
  const subjects = Array.from(subjectsMap.values())

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

  const getTrendIcon = (trend: string, value?: number) => {
    switch (trend) {
      case "up":
        return (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            {value && <span className="text-xs">+{value}</span>}
          </div>
        )
      case "down":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="w-4 h-4" />
            {value && <span className="text-xs">{value}</span>}
          </div>
        )
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const openDetailDialog = (grade: StudentGradeDetail) => {
    setDetailStudent(grade)
    setDetailDialogOpen(true)
    setEditingRowIndex(null)
    setTestTypeFilter("all")
  }

  const handleEditRow = (index: number, currentScore: number) => {
    setEditingRowIndex(index)
    setEditedScore(currentScore)
  }

  const handleSaveRow = async (index: number) => {
    if (detailStudent && editedScore >= 0 && editedScore <= 10) {
      try {
        const gradeToUpdate = detailStudent.grades[index] as GradeEntry
        // Tìm assessmentId từ grade data
        const assessmentId = gradeToUpdate.assessmentId || gradeToUpdate.testName
        
        await teacherPointService.updateStudentGrade(
          detailStudent.studentId,
          assessmentId,
          editedScore
        )

        // Cập nhật local state
        const updatedGrades = [...detailStudent.grades]
        updatedGrades[index] = { ...updatedGrades[index], score: editedScore }

        const totalWeight = updatedGrades.reduce((sum, g) => sum + (g as GradeEntry).weight, 0)
        const weightedSum = updatedGrades.reduce((sum, g) => sum + ((g as GradeEntry).score || 0) * (g as GradeEntry).weight, 0)
        const newAverage = Number.parseFloat((weightedSum / totalWeight).toFixed(1))

        const updatedStudent = {
          ...detailStudent,
          grades: updatedGrades,
          average: newAverage,
        }
        setDetailStudent(updatedStudent)
        setEditingRowIndex(null)

        // Refetch data để đồng bộ với server
        refetch()

        console.log("[v0] Saved updated grade for row:", index, "New score:", editedScore)
      } catch (error) {
        console.error("Error updating grade:", error)
        // Có thể thêm toast notification ở đây
      }
    }
  }

  const handleCancelRow = () => {
    setEditingRowIndex(null)
  }

  const getFilteredDetailGrades = () => {
    if (!detailStudent) return []
    if (testTypeFilter === "all") return detailStudent.grades
    return detailStudent.grades.filter((g: any) => g.type === testTypeFilter)
  }

  const getTestTypes = () => {
    if (!detailStudent) return []
    const types = new Set(detailStudent.grades.map((g: any) => g.type))
    return Array.from(types)
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Điểm số học sinh</h1>
            <p className="text-muted-foreground">Theo dõi và phân tích kết quả học tập với xu hướng chi tiết</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
                <p className="text-muted-foreground mb-4">
                  {error?.message || "Không thể tải dữ liệu điểm số"}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  Thử lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Điểm số học sinh</h1>
            <p className="text-muted-foreground">Theo dõi và phân tích kết quả học tập với xu hướng chi tiết</p>
          </div>
        </div>

        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grades">Bảng điểm</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
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
                        {subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Lớp học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                        {classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Hiển thị {grades.length} bản ghi điểm
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học sinh</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Điểm chi tiết</TableHead>
                      <TableHead>Điểm TB</TableHead>
                      <TableHead>Xếp loại</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade: StudentGradeDetail) => {
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
                                    .map((n: string) => n[0])
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
                            <Button variant="outline" size="sm" onClick={() => openDetailDialog(grade)}>
                              Detail
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className={`text-lg font-bold ${getGradeColor(grade.average)}`}>{grade.average}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={classification.variant}>{classification.label}</Badge>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng học sinh</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
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
                    {overallAverage.toFixed(1)}
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
                    {passRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Điểm ≥ 5.0</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê theo môn học</CardTitle>
                <CardDescription>Hiệu suất học tập của từng môn học</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectStats.length > 0 ? (
                    subjectStats.map((stat: SubjectStats) => (
                      <div key={stat.subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{stat.subject}</Badge>
                            <span className="text-sm text-muted-foreground">{stat.totalStudents} học sinh</span>
                          </div>
                          <div className="flex-1">
                            <Progress value={stat.passRate} className="h-2" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Kỳ trước: {stat.previousAverage}</span>
                          <span className={`font-medium ${getGradeColor(stat.averageGrade)}`}>
                            Hiện tại: {stat.averageGrade}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tỷ lệ đạt: {stat.passRate}%
                          {stat.trend === "up" ? " (↗️ Cải thiện)" : stat.trend === "down" ? " (↘️ Giảm)" : " (→ Ổn định)"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có dữ liệu thống kê môn học
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                      count: grades.filter((g: StudentGradeDetail) => g.average >= 9).length,
                      color: "bg-green-100 text-green-800",
                    },
                    {
                      label: "Khá",
                      range: "8.0-8.9",
                      count: grades.filter((g: StudentGradeDetail) => g.average >= 8 && g.average < 9).length,
                      color: "bg-blue-100 text-blue-800",
                    },
                    {
                      label: "TB",
                      range: "6.5-7.9",
                      count: grades.filter((g: StudentGradeDetail) => g.average >= 6.5 && g.average < 8).length,
                      color: "bg-yellow-100 text-yellow-800",
                    },
                    {
                      label: "Yếu",
                      range: "5.0-6.4",
                      count: grades.filter((g: StudentGradeDetail) => g.average >= 5 && g.average < 6.5).length,
                      color: "bg-orange-100 text-orange-800",
                    },
                    {
                      label: "Kém",
                      range: "< 5.0",
                      count: grades.filter((g: StudentGradeDetail) => g.average < 5).length,
                      color: "bg-red-100 text-red-800",
                    },
                  ].map((item: any) => (
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

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Chi tiết điểm số học sinh</DialogTitle>
              <DialogDescription>Xem thông tin chi tiết và phân tích xu hướng học tập</DialogDescription>
            </DialogHeader>

            {detailStudent && (
              <div className="space-y-6 mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={detailStudent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {detailStudent.studentName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{detailStudent.studentName}</h3>
                        <p className="text-muted-foreground">
                          {detailStudent.studentCode} • {detailStudent.subject} • Lớp {detailStudent.class}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{detailStudent.average}</div>
                        <Badge variant={getGradeClassification(detailStudent.average).variant}>
                          {getGradeClassification(detailStudent.average).label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Điểm chi tiết các bài kiểm tra</CardTitle>
                        <CardDescription>Danh sách điểm số theo từng loại kiểm tra</CardDescription>
                      </div>
                      <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Lọc theo loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả loại kiểm tra</SelectItem>
                          {getTestTypes().map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loại kiểm tra</TableHead>
                          <TableHead>Tên bài kiểm tra</TableHead>
                          <TableHead>Ngày kiểm tra</TableHead>
                          <TableHead className="text-right">Điểm số</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredDetailGrades().map((g: any, index: number) => {
                          const isEditing = editingRowIndex === index
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{g.type}</TableCell>
                              <TableCell>{g.testName}</TableCell>
                              <TableCell>{new Date(g.date).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={editedScore}
                                    onChange={(e) => setEditedScore(Number.parseFloat(e.target.value))}
                                    className="w-20 ml-auto text-right"
                                    autoFocus
                                  />
                                ) : (
                                  <span className={`text-lg font-bold ${getGradeColor(g.score)}`}>{g.score}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button onClick={() => handleSaveRow(index)} size="sm" variant="default">
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={handleCancelRow} size="sm" variant="outline">
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleEditRow(index, g.score)}
                                    size="sm"
                                    variant="ghost"
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {testTypeFilter === "all" && (
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={3} className="font-bold">
                              Điểm trung bình
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`text-xl font-bold ${getGradeColor(detailStudent.average)}`}>
                                {detailStudent.average}
                              </span>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
