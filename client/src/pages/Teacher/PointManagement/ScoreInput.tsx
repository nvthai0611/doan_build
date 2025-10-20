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
import { apiClient } from "../../../utils/clientAxios"
// classes sẽ fetch từ API teacher/class-management/classes

// students sẽ fetch theo classId

export default function GradeInputPage() {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<TeacherClassItem[]>([])
  const [students, setStudents] = useState<TeacherStudentSummary[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState("")
  const [selectedExamType, setSelectedExamType] = useState("")
  const [examTypes, setExamTypes] = useState<string[]>([])
  const [examDate, setExamDate] = useState("")
  const [examTitle, setExamTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [grades, setGrades] = useState<Record<string, { score: string; comment: string }>>({})
  const [savedGrades, setSavedGrades] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        console.log('🔍 Starting to fetch classes...')

        const response = await teacherClassService.getClasses()
        console.log('📦 Classes response:', response)

        // Debug: Kiểm tra cấu trúc data
        console.log('🔍 Response type:', typeof response)
        console.log('🔍 Response is array:', Array.isArray(response))
        console.log('🔍 Response length:', (response as any)?.length)
        if (response && (response as any).length > 0) {
          console.log('🔍 First item structure:', (response as any)[0])
        }

        const items = ((response as any) || []).map((c: any) => {
          console.log('🔍 Mapping class item:', c)
          return {
            id: c.id,
            name: c.name,
            subject: { name: c.subject?.name || 'N/A' },
            studentCount: c.studentCount || 0
          }
        }) as TeacherClassItem[]
        console.log('📋 Mapped classes:', items)
        setClasses(items)
      } catch (e: any) {
        console.error('❌ Fetch classes error', e)
        console.error('❌ Error details:', {
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
        console.log('🎓 No class selected, clearing students')
        setStudents([])
        setSelectedAssignment("")
        return
      }

      console.log('🎓 Selected class:', selectedClass)

      try {
        setLoading(true)
        console.log('🎓 Calling API /teacher/common/class/${selectedClass}/students')

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
          console.log('🎓 Found', studentsArray.length, 'students')
          // Sử dụng helper method từ service để transform data
          const studentsData = teacherCommonService.processStudentsData(studentsArray)
          setStudents(studentsData)
        } else {
          console.log('⚠️ No students found')
          setStudents([])
        }

        setGrades({})
        setSavedGrades(new Set())
      } catch (e: any) {
        console.error('❌ Fetch students error', e)
        console.error('❌ Error details:', {
          status: e?.status,
          message: e?.message,
          response: e?.response,
          stack: e?.stack
        })
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [selectedClass, classes])

  // Khi chọn lớp: cũng lấy danh sách loại kiểm tra để hiển thị trong dropdown
  useEffect(() => {
    const run = async () => {
      if (!selectedClass) return
      try {
        const types = await teacherPointService.getAssessmentTypes(selectedClass)
        console.log('Assessment types response:', types)
        console.log('Assessment types data:', (types as any).data)

        // Backend trả về trực tiếp array, không cần .data
        const apiTypes = types || []
        console.log('API types:', apiTypes)

        // Nếu không có loại kiểm tra nào, thêm một số loại mặc định
        const defaultTypes = ['Kiểm tra 15 phút', 'Kiểm tra 45 phút', 'Kiểm tra 60 phút', 'Bài tập 90 phút']
        const finalTypes = apiTypes && apiTypes.length > 0 ? apiTypes : defaultTypes
        console.log('Final types to set:', finalTypes)
        setExamTypes(finalTypes)
      } catch (e) {
        console.error('Fetch assessment types error', e)
        // Nếu có lỗi, dùng loại mặc định
        const defaultTypes = ['Kiểm tra 15 phút', 'Kiểm tra 45 phút', 'Kiểm tra 60 phút', 'Bài tập 90 phút']
        setExamTypes(defaultTypes)
      }
    }
    run()
  }, [selectedClass])

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        (student.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [students, searchTerm])

  const handleGradeChange = (studentId: string, field: "score" | "comment", value: string) => {
    // Validate score input
    if (field === "score" && value !== "") {
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue) || numValue < 0 || numValue > 10) {
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

  const handleExamDateChange = (value: string) => {
    const today = new Date()
    const selectedDate = new Date(value)
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      alert('Ngày kiểm tra không được lớn hơn ngày hôm nay')
      return
    }
    
    setExamDate(value)
  }

  const saveIndividualGrade = async (studentId: string) => {
    const grade = grades[studentId]
    if (!grade?.score) return
    
    // Validate required fields
    if (!selectedExamType || !examTitle || !examDate) {
      alert('Vui lòng điền đầy đủ thông tin bài kiểm tra (Loại kiểm tra, Tên bài kiểm tra, Ngày kiểm tra)')
      return
    }
    
    // Validate exam date
    const today = new Date()
    const selectedDate = new Date(examDate)
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      alert('Ngày kiểm tra không được lớn hơn ngày hôm nay')
      return
    }
    
    try {
      setLoading(true)
      console.log('🎯 Saving individual grade for student:', studentId)
      
      // Create payload for single student
      const payload = {
        classId: selectedClass,
        assessmentName: examTitle,
        assessmentType: selectedExamType,
        maxScore: 10,
        date: examDate,
        grades: [{
          studentId: studentId,
          score: Number.parseFloat(grade.score),
          feedback: grade.comment
        }]
      }
      
      console.log('🎯 Individual grade payload:', payload)
      
      // Call API to save grade
      await teacherPointService.recordGrades(payload)
      
      console.log('✅ Individual grade saved successfully')
      setSavedGrades((prev) => new Set([...prev, studentId]))
    } catch (error) {
      console.error('❌ Error saving individual grade:', error)
      alert('Có lỗi khi lưu điểm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const saveAllGrades = async () => {
    // Validate required fields first
    if (!selectedExamType || !examTitle || !examDate) {
      alert('Vui lòng điền đầy đủ thông tin bài kiểm tra (Loại kiểm tra, Tên bài kiểm tra, Ngày kiểm tra)')
      return
    }
    
    // Validate exam date
    const today = new Date()
    const selectedDate = new Date(examDate)
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      alert('Ngày kiểm tra không được lớn hơn ngày hôm nay')
      return
    }
    
    // Validate all scores before sending
    const invalidScores = Object.keys(grades).filter(sid => {
      const score = grades[sid]?.score
      if (!score) return false
      const numScore = Number.parseFloat(score)
      return isNaN(numScore) || numScore < 0 || numScore > 10
    })
    
    if (invalidScores.length > 0) {
      alert('Một số điểm số không hợp lệ. Vui lòng kiểm tra lại (điểm từ 0-10)')
      return
    }
    
    const payload: any = Object.keys(grades).map((sid) => ({
      studentId: sid,
      score: grades[sid]?.score ? Number.parseFloat(grades[sid].score) : undefined,
      feedback: grades[sid]?.comment,
    }))
    try {
      setLoading(true)
      await teacherPointService.recordGrades({
        classId: selectedClass,
        assessmentName: examTitle || `${selectedExamType} - ${examDate}`,
        assessmentType: selectedExamType,
        maxScore: 10, // Fixed max score = 10
        date: examDate,
        grades: payload,
      })
      const saved = Object.keys(grades).filter((sid) => !!grades[sid]?.score)
      setSavedGrades(new Set(saved))
    } catch (e) {
      console.error('Save grades error', e)
      alert('Có lỗi khi lưu điểm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
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
          {(!selectedExamType || !examTitle || !examDate) && (
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
                        {cls.name} - {cls.subject?.name || ''} ({cls.studentCount || 0} HS)
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
                  {examTypes.length === 0 ? (
                    <SelectItem value="no-type" disabled>
                      Không có loại kiểm tra
                    </SelectItem>
                  ) : (
                    examTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))
                  )}
                  {/* Cho phép thêm loại mới bằng cách gõ ở input tên bài kiểm tra hoặc có thể nâng cấp thêm input riêng */}
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
              <Label htmlFor="exam-date">Ngày kiểm tra <span className="text-red-500">*</span></Label>
              <Input 
                type="date" 
                id="exam-date" 
                value={examDate} 
                onChange={(e) => handleExamDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Set max date to today
              />
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
                      <Label htmlFor={`score-${student.studentId}`}>Điểm số (0-10)</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`score-${student.studentId}`}
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="Nhập điểm (0-10)"
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
                disabled={!selectedExamType || !examTitle || !examDate || Object.keys(grades).length === 0}
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
