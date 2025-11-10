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
import { dayOptions } from '../../../../../utils/commonData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * ============================================
 * TRANSFER STUDENT SHEET - CHUYỂN LỚP HỌC SINH
 * ============================================
 * 
 * MÔ TẢ CHỨC NĂNG:
 * Component này cho phép chuyển nhiều học sinh từ lớp hiện tại sang lớp khác.
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Hiển thị danh sách lớp đích khả dụng (cùng môn, cùng khối, còn chỗ trống)
 * 2. User tìm kiếm và chọn lớp đích
 * 3. Nếu lớp hiện tại đang ACTIVE → hiển thị dialog cảnh báo
 * 4. Thực hiện chuyển lớp (gọi API cho từng enrollment)
 * 5. Cập nhật lại UI (invalidate cache)
 * 
 * ĐIỀU KIỆN LỚP ĐẾN HỢP LỆ:
 * - Cùng môn học và cùng khối lớp
 * - Trạng thái READY hoặc ACTIVE
 * - Còn đủ chỗ trống cho tất cả học sinh được chọn
 * - Không phải lớp hiện tại
 * 
 * ƯU TIÊN SẮP XẾP:
 * 1. Lớp cùng giáo viên (để dễ quản lý)
 * 2. Lớp có ít học sinh hơn (cân bằng sĩ số)
 */

interface TransferStudentSheetProps {
  open: boolean; // Trạng thái mở/đóng sheet
  onOpenChange: (open: boolean) => void; // Callback khi đóng/mở sheet
  classData?: any; // Thông tin lớp hiện tại
  selectedEnrollmentIds: string[]; // Danh sách ID enrollment được chọn để chuyển
  onSuccess?: () => void; // Callback khi chuyển lớp thành công
  allEnrollments?: any[]; // Danh sách tất cả enrollments (để lấy tên học sinh)
}

