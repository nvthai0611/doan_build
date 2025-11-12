"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { publicClassesService, type RecruitingClass } from "../../services/common/public-classes.service"
import { publicShowcasesService, type Showcase } from "../../services/common/public-showcases.service"
import { publicTeacherService } from "../../services/common/public-teacher.service"
import { useAuth } from "../../lib/auth"
import { formatScheduleArray } from "../../utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  User,
  ChevronRight,
  Search,
  Filter,
  Star,
  Award,
  Newspaper,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "./components/header"
import { Footer } from "./components/footer"
import { HeroBanner } from "./components/hero-banner"
import { BlogSection } from "./components/blog-section"
// import { ContributeSection } from "./components/contribute-section"
import "./styles/landing-page.css"


const news = [
  {
    id: 1,
    title: "Kỹ năng học tập hiệu quả cho học sinh cấp 2",
    category: "Kỹ năng học",
    date: "2024-01-15",
    icon: "📚",
  },
  {
    id: 2,
    title: "Cách chuẩn bị tốt nhất cho kỳ thi THPT Quốc gia",
    category: "Ôn thi",
    date: "2024-01-14",
    icon: "✏️",
  },
  {
    id: 3,
    title: "Phương pháp học Toán hiệu quả từ cơ bản đến nâng cao",
    category: "Toán học",
    date: "2024-01-13",
    icon: "🔢",
  },
  {
    id: 4,
    title: "Bí quyết học Tiếng Anh nhanh chóng và hiệu quả",
    category: "Ngoại ngữ",
    date: "2024-01-12",
    icon: "🌍",
  },
  {
    id: 5,
    title: "Quản lý thời gian học tập cho học sinh bận rộn",
    category: "Quản lý",
    date: "2024-01-11",
    icon: "⏰",
  },
  { id: 6, title: "Những sai lầm phổ biến khi học Hóa học", category: "Hóa học", date: "2024-01-10", icon: "⚗️" },
]

// Legacy showcases data (nếu cần giữ lại section này)
const legacyShowcases = [
  { id: 1, title: "Học sinh đạt điểm 10 Toán THPT QG 2023", category: "Thành tích", icon: "🏆" },
  { id: 2, title: "Lớp học Tiếng Anh đạt IELTS 8.0+", category: "Thành tích", icon: "🎯" },
  { id: 3, title: "Dự án khoa học của học sinh được công nhận", category: "Dự án", icon: "🔬" },
  { id: 4, title: "Học sinh giỏi Quốc gia từ trung tâm", category: "Vinh danh", icon: "⭐" },
]

