"use client"

import { useState } from "react"
import { DashboardLayout } from "../../manager/Layout/Dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, Save, Users, Search, CheckCircle, AlertCircle, BookOpen } from "lucide-react"

const mockClasses = [
  { id: 1, name: "Toán 10A", subject: "Toán học", studentCount: 25 },
  { id: 2, name: "Toán 10B", subject: "Toán học", studentCount: 28 },
  { id: 3, name: "Lý 11A", subject: "Vật lý", studentCount: 22 },
]

const mockStudents = [
  { id: 1, name: "Nguyễn Văn An", avatar: "/diverse-avatars.png", currentGrade: 8.5, studentCode: "HS001" },
  { id: 2, name: "Trần Thị Bình", avatar: "/diverse-avatars.png", currentGrade: 9.0, studentCode: "HS002" },
  { id: 3, name: "Lê Văn Cường", avatar: "/diverse-avatars.png", currentGrade: 7.5, studentCode: "HS003" },
  { id: 4, name: "Phạm Thị Dung", avatar: "/diverse-avatars.png", currentGrade: 8.8, studentCode: "HS004" },
  { id: 5, name: "Hoàng Văn Em", avatar: "/diverse-avatars.png", currentGrade: 6.5, studentCode: "HS005" },
  { id: 6, name: "Vũ Thị Phương", avatar: "/diverse-avatars.png", currentGrade: 9.2, studentCode: "HS006" },
]

export default function GradeInputPage() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("")
  const [examDate, setExamDate] = useState("")
  const [examTitle, setExamTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [grades, setGrades] = useState<Record<number, { score: string; comment: string }>>({})
  const [savedGrades, setSavedGrades] = useState<Set<number>>(new Set())

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGradeChange = (studentId: number, field: "score" | "comment", value: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))
    // Remove from saved grades when editing
    setSavedGrades((prev) => {
      const newSet = new Set(prev)
      newSet.delete(studentId)
      return newSet
    })
  }

  const saveIndividualGrade = (studentId: number) => {
    const grade = grades[studentId]
    if (grade?.score) {
      console.log("[v0] Saving individual grade:", { studentId, grade })
      setSavedGrades((prev) => new Set([...prev, studentId]))
    }
  }

  const saveAllGrades = () => {
    console.log("[v0] Saving all grades:", {
      class: selectedClass,
      examType: selectedExamType,
      examDate,
      examTitle,
      grades,
    })
    // Mark all students with grades as saved
    const studentsWithGrades = Object.keys(grades)
      .map(Number)
      .filter((id) => grades[id]?.score)
    setSavedGrades(new Set(studentsWithGrades))
  }

  const getGradeClassification = (score: string) => {
    const numScore = Number.parseFloat(score)
    if (numScore >= 9) return { label: "Giỏi", color: "bg-green-100 text-green-800" }
    if (numScore >= 8) return { label: "Khá", color: "bg-blue-100 text-blue-800" }
    if (numScore >= 6.5) return { label: "TB", color: "bg-yellow-100 text-yellow-800" }
    if (numScore >= 5) return { label: "Yếu", color: "bg-orange-100 text-orange-800" }
    return { label: "Kém", color: "bg-red-100 text-red-800" }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nhập điểm kiểm tra</h1>
          <p className="text-muted-foreground">Nhập điểm và nhận xét cho học sinh trong lớp</p>
        </div>

        {/* Class and Exam Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Thông tin bài kiểm tra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Lớp học</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} - {cls.subject} ({cls.studentCount} HS)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-type">Loại kiểm tra</Label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại kiểm tra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Kiểm tra 15 phút</SelectItem>
                    <SelectItem value="midterm">Kiểm tra giữa kỳ</SelectItem>
                    <SelectItem value="final">Kiểm tra cuối kỳ</SelectItem>
                    <SelectItem value="homework">Bài tập về nhà</SelectItem>
                    <SelectItem value="oral">Kiểm tra miệng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-title">Tên bài kiểm tra</Label>
                <Input
                  id="exam-title"
                  placeholder="VD: Kiểm tra chương 1 - Hàm số"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-date">Ngày kiểm tra</Label>
                <Input type="date" id="exam-date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Input */}
        {selectedClass && selectedExamType && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Nhập điểm học sinh
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mr-2">
                      <Users className="w-3 h-3 mr-1" />
                      {filteredStudents.length} học sinh
                    </Badge>
                    {mockClasses.find((c) => c.id.toString() === selectedClass)?.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Tìm học sinh..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {filteredStudents.map((student) => {
                const grade = grades[student.id]
                const isSaved = savedGrades.has(student.id)
                const classification = grade?.score ? getGradeClassification(grade.score) : null

                return (
                  <div key={student.id} className="border rounded-lg p-4 space-y-4 relative">
                    {isSaved && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã lưu
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{student.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {student.studentCode}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Điểm TB hiện tại: <span className="font-medium">{student.currentGrade}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`score-${student.id}`}>Điểm số (0-10)</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`score-${student.id}`}
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Nhập điểm"
                            value={grade?.score || ""}
                            onChange={(e) => handleGradeChange(student.id, "score", e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveIndividualGrade(student.id)}
                            disabled={!grade?.score || isSaved}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                        {classification && <Badge className={classification.color}>{classification.label}</Badge>}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`comment-${student.id}`}>Nhận xét</Label>
                        <Textarea
                          id={`comment-${student.id}`}
                          placeholder="Nhận xét về bài làm của học sinh..."
                          value={grade?.comment || ""}
                          onChange={(e) => handleGradeChange(student.id, "comment", e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(grades).filter((id) => grades[Number.parseInt(id)]?.score).length} /{" "}
                  {filteredStudents.length} học sinh đã có điểm
                </div>
                <Button
                  onClick={saveAllGrades}
                  disabled={!selectedExamType || Object.keys(grades).length === 0}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Lưu tất cả điểm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedClass && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Chọn lớp học để bắt đầu</h3>
                <p className="text-muted-foreground">
                  Vui lòng chọn lớp học và loại kiểm tra để nhập điểm cho học sinh
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