export const TransferStudentSheet = ({
  open,
  onOpenChange,
  classData,
  selectedEnrollmentIds,
  onSuccess,
  allEnrollments = [],
}: TransferStudentSheetProps) => {
  // === STATE MANAGEMENT ===
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm lớp đích
  const [selectedClassId, setSelectedClassId] = useState<string>(''); // ID lớp đích được chọn
  const [showActiveClassConfirm, setShowActiveClassConfirm] = useState(false); // Hiển thị dialog xác nhận khi chuyển từ lớp ACTIVE
  const debouncedSearch = useDebounce(searchTerm, 500); // Debounce search để tránh call API liên tục
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // === EXTRACT DANH SÁCH TÊN HỌC SINH ===
  // Lấy tên các học sinh được chọn để hiển thị trong dialog xác nhận
  const studentNames = useMemo(() => {
    if (!allEnrollments || allEnrollments.length === 0) return [];
    
    // Filter enrollments theo danh sách ID được chọn
    const selectedEnrollments = allEnrollments.filter((enrollment: any) =>
      selectedEnrollmentIds.includes(enrollment.id)
    );
    
    // Lấy tên học sinh từ enrollment
    return selectedEnrollments
      .map((enrollment: any) => enrollment?.student?.user?.fullName || 'Không có tên')
      .filter(Boolean);
  }, [allEnrollments, selectedEnrollmentIds]);

  // === RESET FORM KHI ĐÓNG SHEET ===
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedClassId('');
      setShowActiveClassConfirm(false);
    }
  }, [open]);

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

      // Sử dụng API getClassesForTransfer thay vì getClasses để có đầy đủ thông tin teacher
      const response = await classService.getClassesForTransfer(params);
      return response;
    },
    enabled: open && !!classData && !!(classData?.subjectId || classData?.subject?.id) && !!(classData?.gradeId || classData?.grade?.id),
    staleTime: 0,
  });

  const classes: any[] = (classesData as any)?.data || [];
  
  // === TẠO CAPACITY MAP TỪ DATA ĐÃ CÓ ===
  // API getClassesForTransfer đã trả về currentStudents và maxStudents rồi
  // Không cần gọi thêm checkCapacity nữa
  const capacityMap = useMemo(() => {
    const map: Record<string, any> = {};
    classes.forEach((cls: any) => {
      map[cls.id] = {
        currentStudents: cls.currentStudents || 0,
        maxStudents: cls.maxStudents,
      };
    });
    return map;
  }, [classes]);

  // === LỌC VÀ SẮP XẾP DANH SÁCH LỚP KHẢ DỤNG ===
  const availableClasses = useMemo(() => {
    const currentSubjectId = classData?.subjectId || classData?.subject?.id;
    const currentGradeId = classData?.gradeId || classData?.grade?.id;
    const currentTeacherId = classData?.teacherId || classData?.teacher?.id;
    
    // === BƯỚC 1: LỌC CÁC LỚP PHÙ HỢP ===
    let filtered = classes.filter((cls: any) => {
      // 1.1. Loại bỏ lớp hiện tại (không cho chuyển vào chính nó)
      if (cls.id === classData?.id) return false;
      
      // 1.2. Chỉ cho phép chuyển vào lớp READY hoặc ACTIVE
      if (cls.status !== ClassStatus.READY && cls.status !== ClassStatus.ACTIVE) return false;
      
      // 1.3. Phải cùng môn học và cùng khối lớp
      const clsSubjectId = cls.subjectId || cls.subject?.id;
      const clsGradeId = cls.gradeId || cls.grade?.id;
      if (clsSubjectId !== currentSubjectId || clsGradeId !== currentGradeId) return false;
      
      // 1.4. Kiểm tra còn chỗ trống hay không
      const capacity = capacityMap[cls.id];
      if (capacity) {
        const currentStudents = capacity.currentStudents || 0;
        const maxStudents = capacity.maxStudents;
        
        // Nếu lớp có giới hạn sĩ số
        if (maxStudents !== null && maxStudents !== undefined) {
          const availableSlots = maxStudents - currentStudents;
          // Phải có đủ chỗ cho TẤT CẢ học sinh được chọn
          if (availableSlots < selectedEnrollmentIds.length) return false;
        }
      }
      
      return true;
    });

    // === BƯỚC 2: SẮP XẾP DANH SÁCH ===
    // Ưu tiên: 1. Cùng giáo viên → 2. Lớp ít học sinh hơn
    filtered.sort((a: any, b: any) => {
      const aTeacherId = a.teacherId || a.teacher?.id;
      const bTeacherId = b.teacherId || b.teacher?.id;
      const aHasSameTeacher = aTeacherId === currentTeacherId;
      const bHasSameTeacher = bTeacherId === currentTeacherId;
      
      // 2.1. Lớp cùng giáo viên sẽ hiển thị trước (dễ quản lý hơn)
      if (aHasSameTeacher && !bHasSameTeacher) return -1;
      if (!aHasSameTeacher && bHasSameTeacher) return 1;
      
      // 2.2. Sau đó sắp xếp theo số học sinh hiện tại (tăng dần)
      // Lớp ít học sinh hơn sẽ lên trước (cân bằng sĩ số)
      const aCapacity = capacityMap[a.id];
      const bCapacity = capacityMap[b.id];
      const aStudents = aCapacity?.currentStudents || 0;
      const bStudents = bCapacity?.currentStudents || 0;
      
      return aStudents - bStudents;
    });

    return filtered;
  }, [classes, classData, capacityMap, selectedEnrollmentIds.length]);


  // === MUTATION CHUYỂN LỚP HỌC SINH ===
  const transferMutation = useMutation({
    mutationFn: async ({ enrollmentIds, newClassId }: { enrollmentIds: string[]; newClassId: string }) => {
      // Chuyển từng enrollment (gọi API song song để nhanh hơn)
      const promises = enrollmentIds.map((enrollmentId) =>
        enrollmentService.transferStudent(enrollmentId, {
          newClassId,
          reason: 'Chuyển lớp hàng loạt', // Lý do mặc định
        })
      );
      return Promise.all(promises);
     
    },
    onSuccess: () => {
      // Hiển thị thông báo thành công
      toast({
        title: 'Thành công',
        description: `Đã chuyển ${selectedEnrollmentIds.length} học sinh sang lớp mới thành công`,
      });
      
      // === INVALIDATE CACHE ĐỂ CẬP NHẬT UI ===
      // Xóa cache để force re-fetch data mới
      queryClient.invalidateQueries({ 
        queryKey: ['class-enrollments'], // Danh sách học sinh trong lớp
        exact: false // Invalidate tất cả queries có prefix này
      });
      queryClient.invalidateQueries({ queryKey: ['class', classData?.id] }); // Thông tin lớp hiện tại
      queryClient.invalidateQueries({ queryKey: ['classes'] }); // Danh sách tất cả lớp
      queryClient.invalidateQueries({ queryKey: ['available-classes-transfer'] }); // Danh sách lớp khả dụng
      queryClient.invalidateQueries({ queryKey: ['classes-capacity'] }); // Sĩ số các lớp
      
      // Gọi callback từ parent component (nếu có)
      onSuccess && onSuccess();
      
      // Đóng sheet
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Xử lý lỗi schedule conflict từ backend
      const errorData = error?.response?.data;
      if (errorData?.conflicts && Array.isArray(errorData.conflicts)) {
        const conflictMessages = errorData.conflicts
          .map((c: any) => `Lớp "${c.className}" - Thứ ${c.dayOfWeek}: ${c.conflictingClassTime} trùng với ${c.newClassTime}`)
          .join('; ');
        toast({
          title: 'Lịch học bị trùng',
          description: conflictMessages,
          variant: 'destructive',
          duration: 10000,
        });
      } else {
        // Hiển thị thông báo lỗi thông thường
        toast({
          title: 'Lỗi',
          description:
            errorData?.message ||
            error?.response?.data?.message ||
            error?.message ||
            'Có lỗi xảy ra khi chuyển lớp học sinh',
          variant: 'destructive',
          duration: 8000,
        });
      }
    },
  });

  // === XỬ LÝ SUBMIT FORM ===
  const handleSubmit = () => {
    // Validation: Phải chọn lớp đích
    if (!selectedClassId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn lớp đích',
        variant: 'destructive',
      });
      return;
    }

    // Validation: Phải có ít nhất 1 học sinh được chọn
    if (selectedEnrollmentIds.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một học sinh',
        variant: 'destructive',
      });
      return;
    }

    // === XỬ LÝ ĐẶC BIỆT CHO LỚP ĐANG HOẠT ĐỘNG ===
    // Nếu lớp hiện tại đang ACTIVE → hiển thị dialog xác nhận
    // (vì chuyển từ lớp ACTIVE có thể ảnh hưởng đến tiến độ học)
    if (classData?.status === ClassStatus.ACTIVE) {
      setShowActiveClassConfirm(true);
      return;
    }

    // Nếu lớp không phải ACTIVE (DRAFT, READY,...) → chuyển lớp ngay
    executeTransfer();
  };

  // === THỰC HIỆN CHUYỂN LỚP ===
  const executeTransfer = () => {
    transferMutation.mutate({
      enrollmentIds: selectedEnrollmentIds,
      newClassId: selectedClassId,
    });
    setShowActiveClassConfirm(false); // Đóng dialog confirm
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

          {/* Warning Alert for Active Class */}
          {classData?.status === ClassStatus.ACTIVE && (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                <strong className="font-semibold">⚠️ Cảnh báo:</strong> Lớp hiện tại đang ở trạng thái <strong>"Đang hoạt động"</strong>.
                <br />
                Nếu chuyển lớp, học sinh sẽ không thể quay lại lớp cũ. Vui lòng cân nhắc kỹ trước khi thực hiện.
              </AlertDescription>
            </Alert>
          )}

          {/* General Warning Alert */}
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
                placeholder="Tìm kiếm theo tên lớp, mã lớp, tên giáo viên..."
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
                              {/* Hiển thị tên giáo viên nếu có */}
                              {(cls.teacherName || cls.teacher?.user?.fullName || cls.teacher?.fullName) && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>GV: {cls.teacherName || cls.teacher?.user?.fullName || cls.teacher?.fullName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  Sĩ số: {currentStudents}/{maxStudents ?? 'N/A'}
                                  {availableSlots !== null && availableSlots > 0 && (
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
                              {/* Hiển thị lịch học */}
                              {cls.recurringSchedule && cls.recurringSchedule.schedules && cls.recurringSchedule.schedules.length > 0 && (
                                <div className="flex items-start gap-1 mt-2">
                                  <Calendar className="h-3 w-3 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="font-medium text-xs">Lịch học:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {cls.recurringSchedule.schedules.map((schedule: any, idx: number) => {
                                        const dayLabel = dayOptions.find(d => d.value === schedule.day)?.label || schedule.day;
                                        return (
                                          <span 
                                            key={idx} 
                                            className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded"
                                          >
                                            {dayLabel}: {schedule.startTime}-{schedule.endTime}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
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

        </div>
      </SheetContent>

      {/* Confirmation Dialog for Active Class */}
      <AlertDialog open={showActiveClassConfirm} onOpenChange={setShowActiveClassConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Xác nhận chuyển lớp từ lớp đang hoạt động
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ Lớp hiện tại đang ở trạng thái <strong>"Đang hoạt động"</strong>
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  Bạn có chắc chắn muốn chuyển <strong>{selectedEnrollmentIds.length} học sinh</strong> từ lớp{' '}
                  <strong>{classData?.name}</strong> sang lớp mới không?
                </p>
                
                {/* Danh sách tên học sinh */}
                {studentNames.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">Danh sách học sinh sẽ được chuyển:</p>
                    {studentNames.length <= 5 ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {studentNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                        {studentNames.map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                <p className="text-red-600 dark:text-red-400 font-medium mt-3">
                  ⚠️ Lưu ý quan trọng: Nếu chuyển lớp, học sinh sẽ <strong>không thể quay lại lớp cũ</strong>.
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowActiveClassConfirm(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={executeTransfer}
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? 'Đang xử lý...' : 'Xác nhận chuyển lớp'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
};

