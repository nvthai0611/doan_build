import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, ArrowLeft, Check, ChevronLeft, ChevronRight, Users, Mail, Phone, IdCard, GraduationCap, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import Loading from '../../../../../components/Loading/LoadingPage';
import { useEnrollmentMutations } from '../../hooks/useEnrollmentMutations';
import { toast } from 'sonner';
import { enrollmentService } from '../../../../../services/center-owner/enrollment/enrollment.service';

interface SelectStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  onSubmit?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

interface StudentItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  parent?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export const SelectStudentSheet = ({
  open,
  onOpenChange,
  classData,
  onSubmit,
  isLoading = false
}: SelectStudentSheetProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  
  // Use enrollment mutations hook
  const { bulkEnroll } = useEnrollmentMutations();
  
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  // Dùng API mới: chỉ lấy students CHƯA enroll vào lớp này
  const { data, isLoading: isFetchingStudents } = useQuery({
    queryKey: ['available-students', classData?.id, { searchTerm: debouncedQuery || undefined, page, limit: pageSize, open }],
    queryFn: async () => {
      if (!classData?.id) {
        return { success: true, status: 200, message: '', data: [], meta: { total: 0, totalPages: 0 } };
      }
      return enrollmentService.getAvailableStudents(classData.id, {
        search: debouncedQuery?.trim() ? debouncedQuery : undefined,
        page,
        limit: pageSize
      });
    },
    enabled: open && !!classData?.id,
    staleTime: 2000,
    refetchOnWindowFocus: true
  });

  

  const apiStudents: any[] = (data as any)?.data || [];
  const total: number = (data as any)?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = useMemo(() => apiStudents.map((s: any) => ({
    id: s.id,
    fullName: s.user?.fullName || s.fullName || 'Không tên',
    email: s.user?.email || s.email,
    studentCode: s.studentCode || '',
    phone: s.user?.phone || s.phone,
    avatar: s.user?.avatar || s.avatar,
    parent: {
      fullName: s.parent?.user?.fullName || s.parent?.fullName,
      email: s.parent?.user?.email || s.parent?.email,
      phone: s.parent?.user?.phone || s.parent?.phone,
    }
  })), [apiStudents]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleToggle = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  // Get current class capacity info
  const { data: capacityInfo } = useQuery({
    queryKey: ['class-capacity', classData?.id],
    queryFn: () => enrollmentService.checkCapacity(classData?.id),
    enabled: !!classData?.id && open,
    staleTime: 30000,
  });

  const maxStudents = classData?.maxStudents || ((capacityInfo as any)?.data?.maxStudents as number) || 30;
  const currentStudents = classData?.currentStudents || ((capacityInfo as any)?.data?.currentStudents as number) || 0;

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 học viên');
      return;
    }

    if (!classData?.id) {
      toast.error('Không tìm thấy thông tin lớp học');
      return;
    }

    // Check capacity before submitting
    // Cảnh báo khi: đã đầy (currentStudents >= maxStudents) hoặc sẽ vượt quá (newTotalStudents > maxStudents)
    const newTotalStudents = currentStudents + selected.length;
    const availableSlots = maxStudents ? maxStudents - currentStudents : 999999;
    
    // Nếu không đủ chỗ hoặc sẽ vượt quá giới hạn → hiển thị dialog cảnh báo
    if (maxStudents && (availableSlots <= 0 || newTotalStudents > maxStudents)) {
      // Show warning dialog để user xác nhận override capacity
      setPendingSubmit(true);
      setShowCapacityWarning(true);
      return;
    }

    // If no capacity issue, proceed directly
    await performSubmit();
  };

  const performSubmit = async (overrideCapacity = false) => {
    if (!classData?.id) {
      toast.error('Không tìm thấy thông tin lớp học');
      return;
    }

    try {
      // Call bulk enroll API
      const response = await bulkEnroll.mutateAsync({
        classId: classData.id,
        studentIds: selected,
        overrideCapacity: overrideCapacity // Pass flag to allow exceeding capacity when user confirmed
      });

      // Parse response
      const result = response?.data || response;
      const successCount = result?.success?.length || 0;
      const failedCount = result?.failed?.length || 0;
      const totalCount = selected.length;

      // Show appropriate toast
      if (failedCount === 0) {
        toast.success(`✅ Đã thêm ${successCount} học viên thành công!`);
      } else if (successCount > 0) {
        toast.warning(
          `Thêm ${successCount}/${totalCount} học viên thành công. ${failedCount} thất bại.`,
          {
            description: result.failed?.map((f: any) => f.reason).join(', ').substring(0, 100)
          }
        );
      } else {
        toast.error(`Không thể thêm học viên. Vui lòng thử lại.`);
      }

      // Reset and close on success
      if (successCount > 0) {
        setSelected([]);
        setShowCapacityWarning(false);
        setPendingSubmit(false);
        onOpenChange(false);
        onSubmit?.(selected);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.message || error?.message || 'Có lỗi xảy ra khi thêm học viên';
      toast.error(errorMessage);
      console.error('Bulk enroll error:', error);
      setShowCapacityWarning(false);
      setPendingSubmit(false);
    }
  };

  const handleCancelWarning = () => {
    setShowCapacityWarning(false);
    setPendingSubmit(false);
  };

  const handleConfirmWarning = async () => {
    setShowCapacityWarning(false);
    await performSubmit(true); // Pass true to override capacity check
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Chọn học viên</SheetTitle>
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
                disabled={bulkEnroll.isPending || selected.length === 0}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
              >
                {bulkEnroll.isPending ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {classData?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Lớp: {classData.name}</span>
              {selected.length > 0 && (
                <Badge variant="secondary" className="ml-2">Đã chọn {selected.length}</Badge>
              )}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã học viên (QNSTxxxxxx), email, SĐT..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </SheetHeader>

        <div className="mt-6">
          {isFetchingStudents ? (
            <Loading/>
          ) : current.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">Không có học viên nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.map(s => (
                <div
                  key={s.id}
                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                    selected.includes(s.id) ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle(s.id)}
                >
                  <div className="bg-[#5B5BE0] text-white px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={s.avatar} alt={s.fullName} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {getInitials(s.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-semibold truncate">{s.fullName}</div>
                    <div className="ml-auto">
                      <Checkbox
                        checked={selected.includes(s.id)}
                        onCheckedChange={() => handleToggle(s.id)}
                        onClick={(e: any) => e.stopPropagation()}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#5B5BE0]"
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{s.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{s.studentCode || '-'}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex items-center gap-2 mb-1 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phụ huynh</span>
                      </div>
                      <div className="ml-6 space-y-1 text-gray-700">
                        <div className="text-sm">{s.parent?.fullName || '-'}</div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-300" />
                          <span className="truncate">{s.parent?.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-300" />
                          <span>{s.parent?.phone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between px-2 py-3 text-sm text-gray-600">
            <div>
              {total === 0 ? '0-0 trong 0' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} trong ${total}`}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Capacity Warning Dialog */}
        <AlertDialog open={showCapacityWarning} onOpenChange={setShowCapacityWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <AlertDialogTitle className="text-lg font-semibold">
                  Cảnh báo sức chứa lớp học
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="pt-2">
                <div className="space-y-2">
                  <p>
                    Lớp học hiện tại đã có <strong>{currentStudents}</strong> học viên 
                    {maxStudents && ` (tối đa ${maxStudents} học viên)`}.
                  </p>
                  <p>
                    Bạn đang muốn thêm <strong>{selected.length}</strong> học viên nữa.
                  </p>
                  {maxStudents && (() => {
                    const newTotal = currentStudents + selected.length;
                    const availableSlots = maxStudents - currentStudents;
                    
                    if (availableSlots <= 0) {
                      return (
                        <p className="text-red-600 font-medium">
                          ⚠️ Lớp đã đầy (<strong>{currentStudents}/{maxStudents}</strong>). 
                          Thêm học viên sẽ vượt quá giới hạn.
                        </p>
                      );
                    } else if (newTotal > maxStudents) {
                      return (
                        <p className="text-red-600 font-medium">
                          ⚠️ Tổng số học viên sẽ là <strong>{newTotal}</strong>, 
                          vượt quá giới hạn <strong>{maxStudents} học viên</strong>.
                        </p>
                      );
                    }
                    return null;
                  })()}
                  <p className="pt-2">
                    Bạn có chắc chắn muốn tiếp tục thêm học viên vào lớp này không?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelWarning}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmWarning}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Xác nhận thêm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};

export default SelectStudentSheet;


