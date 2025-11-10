import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  X,
  Search,
  Check,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import studentClassRequestService from '../../../../../services/center-owner/student-class-request.service';
import { enrollmentService } from '../../../../../services/center-owner/enrollment/enrollment.service';
import * as Popover from '@radix-ui/react-popover';

interface ClassJoinRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
}

export const ClassJoinRequestsSheet = ({
  open,
  onOpenChange,
  classData,
}: ClassJoinRequestsSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [openedImage, setOpenedImage] = useState<string | null>(null); // mới
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [isApproveAll, setIsApproveAll] = useState(false);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Fetch requests khi sheet mở
  const {
    data: requestsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['class-join-requests', classData?.id, currentPage, debouncedSearch],
    queryFn: () =>
      studentClassRequestService.getAllRequests({
        classId: classData?.id,
        status: 'pending',
        page: currentPage,
        limit: itemsPerPage,
      }),
    enabled: !!open && !!classData?.id,
    staleTime: 30000, // 30s
    refetchOnWindowFocus: true,
  });

  // Get current class capacity info
  const { data: capacityInfo } = useQuery({
    queryKey: ['class-capacity', classData?.id],
    queryFn: () => enrollmentService.checkCapacity(classData?.id),
    enabled: !!classData?.id && open,
    staleTime: 30000,
  });

  const maxStudents = classData?.maxStudents || ((capacityInfo as any)?.data?.maxStudents as number) || null;
  const currentStudents = classData?.currentStudents || ((capacityInfo as any)?.data?.currentStudents as number) || 0;
  
  // Debug log để kiểm tra giá trị
  useEffect(() => {
    if (open) {
      console.log('ClassJoinRequestsSheet - Capacity Info:', {
        maxStudents,
        currentStudents,
        classDataMaxStudents: classData?.maxStudents,
        classDataCurrentStudents: classData?.currentStudents,
        capacityInfoData: (capacityInfo as any)?.data,
      });
    }
  }, [open, maxStudents, currentStudents, classData, capacityInfo]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ requestId, overrideCapacity = false }: { requestId: string; overrideCapacity?: boolean }) =>
      studentClassRequestService.approveRequest(requestId, overrideCapacity),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã phê duyệt yêu cầu tham gia lớp học',
      });
      refetch();
      // Invalidate alerts để update badge count
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['class-join-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể phê duyệt yêu cầu',
        variant: 'destructive',
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      studentClassRequestService.rejectRequest(requestId),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã từ chối yêu cầu tham gia lớp học',
      });
      refetch();
      // Invalidate alerts để update badge count
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['class-join-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể từ chối yêu cầu',
        variant: 'destructive',
      });
    },
  });

  // Reset page khi đổi classId và invalidate queries khi sheet mở để refetch data
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      setSearchQuery('');
      // Invalidate queries để refetch data khi sheet mở
      queryClient.invalidateQueries({ queryKey: ['class-join-requests', classData?.id] });
      queryClient.invalidateQueries({ queryKey: ['class-capacity', classData?.id] });
    }
  }, [classData?.id, open, queryClient]);

  const requests = requestsData?.data || [];
  const meta: any = requestsData?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    pendingCount: 0,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleApprove = async (requestId: string) => {
    console.log('handleApprove - maxStudents:', maxStudents, 'currentStudents:', currentStudents);
    
    if (!maxStudents || maxStudents === 0) {
      // Không có giới hạn, approve trực tiếp
      console.log('No max students limit, approving directly');
      approveMutation.mutate({ requestId, overrideCapacity: false });
      return;
    }

    // Check capacity before approving
    // Cảnh báo khi: đã đầy (availableSlots <= 0) hoặc sẽ vượt quá (newTotalStudents > maxStudents)
    const newTotalStudents = currentStudents + 1;
    const availableSlots = maxStudents - currentStudents;
    
    console.log('Capacity check - newTotalStudents:', newTotalStudents, 'availableSlots:', availableSlots, 'maxStudents:', maxStudents);
    
    // Nếu lớp đã đầy hoặc sẽ vượt quá giới hạn → hiển thị dialog cảnh báo
    if (availableSlots <= 0 || newTotalStudents > maxStudents) {
      console.log('⚠️ Showing capacity warning dialog');
      // Show warning dialog để user xác nhận override capacity
      setPendingRequestId(requestId);
      setIsApproveAll(false);
      setShowCapacityWarning(true);
      return;
    }

    console.log('No capacity issue, approving directly');
    // If no capacity issue, proceed directly
    approveMutation.mutate({ requestId, overrideCapacity: false });
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  const handleApproveAll = async () => {
    const pending = (requestsData?.data || []).filter((r: any) => r.status === 'pending');
    if (pending.length === 0) return;

    if (!maxStudents) {
      // Không có giới hạn, approve trực tiếp tất cả
      for (const req of pending) {
        await approveMutation.mutateAsync({ requestId: req.id, overrideCapacity: false });
      }
      refetch();
      return;
    }

    // Check capacity before approving all
    // Cảnh báo khi: đã đầy (availableSlots <= 0) hoặc sẽ vượt quá (newTotalStudents > maxStudents)
    const newTotalStudents = currentStudents + pending.length;
    const availableSlots = maxStudents - currentStudents;
    
    // Nếu lớp đã đầy hoặc sẽ vượt quá giới hạn → hiển thị dialog cảnh báo
    if (availableSlots <= 0 || newTotalStudents > maxStudents) {
      // Show warning dialog để user xác nhận override capacity
      setPendingRequestIds(pending.map((r: any) => r.id));
      setIsApproveAll(true);
      setShowCapacityWarning(true);
      return;
    }

    // If no capacity issue, proceed directly
    for (const req of pending) {
      await approveMutation.mutateAsync({ requestId: req.id, overrideCapacity: false });
    }
    refetch();
  };

  const handleConfirmWarning = async () => {
    setShowCapacityWarning(false);
    
    if (isApproveAll && pendingRequestIds.length > 0) {
      // Approve all pending requests with overrideCapacity = true
      for (const requestId of pendingRequestIds) {
        await approveMutation.mutateAsync({ requestId, overrideCapacity: true });
      }
      setPendingRequestIds([]);
      setIsApproveAll(false);
      refetch();
    } else if (pendingRequestId) {
      // Approve single request with overrideCapacity = true
      approveMutation.mutate({ requestId: pendingRequestId, overrideCapacity: true });
      setPendingRequestId(null);
    }
  };

  const handleCancelWarning = () => {
    setShowCapacityWarning(false);
    setPendingRequestId(null);
    setPendingRequestIds([]);
    setIsApproveAll(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Client-side filtering nếu có search query
  const filteredRequests = searchQuery
    ? requests.filter(
        (req: any) =>
          req.student.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          req.student.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : requests;

  const totalPages = meta.totalPages;
  const paginatedRequests = filteredRequests;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Danh sách yêu cầu truy cập
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleApproveAll} disabled={isLoading || approveMutation.isPending}>
                {approveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : null}
                Chấp nhận tất cả
              </Button>
            </div>
          </div>

          {classData?.name && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900">
                {classData.name}
              </div>
              {classData.classCode && (
                <div className="text-xs text-purple-700 mt-1">
                  Mã lớp: {classData.classCode}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          {!isLoading && (
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-yellow-50 border-yellow-200 text-yellow-700"
              >
                {meta.pendingCount || 0} Chờ duyệt
              </Badge>
            </div>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            </div>
          ) : paginatedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Không có yêu cầu nào</p>
              <p className="text-gray-400 text-xs mt-1">
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Chưa có yêu cầu tham gia lớp học'}
              </p>
            </div>
          ) : (
            <>
              {/* Compact Request List */}
              <div className="space-y-2">
                {paginatedRequests.map((request: any) => (
                  <Popover.Root open={openedId === request?.id} onOpenChange={open => setOpenedId(open ? request?.id : null)} key={request?.id}>
                    <Popover.Trigger asChild>
                      <div
                        className="group border rounded-md px-3 py-2 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setOpenedId(request.id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={request.student.fullName} />
                              <AvatarFallback>{getInitials(request.student.fullName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{request.student.fullName}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {request.parent?.fullName || 'Phụ huynh'} • {request.parent?.email || 'N/A'} • {request.parent?.phone || 'N/A'}
                              </div>
                              {!request?.commitmentImageUrl && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                                    Chưa có cam kết
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(request.createdAt)}
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex items-center gap-1">
                                <Button size="sm" className="h-7 px-2" onClick={e => { e.stopPropagation(); handleApprove(request.id); }}> <Check className="w-4 h-4" /> </Button>
                                <Button size="sm" variant="outline" className="h-7 px-2" onClick={e => { e.stopPropagation(); handleReject(request.id); }} > <XCircle className="w-4 h-4" /> </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Popover.Trigger>
                    <Popover.Content side="right" align="start" className="z-50 mt-2">
                      {/* Để bạn tự custom chi tiết, mẫu demo như dưới */}
                      <div className="w-[300px] sm:w-[370px] p-4 rounded shadow bg-white border flex flex-col gap-2">
                        <div className="font-semibold text-lg">{request.student.fullName}</div>
                        <div className="text-xs text-gray-600">Phụ huynh: {request.parent?.fullName} - {request.parent?.email}, {request.parent?.phone}</div>
                        {!!request.message && (
                          <div className="text-xs bg-blue-50 border-l-2 border-blue-400 rounded p-2 mt-1">{request?.message}</div>
                        )}
                        {request?.commitmentImageUrl ? (
                          <img
                            src={request?.commitmentImageUrl}
                            className="rounded max-h-[180px] cursor-zoom-in"
                            alt="Bản cam kết"
                            onClick={e => { e.stopPropagation(); window.open(request.commitmentImageUrl, '_blank', 'noopener'); }}
                          />
                        ) : (
                          <div className="text-xs bg-amber-50 border-l-2 border-amber-400 rounded p-2 mt-1 text-amber-800">
                            Chưa có bản cam kết
                          </div>
                        )}
                      </div>
                    </Popover.Content>
                  </Popover.Root>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-3 border-t">
                  <div className="text-sm text-gray-600">
                    {meta.total === 0
                      ? '0-0 trong 0'
                      : `${(meta.page - 1) * meta.limit + 1}-${Math.min(
                          meta.page * meta.limit,
                          meta.total,
                        )} trong ${meta.total}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1 || isLoading}
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
                  <div>
                    Lớp học hiện tại đã có <strong>{currentStudents}</strong> học viên 
                    {maxStudents && ` (tối đa ${maxStudents} học viên)`}.
                  </div>
                  <div>
                    Bạn đang muốn phê duyệt{' '}
                    <strong>
                      {isApproveAll ? pendingRequestIds.length : 1} yêu cầu tham gia lớp học
                    </strong>
                    {isApproveAll && ` (${pendingRequestIds.length} học viên)`}.
                  </div>
                  {maxStudents && (() => {
                    const newTotal = currentStudents + (isApproveAll ? pendingRequestIds.length : 1);
                    const availableSlots = maxStudents - currentStudents;
                    
                    if (availableSlots <= 0) {
                      return (
                        <div className="text-red-600 font-medium">
                          ⚠️ Lớp đã đầy (<strong>{currentStudents}/{maxStudents}</strong>). 
                          Phê duyệt sẽ vượt quá giới hạn.
                        </div>
                      );
                    } else if (newTotal > maxStudents) {
                      return (
                        <div className="text-red-600 font-medium">
                          ⚠️ Tổng số học viên sẽ là <strong>{newTotal}</strong>, 
                          vượt quá giới hạn <strong>{maxStudents} học viên</strong>.
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="pt-2">
                    Bạn có chắc chắn muốn tiếp tục phê duyệt yêu cầu này không?
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelWarning}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmWarning}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Xác nhận phê duyệt
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
};

export default ClassJoinRequestsSheet;
