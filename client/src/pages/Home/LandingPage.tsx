import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { publicClassesService, RecruitingClass } from '../../services/common/public-classes.service';
import { useAuth } from '../../lib/auth';
import { formatScheduleArray } from '../../utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  User,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch recruiting classes
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['recruiting-classes', currentPage, selectedSubject, selectedGrade],
    queryFn: () => publicClassesService.getRecruitingClasses({
      page: currentPage,
      limit: 12,
      subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      gradeId: selectedGrade !== 'all' ? selectedGrade : undefined,
    }),
  });

  // Fetch subjects for filter
  const { data: subjectsData } = useQuery({
    queryKey: ['public-subjects'],
    queryFn: () => publicClassesService.getSubjects(),
  });

  // Fetch grades for filter
  const { data: gradesData } = useQuery({
    queryKey: ['public-grades'],
    queryFn: () => publicClassesService.getGrades(),
  });

  const classes = classesData?.data || [];
  const subjects = subjectsData?.data || [];
  const grades = gradesData?.data || [];
  const meta = classesData?.meta;


  // Filter by search term
  const filteredClasses = classes.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <GraduationCap className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Trung Tâm Giáo Dục
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nơi khơi nguồn tri thức, nuôi dưỡng tương lai. Tìm kiếm lớp học phù hợp cho con bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/auth/register/family">
                Đăng ký ngay
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link to="/auth">
                Đăng nhập
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
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
                  className="pl-10"
                />
              </div>

              {/* Subject Filter */}
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[200px]">
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
              {(selectedSubject !== 'all' || selectedGrade !== 'all' || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedGrade('all');
                    setSearchTerm('');
                  }}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    onClick={() => setCurrentPage(p => p - 1)}
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
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Đăng ký tài khoản ngay hôm nay để tham gia các lớp học chất lượng
          </p>
          <Button size="lg" asChild>
            <Link to="/auth/register/family">
              Đăng ký miễn phí
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

// Class Card Component
const ClassCard = ({ 
  classItem, 
  isAuthenticated 
}: { 
  classItem: RecruitingClass; 
  isAuthenticated: boolean;
}) => {
  const navigate = useNavigate();
  const schedules = formatScheduleArray(classItem.recurringSchedule);
  const availableSlots = (classItem.maxStudents || 0) - classItem.currentStudents;
  const isFull = availableSlots <= 0;

  const handleJoinClick = () => {
    // Lưu classId vào sessionStorage để tự động mở sheet
    sessionStorage.setItem('pendingClassJoin', classItem.id);
    if (isAuthenticated) {
      // Đã login → Đến trang recruiting classes (parent có thể join)
      navigate('/parent/recruiting-classes');
    } else {
      // Chưa login → Lưu redirect path và chuyển đến login
      sessionStorage.setItem('redirectAfterLogin', '/parent/recruiting-classes');
      navigate('/auth/login/family');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-2">{classItem.name}</CardTitle>
          <Badge variant={classItem.status === 'ready' ? 'default' : 'secondary'} className="ml-2 shrink-0">
            {classItem.status === 'ready' ? 'Đang tuyển sinh' : 'Đang diễn ra'}
          </Badge>
        </div>
        {classItem.classCode && (
          <p className="text-sm text-muted-foreground">Mã: {classItem.classCode}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Subject & Grade */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{classItem.subject?.name || 'Chưa có môn'}</span>
            </div>
            {classItem.grade && (
              <Badge variant="outline" className="text-xs">
                {classItem.grade.name}
              </Badge>
            )}
          </div>

          {/* Teacher */}
          {classItem.teacher && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{classItem.teacher.fullName}</span>
            </div>
          )}

          {/* Students */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>
              {classItem.currentStudents}/{classItem.maxStudents || '∞'} học sinh
            </span>
            {isFull && <Badge variant="destructive" className="text-xs ml-auto">Đã đầy</Badge>}
            {!isFull && availableSlots <= 5 && (
              <Badge variant="secondary" className="text-xs ml-auto">
                Còn {availableSlots} chỗ
              </Badge>
            )}
          </div>

          {/* Schedule */}
          {schedules.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {schedules.map((s, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {s.day}: {s.time}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Expected Start Date */}
          {classItem.expectedStartDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                Dự kiến bắt đầu:{' '}
                {new Date(classItem.expectedStartDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleJoinClick}
          disabled={isFull}
          className="w-full mt-4"
        >
          {isFull ? 'Đã đầy' : 'Đăng ký học'}
          {!isFull && <ChevronRight className="ml-2 w-4 h-4" />}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LandingPage;

