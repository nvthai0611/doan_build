import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, Search, User, AlertCircle, CheckCircle2, Mail, GraduationCap, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { apiClient } from '../../../../../utils/clientAxios';
import { useToast } from '../../../../../hooks/use-toast';
import { classService } from '../../../../../services/center-owner/class-management/class.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeDisplay } from '../../../../../components/common/CodeDisplay';
import { ClassStatus } from '../../../../../lib/constants';
import { Checkbox } from '@/components/ui/checkbox';

interface TransferTeacherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
}

export const TransferTeacherSheet = ({
  open,
  onOpenChange,
  classData,
}: TransferTeacherSheetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [substituteEndDate, setSubstituteEndDate] = useState('');
  const [conflictInfo, setConflictInfo] = useState<
    | {
        hasConflict: boolean;
        conflicts: any[];
        incompatibleSubject?: boolean;
        subjectMessage?: string | null;
        inactive?: boolean;
      }
    | null
  >(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedTeacherId('');
      setReason('');
      setReasonDetail('');
      setEffectiveDate('');
      setIsTemporary(false);
      setSubstituteEndDate('');
      setConflictInfo(null);
    }
  }, [open]);

  // Fetch available teachers (excluding current teacher)
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: [
      'available-teachers-transfer',
      {
        search: debouncedSearch || undefined,
        subject: classData?.subject?.name,
        excludeTeacherId: classData?.teacherId,
      },
      open,
    ],
    queryFn: async () => {
      const params: any = {
        status: 'active',
        limit: 1000,
      };

      if (debouncedSearch?.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (classData?.subject) {
        params.subject = classData.subject.name;
      }

      const response = await apiClient.get('/admin-center/teachers',  params );
      return response;
    },
    enabled: open && !!classData,
    staleTime: 0,
  });

  // Validate conflicts when inputs change
  useEffect(() => {
    const run = async () => {
      setConflictInfo(null);
      if (!open || !classData?.id || !selectedTeacherId) return;
      if (isTemporary && (!effectiveDate || !substituteEndDate)) return;
      try {
        const params: any = { replacementTeacherId: selectedTeacherId };
        if (isTemporary) {
          params.effectiveDate = effectiveDate;
          params.substituteEndDate = substituteEndDate;
        } else if (effectiveDate) {
          params.effectiveDate = effectiveDate;
        }
        const res = await apiClient.get(`/admin-center/classes/${classData.id}/transfer-teacher/validate`, { params });
        const raw = (res as any)?.data || (res as any);
        const data = raw?.data ?? raw;
        setConflictInfo({
          hasConflict: !!data?.hasConflict,
          conflicts: data?.conflicts || [],
          incompatibleSubject: data?.incompatibleSubject,
          subjectMessage: data?.subjectMessage,
          inactive: data?.inactive,
        });
      } catch (e: any) {
        // ignore validation errors until inputs are complete
      }
    };
    run();
  }, [open, classData?.id, selectedTeacherId, isTemporary, effectiveDate, substituteEndDate]);

  const teachers: any[] = (teachersData as any)?.data || [];
  
  // Filter out current teacher
  const availableTeachers = useMemo(() => {
    return teachers.filter(
      (teacher: any) => teacher.id !== classData?.teacherId
    );
  }, [teachers, classData?.teacherId]);

  // Mutation to transfer teacher
  const transferMutation = useMutation({
    mutationFn: (data: any) => classService.transferTeacher(classData?.id, data),
    onSuccess: (_data, variables) => {
      toast({
        title: 'Thành công',
        description: variables?.substituteEndDate
          ? 'Chuyển giáo viên tạm thời đã được áp dụng'
          : 'Chuyển giáo viên đã được áp dụng',
      });
      queryClient.invalidateQueries({ queryKey: ['class', classData?.id] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      onOpenChange(false);
      //refresh page
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Có lỗi xảy ra khi chuyển giáo viên',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedTeacherId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn giáo viên thay thế',
        variant: 'destructive',
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do chuyển giáo viên',
        variant: 'destructive',
      });
      return;
    }

    if (isTemporary) {
      if (!effectiveDate) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn ngày có hiệu lực cho chuyển tạm thời',
          variant: 'destructive',
        });
        return;
      }
      if (!substituteEndDate) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn ngày kết thúc cho chuyển tạm thời',
          variant: 'destructive',
        });
        return;
      }
      if (new Date(substituteEndDate) <= new Date(effectiveDate)) {
        toast({
          title: 'Lỗi',
          description: 'Ngày kết thúc phải sau ngày có hiệu lực',
          variant: 'destructive',
        });
        return;
      }
    }

    if (conflictInfo?.inactive) {
      toast({
        title: 'Lỗi',
        description: 'Giáo viên này đang bị vô hiệu hóa, không thể chuyển.',
        variant: 'destructive',
      });
      return;
    }

    if (conflictInfo?.incompatibleSubject) {
      toast({
        title: 'Lỗi',
        description: conflictInfo.subjectMessage || 'Giáo viên không phù hợp môn học của lớp.',
        variant: 'destructive',
      });
      return;
    }

    if (conflictInfo?.hasConflict) {
      toast({
        title: 'Lỗi',
        description: 'Giáo viên đang có xung đột lịch trong khoảng áp dụng. Vui lòng chọn giáo viên khác hoặc điều chỉnh thời gian.',
        variant: 'destructive',
      });
      return;
    }

    const data: any = {
      replacementTeacherId: selectedTeacherId,
      reason: reason.trim(),
      reasonDetail: reasonDetail.trim() || undefined,
      effectiveDate: effectiveDate || undefined,
    };

    if (isTemporary) {
      data.substituteEndDate = substituteEndDate;
    }

    transferMutation.mutate(data);
  };

  const selectedTeacher = availableTeachers.find(
    (t: any) => t.id === selectedTeacherId
  );

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const currentTeacher = classData?.teacher;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Chuyển giáo viên
            </SheetTitle>
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
                  !selectedTeacherId ||
                  !reason.trim() ||
                  transferMutation.isPending ||
                  (conflictInfo?.hasConflict ?? false) ||
                  (conflictInfo?.incompatibleSubject ?? false) ||
                  (conflictInfo?.inactive ?? false)
                }
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Class Information */}
          {classData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      {classData.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {classData.status === ClassStatus.ACTIVE
                        ? 'Đang hoạt động'
                        : 'Chưa hoạt động'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {classData.subjectName || classData.subject?.name} -{' '}
                        {classData.gradeName ||
                          classData.grade?.name ||
                          'Chưa xác định'}
                      </span>
                    </div>
                    {classData.roomName && (
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Calendar className="h-4 w-4" />
                        <span>Phòng: {classData.roomName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Teacher Info */}
          {currentTeacher && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Giáo viên hiện tại
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={currentTeacher?.avatar}
                        alt={currentTeacher?.fullName}
                      />
                      <AvatarFallback className="bg-amber-100 text-amber-600">
                        {getInitials(currentTeacher?.fullName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        {currentTeacher?.fullName || '-'}
                      </p>
                      {currentTeacher?.email && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {currentTeacher?.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Alert */}
          <Alert className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-cyan-800 dark:text-cyan-200">
              Việc chuyển giáo viên sẽ được áp dụng ngay cho các buổi học trong phạm vi đã chọn.
            </AlertDescription>
          </Alert>

          {/* Conflict / Compatibility Notice */}
          {selectedTeacherId && conflictInfo && (
            <Alert
              className={
                conflictInfo.hasConflict || conflictInfo.incompatibleSubject || conflictInfo.inactive
                  ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
              }
            >
              <AlertCircle
                className={
                  conflictInfo.hasConflict || conflictInfo.incompatibleSubject || conflictInfo.inactive
                    ? 'h-4 w-4 text-red-600'
                    : 'h-4 w-4 text-emerald-600'
                }
              />
              <AlertDescription className="text-sm space-y-1">
                {conflictInfo.inactive && <p>Giáo viên này đang bị vô hiệu hóa, không thể chuyển.</p>}
                {conflictInfo.incompatibleSubject && (
                  <p>{conflictInfo.subjectMessage || 'Giáo viên không phù hợp môn học của lớp.'}</p>
                )}
                {conflictInfo.hasConflict && (
                  <p>
                    Phát hiện {conflictInfo.conflicts.length} xung đột lịch trong khoảng áp dụng. Vui lòng chọn giáo viên khác hoặc điều chỉnh thời gian.
                  </p>
                )}
                {!conflictInfo.hasConflict && !conflictInfo.incompatibleSubject && !conflictInfo.inactive && (
                  <p>Không phát hiện vấn đề nào với giáo viên này trong khoảng áp dụng.</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search Teacher */}
          <div className="space-y-2">
            <Label htmlFor="search-teacher">Tìm kiếm giáo viên thay thế</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search-teacher"
                placeholder="Tìm kiếm theo tên, email, mã giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Available Teachers List */}
          <div className="space-y-2">
            <Label>Chọn giáo viên thay thế</Label>
            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              {isLoadingTeachers ? (
                <div className="p-8 text-center text-gray-500">
                  Đang tải danh sách giáo viên...
                </div>
              ) : availableTeachers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Không tìm thấy giáo viên phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {availableTeachers.map((teacher: any) => {
                    const isSelected = selectedTeacherId === teacher.id;
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(teacher.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={teacher.avatar}
                              alt={teacher.name}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {getInitials(teacher.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {teacher.name || '-'}
                              </p>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 mt-1">
                              {teacher.code && (
                                <div>
                                  <CodeDisplay
                                    code={teacher.code}
                                    hiddenLength={4}
                                  />
                                </div>
                              )}
                              {teacher.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{teacher.email}</span>
                                </div>
                              )}
                              {teacher.phone && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{teacher.phone}</span>
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

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Lý do chuyển giáo viên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reason"
              placeholder="Nhập lý do chuyển giáo viên..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Reason Detail */}
          <div className="space-y-2">
            <Label htmlFor="reason-detail">Chi tiết lý do (tùy chọn)</Label>
            <Textarea
              id="reason-detail"
              placeholder="Nhập chi tiết lý do..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
            />
          </div>

          {/* Temporary Toggle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-temporary"
                checked={isTemporary}
                onCheckedChange={(v: any) => setIsTemporary(!!v)}
              />
              <Label htmlFor="is-temporary" className="cursor-pointer">
                Chuyển tạm thời
              </Label>
            </div>
          </div>

          {/* Effective & End Dates (when temporary) */}
          {isTemporary && (
            <>
              <div className="space-y-2">
                <Label htmlFor="effective-date">
                  Ngày có hiệu lực <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="substitute-end-date">
                  Ngày kết thúc tạm thời <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="substitute-end-date"
                  type="date"
                  value={substituteEndDate}
                  onChange={(e) => setSubstituteEndDate(e.target.value)}
                  min={effectiveDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}

          {/* Selected Teacher Preview */}
          {selectedTeacher && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Giáo viên đã chọn
              </h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedTeacher.avatar}
                    alt={selectedTeacher.name}
                  />
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {getInitials(selectedTeacher.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {selectedTeacher.name || '-'}
                  </p>
                  {selectedTeacher.email && (
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedTeacher.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={
              !selectedTeacherId ||
              !reason.trim() ||
              transferMutation.isPending ||
              (conflictInfo?.hasConflict ?? false)
            }
            className="w-full"
          >
            {transferMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> + 'Đang xử lý...' : 'Chuyển giáo viên'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

