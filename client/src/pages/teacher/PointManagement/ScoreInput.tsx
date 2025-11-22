import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "../../manager/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, Save, Users, Search, CheckCircle, AlertCircle, BookOpen } from "lucide-react"
import { teacherPointService } from "../../../services/teacher/point-management/point.service"
import { GradeEntry, TeacherClassItem, TeacherStudentSummary } from "../../../services/teacher/point-management/point.types"
import { teacherCommonService } from "../../../services/teacher/common/common.service"
import { teacherClassService } from "../../../services/teacher/class-management/class.service"

export default function GradeInputPage() {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<TeacherClassItem[]>([])
  const [students, setStudents] = useState<TeacherStudentSummary[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("")
  const [examTypesConfig, setExamTypesConfig] = useState<any[]>([]) 
  const [currentMaxScore, setCurrentMaxScore] = useState<number>(10) 
  const [selectedSession, setSelectedSession] = useState("")
  const [sessions, setSessions] = useState<any[]>([])
  const [examTitle, setExamTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [grades, setGrades] = useState<Record<string, { score: string; comment: string }>>({})
  const [savedGrades, setSavedGrades] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)

        const response = await teacherClassService.getClasses()

        const items = ((response as any) || []).map((c: any) => {
          return {
            id: c.id,
            name: c.name,
            subject: { name: c.subject?.name || 'N/A' },
          }
        }) as TeacherClassItem[]
        setClasses(items)
      } catch (e: any) {
        console.error('Fetch classes error', e)
        console.error('Error details:', {
          status: e?.status,
          message: e?.message,
          response: e?.response
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  // Khi chọn lớp: lấy danh sách học sinh ngay lập tức
  useEffect(() => {
    const run = async () => {
      if (!selectedClass) {
        setStudents([])
        setSelectedAssignment("")
        return
      }


      try {
        setLoading(true)

        // Gọi API mới sử dụng classId trực tiếp
        const response = await teacherCommonService.getListStudentOfClass(selectedClass)

        // Kiểm tra response structure
        let studentsArray = null
        if (Array.isArray(response)) {
          // Response trực tiếp là array
          studentsArray = response
        } else if (response && response.data && Array.isArray(response.data)) {
          // Response có structure {success, data, message}
          studentsArray = response.data
        }

        if (studentsArray && Array.isArray(studentsArray)) {
          // Sử dụng helper method từ service để transform data
          const studentsData = teacherCommonService.processStudentsData(studentsArray)
          setStudents(studentsData)
        } else {
          setStudents([])
        }

        setGrades({})
        setSavedGrades(new Set())
      } catch (e: any) {
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [selectedClass, classes])

  // Khi chọn lớp: cũng lấy danh sách loại kiểm tra, config và sessions
  useEffect(() => {
    const run = async () => {
      if (!selectedClass) {
        setSessions([])
        setSelectedSession("")
        return
      }
      try {
        // Lấy config đầy đủ bao gồm name, maxScore, description
        const config = await teacherPointService.getExamTypesConfig()
        setExamTypesConfig(config || [])

        // Lấy danh sách buổi học đã kết thúc
        const completedSessions = await teacherPointService.getCompletedSessions(selectedClass)
        setSessions(completedSessions || [])
      } catch (e) {
        setExamTypesConfig([])
        setSessions([])
      }
    }
    run()
  }, [selectedClass])

  // Cập nhật maxScore khi chọn exam type
  useEffect(() => {
    if (selectedExamType && examTypesConfig.length > 0) {
      try {
        const parsed = JSON.parse(selectedExamType)
        setCurrentMaxScore(parsed.maxScore || 10)
      } catch {
        setCurrentMaxScore(10)
      }
    }
  }, [selectedExamType, examTypesConfig])

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        (student.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [students, searchTerm])

  const handleGradeChange = (studentId: string, field: "score" | "comment", value: string) => {
    // Validate score input - cho phép nhập số thập phân
    if (field === "score" && value !== "") {
      // Cho phép các trường hợp đang nhập: "7", "7.", "7.5"
      // Chỉ validate khi đã nhập xong một số hoàn chỉnh
      if (value.endsWith('.')) {
        // Đang nhập dấu chấm, cho phép
        setGrades((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [field]: value,
          },
        }))
        return
      }
      
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue) || numValue < 0 || numValue > currentMaxScore) {
        // Don't update if invalid score
        return
      }
    }
    
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

  const resetGradeInputs = () => {
    // Reset grade inputs và saved state, giữ nguyên class/exam type/session selections
    setGrades({})
    setSavedGrades(new Set())
    setExamTitle("")
  }

  const saveIndividualGrade = async (studentId: string) => {
    const grade = grades[studentId]
    if (!grade?.score) return
    
    // Validate required fields
    if (!selectedExamType || !examTitle || !selectedSession) {
      alert('Vui lòng điền đầy đủ thông tin bài kiểm tra (Loại kiểm tra, Tên bài kiểm tra, Buổi học)')
      return
    }
    
    try {
      setLoading(true)
      
      // Parse selectedExamType to get name and maxScore
      const examTypeData = JSON.parse(selectedExamType)
      
      // Create payload for single student
      const payload = {
        classId: selectedClass,
        assessmentName: examTitle,
        assessmentType: examTypeData.name,
        maxScore: examTypeData.maxScore,
        classSessionId: selectedSession,
        grades: [{
          studentId: studentId,
          score: Number.parseFloat(grade.score),
          feedback: grade.comment
        }]
      }
            
      // Call API to save grade
      await teacherPointService.recordGrades(payload)
      
      setSavedGrades((prev) => new Set([...prev, studentId]))
    } catch (error) {
      alert('Có lỗi khi lưu điểm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const saveAllGrades = async () => {
    // Validate required fields first
    if (!selectedExamType || !examTitle || !selectedSession) {
      alert('Vui lòng điền đầy đủ thông tin bài kiểm tra (Loại kiểm tra, Tên bài kiểm tra, Buổi học)')
      return
    }
    
    // Validate all scores before sending
    const invalidScores = Object.keys(grades).filter(sid => {
      const score = grades[sid]?.score
      if (!score) return false
      const numScore = Number.parseFloat(score)
      return isNaN(numScore) || numScore < 0 || numScore > currentMaxScore
    })
    
    if (invalidScores.length > 0) {
      alert(`Một số điểm số không hợp lệ. Vui lòng kiểm tra lại (điểm từ 0-${currentMaxScore})`)
      return
    }
    
    const payload: any = Object.keys(grades).map((sid) => ({
      studentId: sid,
      score: grades[sid]?.score ? Number.parseFloat(grades[sid].score) : undefined,
      feedback: grades[sid]?.comment,
    }))
    try {
      setLoading(true)
      // Parse selectedExamType to get name and maxScore
      const examTypeData = JSON.parse(selectedExamType)
      
      await teacherPointService.recordGrades({
        classId: selectedClass,
        assessmentName: examTitle || examTypeData.name,
        assessmentType: examTypeData.name,
        maxScore: examTypeData.maxScore,
        classSessionId: selectedSession,
        grades: payload,
      })
      // Sau khi lưu tất cả điểm, reset inputs nhưng giữ nguyên selections
      resetGradeInputs()
      alert('Đã lưu điểm thành công!')
    } catch (e) {
      console.error('Save grades error', e)
      alert('Có lỗi khi lưu điểm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const getGradeClassification = (score: string) => {
    const numScore = Number.parseFloat(score)
    if (isNaN(numScore)) {
      return { label: "Chưa đạt", color: "bg-red-100 text-red-800" }
    }
    
    // Hỗ trợ cả bài có maxScore != 10 bằng cách quy đổi về thang 10
    const normalized = currentMaxScore === 10 ? numScore : Number(((numScore / currentMaxScore) * 10).toFixed(2))
    
    // Xếp loại: Tốt >= 8, Khá >= 6.5, Đạt >= 5, còn lại Chưa đạt
    if (normalized >= 8) return { label: "Tốt", color: "bg-green-100 text-green-800" }
    if (normalized >= 6.5) return { label: "Khá", color: "bg-blue-100 text-blue-800" }
    if (normalized >= 5) return { label: "Đạt", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Chưa đạt", color: "bg-red-100 text-red-800" }
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
          {(!selectedExamType || !examTitle || !selectedSession) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Vui lòng điền đầy đủ thông tin bài kiểm tra để có thể lưu điểm</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-select">Lớp học <span className="text-red-500">*</span></Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="no-class" disabled>
                      Không có lớp nào
                    </SelectItem>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject?.name || ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-type">Loại kiểm tra <span className="text-red-500">*</span></Label>
              <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại kiểm tra" />
                </SelectTrigger>
                <SelectContent>
                  {examTypesConfig.length === 0 ? (
                    <SelectItem value="no-type" disabled>
                      Không có loại kiểm tra
                    </SelectItem>
                  ) : (
                    examTypesConfig.map((config: any, index: number) => {
                      const uniqueKey = JSON.stringify({ name: config.name, maxScore: config.maxScore })
                      return (
                        <SelectItem key={index} value={uniqueKey}>
                          {config.name} (Điểm tối đa: {config.maxScore})
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-title">Tên bài kiểm tra <span className="text-red-500">*</span></Label>
              <Input
                id="exam-title"
                placeholder="VD: Kiểm tra chương 1 - Hàm số"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-select">Buổi học <span className="text-red-500">*</span></Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn buổi học đã kết thúc" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.length === 0 ? (
                    <SelectItem value="no-session" disabled>
                      Không có buổi học nào đã kết thúc
                    </SelectItem>
                  ) : (
                    sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.displayText}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Input */}
      {selectedClass && students.length > 0 && (
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
                  {classes.find((c) => c.id === selectedClass)?.name}
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
              const grade = grades[student.studentId]
              const isSaved = savedGrades.has(student.studentId)
              const classification = grade?.score ? getGradeClassification(grade.score) : null

              return (
                <div key={student.studentId} className="border rounded-lg p-4 space-y-4 relative">
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
                      <AvatarImage src={"/diverse-avatars.png"} />
                      <AvatarFallback>
                        {student.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{student.fullName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {student.studentCode}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Điểm TB hiện tại: <span className="font-medium">{student.currentGrade ?? '—'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`score-${student.studentId}`}>Điểm số (0-{currentMaxScore})</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`score-${student.studentId}`}
                          type="number"
                          min="0"
                          max={currentMaxScore}
                          step="0.1"
                          placeholder={`Nhập điểm (0-${currentMaxScore})`}
                          value={grade?.score || ""}
                          onChange={(e) => handleGradeChange(student.studentId, "score", e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveIndividualGrade(student.studentId)}
                          disabled={!grade?.score || isSaved}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                      {classification && <Badge className={classification.color}>{classification.label}</Badge>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`comment-${student.studentId}`}>Nhận xét</Label>
                      <Textarea
                        id={`comment-${student.studentId}`}
                        placeholder="Nhận xét về bài làm của học sinh..."
                        value={grade?.comment || ""}
                        onChange={(e) => handleGradeChange(student.studentId, "comment", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">{Object.keys(grades).filter((id) => grades[id]?.score).length} / {filteredStudents.length} học sinh đã có điểm</div>
              <Button
                onClick={saveAllGrades}
                disabled={!selectedExamType || !examTitle || !selectedSession || Object.keys(grades).length === 0}
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
                Vui lòng chọn lớp học để nhập điểm cho học sinh
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