export const LandingPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch recruiting classes
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["recruiting-classes", currentPage, selectedSubject, selectedGrade, selectedTeacherId],
    queryFn: () =>
      publicClassesService.getRecruitingClasses({
        page: currentPage,
        limit: 12,
        subjectId: selectedSubject !== "all" ? selectedSubject : undefined,
        gradeId: selectedGrade !== "all" ? selectedGrade : undefined,
        teacherId: selectedTeacherId !== "all" ? selectedTeacherId : undefined,
      }),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Fetch subjects for filter
  const { data: subjectsData } = useQuery({
    queryKey: ["public-subjects"],
    queryFn: () => publicClassesService.getSubjects(),
  })

  // Fetch grades for filter
  const { data: gradesData } = useQuery({
    queryKey: ["public-grades"],
    queryFn: () => publicClassesService.getGrades(),
  })

  // Fetch showcases
  const { data: showcasesData, isLoading: isLoadingShowcases } = useQuery({
    queryKey: ["public-showcases"],
    queryFn: () => publicShowcasesService.getShowcases(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  // Fetch teachers
  const { data: teachersData } = useQuery({
    queryKey: ["public-teachers"],
    queryFn: () => publicTeacherService.getTeachers(),
  })

  const classes = classesData?.data || []
  const subjects = subjectsData?.data || []
  const grades = gradesData?.data || []
  const meta = classesData?.meta
  const showcases = showcasesData?.data || []
  const teachers = teachersData?.data || []

  // Filter by search term
  const filteredClasses = classes.filter(
    (c: any) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Map subjectId -> subjectName để hiển thị
  const subjectNameById = useMemo(() => {
    try {
      return new Map<string, string>(subjects.map((s: any) => [s.id, s.name]))
    } catch {
      return new Map<string, string>()
    }
  }, [subjects])

  const getInitials = (fullName?: string) =>
    (fullName || 'GV')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((p) => p[0]?.toUpperCase())
      .join('')

  const displaySubject = (t: any) => {
    if (t?.subject && typeof t.subject === 'string') return subjectNameById.get(t.subject) || t.subject
    if (Array.isArray(t?.subjects)) {
      if (t.subjects.length === 1) return subjectNameById.get(t.subjects[0]) || t.subjects[0]
      if (t.subjects.length > 1) return 'Đa môn'
    }
    return 'Giáo viên'
  }


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner />
      {/* Classes Section */}
      <section
        id="classes"
        className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg-soft"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="section-badge">
              <BookOpen className="w-4 h-4 gradient-text" />
              <span className="text-sm font-medium gradient-text">
                Danh Sách Lớp Học
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Lớp Học Đang Tuyển Sinh
            </h2>
            <p className="text-muted-foreground text-lg">
              Khám phá các lớp học chất lượng với giáo viên giàu kinh nghiệm
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-border input-focus"
                />
              </div>

              {/* Teacher Filter */}
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger className="w-full md:w-[200px] border-2 border-border select-focus">
                  <SelectValue placeholder="Giáo viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả giáo viên</SelectItem>
                  {teachers.map((teacher: any) => (
                    teacher.classesStatus.toString().includes('active') && (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>

              {/* Subject Filter */}
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-full md:w-[200px] border-2 border-border select-focus">
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn học</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full md:w-[200px] border-2 border-border select-focus">
                  <SelectValue placeholder="Khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khối</SelectItem>
                  {grades.map((grade: any) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(selectedSubject !== 'all' ||
                selectedGrade !== 'all' ||
                selectedTeacherId !== 'all' ||
                searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedGrade('all');
                    setSelectedTeacherId('all');
                    setSearchTerm('');
                  }}
                  className="border-2 filter-btn-hover"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoadingClasses && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 spinner-gradient"></div>
            </div>
          )}

          {/* No Results */}
          {!isLoadingClasses && filteredClasses.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Không tìm thấy lớp học
              </h3>
              <p className="text-muted-foreground">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
          )}

          {/* Classes Grid */}
          {!isLoadingClasses && filteredClasses.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredClasses.map((classItem: any) => (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Trang trước
                  </Button>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm text-muted-foreground">
                      Trang {meta.page} / {meta.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === meta.totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg-soft">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="section-badge">
              <Star className="w-4 h-4 gradient-text" />
              <span className="text-sm font-medium gradient-text">
                Học Sinh Tiêu Biểu
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Học Sinh Tiêu Biểu & Xuất Sắc
            </h2>
            <p className="text-muted-foreground">
              Hành trình thành công của những học sinh tại trung tâm
            </p>
          </div>

          <StudentShowcaseSection
            data={showcases}
            isLoading={isLoadingShowcases}
          />
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-header">
            <div className="section-badge">
              <Users className="w-4 h-4 gradient-text" />
              <span className="text-sm font-medium gradient-text">
                Đội Ngũ Giáo Viên
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Giáo Viên Giàu Kinh Nghiệm
            </h2>
            <p className="text-muted-foreground text-lg">
              Đội ngũ giáo viên tài năng, tận tâm với học sinh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers
              .filter((t: any) => Array.isArray(t?.assignedClasses) && t.assignedClasses.length > 0)
              .slice()
              .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0) || (b.students || 0) - (a.students || 0))
              .map((t: any) => {
                const name = t?.name || 'Giáo viên'
                const subjectIds: string[] = Array.isArray((t as any).subjects) ? (t as any).subjects : []
                const allSubjectNames = subjectIds.map((id) => subjectNameById.get(id) || id).filter(Boolean)
                const subjectShort = allSubjectNames.length > 0
                  ? `${allSubjectNames.join(', ')}${allSubjectNames.length > 2 ? `` : ''}`
                  : displaySubject(t)
                const displayExp = typeof t?.experience === 'number' && t.experience >= 1 ? `${t.experience} năm` : undefined
                const students = typeof t?.students === 'number' && t.students > 0 ? `${t.students}+` : '—'
                const rating = typeof t?.rating === 'number' && t.rating > 0 ? t.rating.toFixed(1) : ''
                const isFeatured = (t?.rating || 0) >= 4.5 || (t?.students || 0) >= 100
                const activeNames: string[] = Array.isArray(t?.assignedClasses)
                  ? t.assignedClasses.filter((c: any) => c?.status === 'active' || c?.status === 'ready').map((c: any) => c?.className).filter(Boolean)
                  : []
                const activeNamesLabel = activeNames.length > 0
                  ? `${activeNames.join(', ')}${activeNames.length > 2 ? `` : ''}`
                  : ''

                return (
                  <div key={t.id} className="teacher-card">
                    <div className="teacher-avatar relative overflow-hidden">
                      {t?.avatar ? (
                        <img src={t.avatar} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-foreground">
                          {getInitials(name)}
                        </div>
                      )}
                      {isFeatured && (
                        <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-semibold text-black shadow">
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1" title={allSubjectNames.join(', ')}>
                        {subjectShort}
                      </p>
                      <div className="space-y-2 text-sm mb-4">
                        {displayExp && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kinh nghiệm:</span>
                            <span className="font-semibold">{displayExp}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Học sinh:</span>
                          <span className="font-semibold">{students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đánh giá:</span>
                          <span className="font-semibold text-orange-500">{rating ? `⭐ ${rating}` : 'Chưa có'}</span>
                        </div>
                        {activeNamesLabel && (
                          <div className="line-clamp-1 tooltip" title={activeNamesLabel}>
                            <span className="text-muted-foreground">Đang dạy:</span>{' '}
                            <span className="font-semibold">{activeNamesLabel}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        className="w-full btn-gradient text-sm"
                        onClick={() => document.getElementById('classes')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Xem lớp đang tuyển
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="section-header">
            <div className="section-badge">
              <Award className="w-4 h-4 gradient-text" />
              <span className="text-sm font-medium gradient-text">
                Vinh Danh & Thành Tích
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Những Thành Tích Nổi Bật
            </h2>
            <p className="text-muted-foreground text-lg">
              Những dự án, thành tích và vinh danh của học sinh và giáo viên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {legacyShowcases.map((item) => (
              <div key={item.id} className="showcase-item">
                <div className="showcase-image">{item.icon}</div>
                <div className="p-4">
                  <Badge className="mb-3 badge-gradient text-xs">
                    {item.category}
                  </Badge>
                  <h3 className="font-bold text-sm line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg-soft">
        <div className="max-w-7xl mx-auto">
          <div className="section-header">
            <div className="section-badge">
              <Newspaper className="w-4 h-4 gradient-text" />
              <span className="text-sm font-medium gradient-text">Tin Tức & Kiến Thức</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Tin Tức Học Tập & Kiến Thức Cấp 2</h2>
            <p className="text-muted-foreground text-lg">
              Cập nhật những bài viết hữu ích về học tập, ôn thi và phát triển kỹ năng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div key={item.id} className="news-card">
                <div className="news-image">{item.icon}</div>
                <div className="p-4">
                  <Badge
                    variant="outline"
                    className="mb-3 text-xs bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-200"
                  >
                    {item.category}
                  </Badge>
                  <h3 className="font-bold text-sm mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Blog Section */}
      <BlogSection />

      {/* Contribute Section */}
      {/* <ContributeSection /> */}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg-soft-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-white">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-white">
            Đăng ký tài khoản ngay hôm nay để tham gia các lớp học chất lượng
          </p>
          <Button size="lg" asChild className="btn-gradient">
            <Link to="/auth/register/family">
              Đăng ký miễn phí
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Class Card Component
const ClassCard = ({
  classItem,
  isAuthenticated,
}: {
  classItem: RecruitingClass
  isAuthenticated: boolean
}) => {
  const navigate = useNavigate()
  const schedules = formatScheduleArray(classItem.recurringSchedule)
  const availableSlots = (classItem.maxStudents || 0) - classItem.currentStudents
  const isFull = availableSlots <= 0

  const handleJoinClick = () => {
    sessionStorage.setItem("pendingClassJoin", classItem.id)
    if (isAuthenticated) {
      navigate("/parent/recruiting-classes")
    } else {
      sessionStorage.setItem("redirectAfterLogin", "/parent/recruiting-classes")
      navigate("/auth/")
    }
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 flex flex-col border-l-gradient-orange hover:border-l-gradient-purple card-hover">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-2">{classItem.name}</CardTitle>
          <Badge
            variant={classItem.status === "ready" ? "default" : "secondary"}
            className="ml-2 shrink-0 badge-gradient"
          >
            {classItem.status === "ready" ? "Đang tuyển sinh" : "Đang diễn ra"}
          </Badge>
        </div>
        {classItem.classCode && <p className="text-sm text-muted-foreground">Mã: {classItem.classCode}</p>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Subject & Grade */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>{classItem.subject?.name || "Chưa có môn"}</span>
            </div>
            {classItem.grade && (
              <Badge
                variant="outline"
                className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200"
              >
                {classItem.grade.name}
              </Badge>
            )}
          </div>

          {/* Teacher */}
          {classItem.teacher && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-pink-500" />
              <span className="truncate">{classItem.teacher.fullName}</span>
            </div>
          )}

          {/* Students */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-500" />
            <span>
              {classItem.currentStudents}/{classItem.maxStudents || "∞"} học sinh
            </span>
            {isFull && (
              <Badge variant="destructive" className="text-xs ml-auto">
                Đã đầy
              </Badge>
            )}
            {!isFull && availableSlots <= 5 && (
              <Badge
                variant="secondary"
                className="text-xs ml-auto bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-600 border-orange-200"
              >
                Còn {availableSlots} chỗ
              </Badge>
            )}
          </div>

          {/* Schedule */}
          {schedules.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {schedules.map((s, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200"
                  >
                    {s.day}: {s.time}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Expected Start Date */}
          {classItem.expectedStartDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>Dự kiến bắt đầu: {new Date(classItem.expectedStartDate).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button onClick={handleJoinClick} disabled={isFull} className="w-full mt-4 btn-gradient">
          {isFull ? "Đã đầy" : "Đăng ký học"}
          {!isFull && <ChevronRight className="ml-2 w-4 h-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}

// Student Showcase Section (cards + filter chips)
const StudentShowcaseSection = ({ data, isLoading }: { data: Showcase[]; isLoading?: boolean }) => {
  const [filter, setFilter] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "hoa-hoc", label: "Hóa học" },
    { key: "sinh-hoc", label: "Sinh học" },
    { key: "tieng-anh", label: "Tiếng Anh" },
    { key: "toan", label: "Toán" },
    { key: "vat-ly", label: "Vật lý" },
  ]

  const matchByFilter = (item: Showcase) => {
    if (filter === "all") return true
    const source = `${item.title} ${item.achievement}`.toLowerCase()
    switch (filter) {
      case "hoa-hoc":
        return source.includes("hóa") || source.includes("hoa hoc")
      case "sinh-hoc":
        return source.includes("sinh")
      case "tieng-anh":
        return source.includes("anh") || source.includes("ielts")
      case "toan":
        return source.includes("toán") || source.includes("toan")
      case "vat-ly":
        return source.includes("vật lý") || source.includes("vat ly")
      default:
        return true
    }
  }

  const filtered = data.filter(matchByFilter)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 spinner-gradient"></div>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              className={filter === f.key ? 'btn-gradient' : 'border-2'}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Chưa có học sinh tiêu biểu
        </h3>
        <p className="text-muted-foreground">
          Hãy quay lại sau để xem các thành tích nổi bật
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            className={filter === f.key ? "btn-gradient" : "border-2"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all card-hover">
            <div className="relative h-44 w-full overflow-hidden">
              <img src={item.studentImage} alt={item.title} className="h-full w-full object-cover" />
              {item.featured && (
                <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-semibold text-black shadow">
                  Nổi bật
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-base mb-1 line-clamp-1">{item.title}</h3>
              <div className="text-xs text-muted-foreground mb-3">Thành tích: {item.achievement}</div>
              {item.description && expandedId === item.id && (
                <div className="text-sm text-muted-foreground mb-3">"{item.description}"</div>
              )}
              {item.description && (
                <Button
                  variant="outline"
                  className={`h-8 px-3 text-sm border-2 filter-btn-hover ${expandedId === item.id ? "btn-gradient text-white border-transparent" : ""}`}
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  {expandedId === item.id ? (
                    <span className="flex items-center">Thu gọn hành trình <ChevronRight className="ml-1 h-4 w-4 rotate-90" /></span>
                  ) : (
                    <span className="flex items-center">Nhấp để xem hành trình <ChevronRight className="ml-1 h-4 w-4" /></span>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LandingPageComponent = LandingPage
export default LandingPageComponent
