import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicClassesService, RecruitingClass } from '../../../../services/common/public-classes.service';
import { formatScheduleArray } from '../../../../utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  BookOpen, 
  User,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JoinClassSheet } from '../ChildClass/components/JoinClassSheet';
import { RequestJoinClassSheet } from '../ChildClass/components/RequestJoinClassSheet';
import { ClassStatus, CLASS_STATUS_LABELS, CLASS_STATUS_BADGE_COLORS, COMMON_FILTER_VALUES, COMMON_PAGINATION } from '../../../../lib/constants';

export const RecruitingClasses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(COMMON_FILTER_VALUES.ALL);
  const [selectedGrade, setSelectedGrade] = useState<string>(COMMON_FILTER_VALUES.ALL);
  const [currentPage, setCurrentPage] = useState(COMMON_PAGINATION.DEFAULT_PAGE);
  const [isJoinSheetOpen, setIsJoinSheetOpen] = useState(false);
  const [selectedClassForJoin, setSelectedClassForJoin] = useState<RecruitingClass | null>(null);
  const [isPendingClassChecked, setIsPendingClassChecked] = useState(false);

  // Fetch recruiting classes
  const { data: classesData, isLoading: isLoadingClasses, refetch } = useQuery({
    queryKey: ['recruiting-classes', currentPage, selectedSubject, selectedGrade],
    queryFn: () => publicClassesService.getRecruitingClasses({
      page: currentPage,
      limit: 12,
      subjectId: selectedSubject !== COMMON_FILTER_VALUES.ALL ? selectedSubject : undefined,
      gradeId: selectedGrade !== COMMON_FILTER_VALUES.ALL ? selectedGrade : undefined,
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

  useEffect(() => {
    if (!isPendingClassChecked && classes.length > 0) {
      const pendingClassId = sessionStorage.getItem('pendingClassJoin');
      if (pendingClassId) {
        // Find the class in the current list
        const pendingClass = classes.find((c: RecruitingClass) => c.id === pendingClassId);
        if (pendingClass) {
          // Auto-open the sheet with this class
          setSelectedClassForJoin(pendingClass);
          setIsJoinSheetOpen(true);
          sessionStorage.removeItem('pendingClassJoin');
        }
      }
      
      setIsPendingClassChecked(true);
    }
  }, [classes, isPendingClassChecked]);

  const handleJoinClassClick = (classItem: RecruitingClass) => {
    setSelectedClassForJoin(classItem);
    setIsJoinSheetOpen(true);
  };

  const handleRequestSheetClose = () => {
    setIsJoinSheetOpen(false);
    setSelectedClassForJoin(null);
    refetch(); // Refresh danh sách sau khi đăng ký
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Lớp Đang Tuyển Sinh</h1>
        </div>
        <p className="text-muted-foreground">
          Khám phá và đăng ký các lớp học mới cho con bạn
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
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
              <SelectItem value={COMMON_FILTER_VALUES.ALL}>Tất cả môn học</SelectItem>
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
              <SelectItem value={COMMON_FILTER_VALUES.ALL}>Tất cả khối</SelectItem>
              {grades.map((grade: any) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {(selectedSubject !== COMMON_FILTER_VALUES.ALL || selectedGrade !== COMMON_FILTER_VALUES.ALL || searchTerm) && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSubject(COMMON_FILTER_VALUES.ALL);
                setSelectedGrade(COMMON_FILTER_VALUES.ALL);
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
                onJoinClick={() => handleJoinClassClick(classItem)}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > COMMON_PAGINATION.DEFAULT_PAGE && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === COMMON_PAGINATION.DEFAULT_PAGE}
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

      {/* Request Join Class Sheet */}
      <RequestJoinClassSheet
        open={isJoinSheetOpen}
        onOpenChange={handleRequestSheetClose}
        classData={selectedClassForJoin}
      />
      
      {/* Join Class Sheet (nhập mã code) - giữ lại để có thể dùng */}
      <JoinClassSheet
        open={false}
        onOpenChange={() => {}}
      />
    </div>
  );
};

// Class Card Component
const ClassCard = ({ 
  classItem, 
  onJoinClick
}: { 
  classItem: RecruitingClass; 
  onJoinClick: () => void;
}) => {
  const schedules = formatScheduleArray(classItem.recurringSchedule);
  const availableSlots = (classItem.maxStudents || 0) - classItem.currentStudents;
  const isFull = availableSlots <= 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-2">{classItem.name}</CardTitle>
          <Badge className={`ml-2 shrink-0 border-0 ${CLASS_STATUS_BADGE_COLORS[classItem.status as ClassStatus] || CLASS_STATUS_BADGE_COLORS[ClassStatus.DRAFT]}`}>
            {CLASS_STATUS_LABELS[classItem.status as ClassStatus] || classItem.status}
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
          onClick={onJoinClick}
          disabled={isFull}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 w-4 h-4" />
          {isFull ? 'Đã đầy' : 'Đăng ký học'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecruitingClasses;

