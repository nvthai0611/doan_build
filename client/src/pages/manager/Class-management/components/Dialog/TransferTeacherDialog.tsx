import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, User, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { apiClient } from '../../../../../utils/clientAxios';
import { useToast } from '../../../../../hooks/use-toast';
import { classService } from '../../../../../services/center-owner/class-management/class.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeDisplay } from '../../../../../components/common/CodeDisplay';
import { Checkbox } from '@/components/ui/checkbox';

interface TransferTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
}

export const TransferTeacherDialog = ({
  open,
  onOpenChange,
  classData,
}: TransferTeacherDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [substituteEndDate, setSubstituteEndDate] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedTeacherId('');
      setReason('');
      setReasonDetail('');
      setEffectiveDate('');
      setIsTemporary(false);
      setSubstituteEndDate('');
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
        limit: 50,
      };

      if (debouncedSearch?.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (classData?.subject) {
        params.subject = classData.subject.name;
      }

      const response = await apiClient.get('/admin-center/teachers', { params });
      return response;
    },
    enabled: open && !!classData,
    staleTime: 2000,
  });

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

    // Validate temporary transfer dates
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chuyển giáo viên</DialogTitle>
          <DialogDescription>
            Chuyển giáo viên cho lớp học này và áp dụng ngay cho các buổi phù hợp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Teacher Info */}
          {currentTeacher && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={currentTeacher.user?.avatar}
                    alt={currentTeacher.user?.fullName}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(currentTeacher.user?.fullName || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Giáo viên hiện tại
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentTeacher.user?.fullName || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                              <p className="font-medium">{teacher.name || '-'}</p>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              {teacher.code && (
                                <CodeDisplay code={teacher.code} hiddenLength={4} />
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
              <Checkbox id="is-temporary" checked={isTemporary} onCheckedChange={(v:any) => setIsTemporary(!!v)} />
              <Label htmlFor="is-temporary" className="cursor-pointer">Chuyển tạm thời</Label>
            </div>
          </div>

          {/* Effective & End Dates (when temporary) */}
          {isTemporary && (
            <>
              <div className="space-y-2">
                <Label htmlFor="effective-date">Ngày có hiệu lực <span className="text-red-500">*</span></Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="substitute-end-date">Ngày kết thúc tạm thời <span className="text-red-500">*</span></Label>
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

          {/* Info Alert */}
          {selectedTeacher && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Việc chuyển giáo viên sẽ được áp dụng ngay cho các buổi học trong phạm vi đã chọn.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={transferMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedTeacherId ||
              !reason.trim() ||
              transferMutation.isPending
            }
          >
            {transferMutation.isPending ? 'Đang xử lý...' : 'Tạo yêu cầu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

