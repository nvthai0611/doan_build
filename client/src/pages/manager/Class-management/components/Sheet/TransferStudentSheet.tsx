import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Search, BookOpen, Users, Calendar, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { apiClient } from '../../../../../utils/clientAxios';
import { useToast } from '../../../../../hooks/use-toast';
import { enrollmentService } from '../../../../../services/center-owner/enrollment/enrollment.service';
import { classService } from '../../../../../services/center-owner/class-management/class.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClassStatus, CLASS_STATUS_LABELS } from '../../../../../lib/constants';

interface TransferStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  selectedEnrollmentIds: string[];
  onSuccess?: () => void;
}

export const TransferStudentSheet = ({
  open,
  onOpenChange,
  classData,
  selectedEnrollmentIds,
  onSuccess,
}: TransferStudentSheetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedClassId('');
    }
  }, [open]);

  // Fetch available classes (excluding current class)
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: [
      'available-classes-transfer',
      {
        search: debouncedSearch || undefined,
        subjectId: classData?.subjectId || classData?.subject?.id,
        gradeId: classData?.gradeId || classData?.grade?.id,
        excludeClassId: classData?.id,
      },
      open,
    ],
    queryFn: async () => {
      const params: any = {
        limit: 100,
        // Không truyền status filter - sẽ filter ở frontend
      };

      // Filter theo cùng môn và cùng khối
      if (classData?.subjectId || classData?.subject?.id) {
        params.subjectId = classData.subjectId || classData.subject.id;
      }
      if (classData?.gradeId || classData?.grade?.id) {
        params.gradeId = classData.gradeId || classData.grade.id;
      }

      if (debouncedSearch?.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await classService.getClasses(params);
      return response;
    },
    enabled: open && !!classData && !!(classData?.subjectId || classData?.subject?.id) && !!(classData?.gradeId || classData?.grade?.id),
    staleTime: 0,
  });

  const classes: any[] = (classesData as any)?.data || [];
  
  // Fetch capacity for each class to check if they have available slots
  const { data: classesWithCapacity } = useQuery({
    queryKey: ['classes-capacity', classes.map((c: any) => c.id).join(',')],
    queryFn: async () => {
      const capacityPromises = classes.map(async (cls: any) => {
        try {
          const capacity = await enrollmentService.checkCapacity(cls.id);
          return {
            classId: cls.id,
            capacity: (capacity as any)?.data,
          };
        } catch (error) {
          return {
            classId: cls.id,
            capacity: null,
          };
        }
      });
      return Promise.all(capacityPromises);
    },
    enabled: open && classes.length > 0,
    staleTime: 0,
  });

  const capacityMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (classesWithCapacity) {
      (classesWithCapacity as any[]).forEach((item: any) => {
        map[item.classId] = item.capacity;
      });
    }
    return map;
  }, [classesWithCapacity]);

  // Filter and sort classes
  const availableClasses = useMemo(() => {
    const currentSubjectId = classData?.subjectId || classData?.subject?.id;
    const currentGradeId = classData?.gradeId || classData?.grade?.id;
    const currentTeacherId = classData?.teacherId || classData?.teacher?.id;
    
    // Filter classes
    let filtered = classes.filter((cls: any) => {
      // Exclude current class
      if (cls.id === classData?.id) return false;
      
      // Must be READY or ACTIVE
      if (cls.status !== ClassStatus.READY && cls.status !== ClassStatus.ACTIVE) return false;
      
      // Must have same subject and grade
      const clsSubjectId = cls.subjectId || cls.subject?.id;
      const clsGradeId = cls.gradeId || cls.grade?.id;
      if (clsSubjectId !== currentSubjectId || clsGradeId !== currentGradeId) return false;
      
      // Must have available slots
      const capacity = capacityMap[cls.id];
      if (capacity) {
        const currentStudents = capacity.currentStudents || 0;
        const maxStudents = capacity.maxStudents;
        
        // If maxStudents is set, check if there's space
        if (maxStudents !== null && maxStudents !== undefined) {
          const availableSlots = maxStudents - currentStudents;
          // Must have enough slots for all selected students
          if (availableSlots < selectedEnrollmentIds.length) return false;
        }
      }
      
      return true;
    });

    // Sort classes: 1. Same teacher first, 2. By current students ascending
    filtered.sort((a: any, b: any) => {
      const aTeacherId = a.teacherId || a.teacher?.id;
      const bTeacherId = b.teacherId || b.teacher?.id;
      const aHasSameTeacher = aTeacherId === currentTeacherId;
      const bHasSameTeacher = bTeacherId === currentTeacherId;
      
      // Same teacher comes first
      if (aHasSameTeacher && !bHasSameTeacher) return -1;
      if (!aHasSameTeacher && bHasSameTeacher) return 1;
      
      // Then sort by current students (ascending)
      const aCapacity = capacityMap[a.id];
      const bCapacity = capacityMap[b.id];
      const aStudents = aCapacity?.currentStudents || 0;
      const bStudents = bCapacity?.currentStudents || 0;
      
      return aStudents - bStudents;
    });

    return filtered;
  }, [classes, classData, capacityMap, selectedEnrollmentIds.length]);

  // Mutation to transfer students
  const transferMutation = useMutation({
    mutationFn: async ({ enrollmentIds, newClassId }: { enrollmentIds: string[]; newClassId: string }) => {
      // Transfer each enrollment
      const promises = enrollmentIds.map((enrollmentId) =>
        enrollmentService.transferStudent(enrollmentId, {
          newClassId,
          reason: 'Chuyển lớp hàng loạt',
        })
      );
      return Promise.all(promises);
     
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: `Đã chuyển ${selectedEnrollmentIds.length} học sinh sang lớp mới thành công`,
      });
      // Invalidate tất cả queries liên quan để đảm bảo danh sách lớp cũ được cập nhật
      // Query key chính xác: ['class-enrollments', classId, academicYear]
      queryClient.invalidateQueries({ 
        queryKey: ['class-enrollments'],
        exact: false // Invalidate tất cả queries bắt đầu với 'class-enrollments'
      });
      queryClient.invalidateQueries({ queryKey: ['class', classData?.id] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['available-classes-transfer'] });
      queryClient.invalidateQueries({ queryKey: ['classes-capacity'] });
      onSuccess && onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Có lỗi xảy ra khi chuyển lớp học sinh',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedClassId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn lớp đích',
        variant: 'destructive',
      });
      return;
    }

    if (selectedEnrollmentIds.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một học sinh',
        variant: 'destructive',
      });
      return;
    }

    transferMutation.mutate({
      enrollmentIds: selectedEnrollmentIds,
      newClassId: selectedClassId,
    });
  };

  const selectedClass = availableClasses.find(
    (cls: any) => cls.id === selectedClassId
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Chuyển lớp học sinh</SheetTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit}
                disabled={
                  !selectedClassId ||
                  selectedEnrollmentIds.length === 0 ||
                  transferMutation.isPending
                }
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current Class Information */}
          {classData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Lớp hiện tại: {classData.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {CLASS_STATUS_LABELS[classData.status as ClassStatus]}
                    </Badge>
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    Số học sinh được chọn: <strong>{selectedEnrollmentIds.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Alert */}
          <Alert className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-cyan-800 dark:text-cyan-200">
              Học sinh sẽ được chuyển từ lớp hiện tại sang lớp mới. Hành động này không thể hoàn tác.
            </AlertDescription>
          </Alert>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search Class */}
          <div className="space-y-2">
            <Label htmlFor="search-class">Tìm kiếm lớp đích</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search-class"
                placeholder="Tìm kiếm theo tên lớp, môn học, khối lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Available Classes List */}
          <div className="space-y-2">
            <Label>Chọn lớp đích</Label>
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {isLoadingClasses ? (
                <div className="p-8 text-center text-gray-500">
                  Đang tải danh sách lớp...
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Không tìm thấy lớp phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {availableClasses.map((cls: any) => {
                    const isSelected = selectedClassId === cls.id;
                    const capacity = capacityMap[cls.id];
                    const currentStudents = capacity?.currentStudents || 0;
                    const maxStudents = capacity?.maxStudents;
                    const availableSlots = maxStudents ? maxStudents - currentStudents : null;
                    const isSameTeacher = (cls.teacherId || cls.teacher?.id) === (classData?.teacherId || classData?.teacher?.id);
                    
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{cls.name || '-'}</p>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                {CLASS_STATUS_LABELS[cls.status as ClassStatus]}
                              </Badge>
                              {isSameTeacher && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Cùng giáo viên
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 mt-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-3 w-3" />
                                <span>{cls.subjectName || cls.subject?.name} - {cls.gradeName || cls.grade?.name || 'Chưa xác định'}</span>
                              </div>
                              {cls.teacherName && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>GV: {cls.teacherName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  Sĩ số: {currentStudents}
                                  {maxStudents !== null && maxStudents !== undefined && `/${maxStudents}`}
                                  {availableSlots !== null && (
                                    <span className="text-green-600 font-medium ml-1">
                                      (Còn {availableSlots} chỗ)
                                    </span>
                                  )}
                                </span>
                              </div>
                              {cls.roomName && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Phòng: {cls.roomName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Class Preview */}
          {selectedClass && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Lớp đích đã chọn
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {selectedClass.name || '-'}
                  </p>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {selectedClass.subjectName || selectedClass.subject?.name} - {selectedClass.gradeName || selectedClass.grade?.name || 'Chưa xác định'}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

