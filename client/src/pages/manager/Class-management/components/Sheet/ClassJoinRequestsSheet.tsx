import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Loader2
} from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentClassRequestService from '../../../../../services/center-owner/student-class-request.service';

interface ClassJoinRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
}

export const ClassJoinRequestsSheet = ({
  open,
  onOpenChange,
  classData
}: ClassJoinRequestsSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch requests khi sheet mở
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ['class-join-requests', classData?.id, currentPage, searchQuery],
    queryFn: () => studentClassRequestService.getAllRequests({
      classId: classData?.id,
      page: currentPage,
      limit: itemsPerPage,
    }),
    enabled: open && !!classData?.id,
    refetchInterval: 3000, // Refetch mỗi 3s khi sheet đang mở
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => studentClassRequestService.approveRequest(requestId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã phê duyệt yêu cầu tham gia lớp học",
      });
      refetch();
      // Invalidate alerts để update badge count
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['classJoinRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể phê duyệt yêu cầu",
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => studentClassRequestService.rejectRequest(requestId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã từ chối yêu cầu tham gia lớp học",
      });
      refetch();
      // Invalidate alerts để update badge count
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['classJoinRequests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể từ chối yêu cầu",
        variant: "destructive",
      });
    },
  });

  // Reset page khi đổi classId
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [classData?.id, open]);

  const requests = requestsData?.data || [];
  const meta = requestsData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1, pendingCount: 0 };
  console.log(requestsData);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Check className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleApprove = (requestId: string) => {
    approveMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate(requestId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Client-side filtering nếu có search query
  const filteredRequests = searchQuery
    ? requests.filter((req: any) => 
        req.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          </div>

          {classData?.name && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900">{classData.name}</div>
              {classData.classCode && (
                <div className="text-xs text-purple-700 mt-1">Mã lớp: {classData.classCode}</div>
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
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                {meta.total || 0} Chờ duyệt
              </Badge>
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                {meta.total || 0} Tổng
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
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có yêu cầu tham gia lớp học'}
              </p>
            </div>
          ) : (
            <>
              {/* Request List */}
              <div className="space-y-3">
                {paginatedRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-blue-200">
                            <AvatarImage src="" alt={request.student.fullName} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getInitials(request.student.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{request.student.fullName}</div>
                            <div className="text-xs text-gray-600">Học sinh</div>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Student Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{request.student.email}</span>
                        </div>
                        {request.student.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{request.student.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Parent Info */}
                      {request.parent && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                          <div className="text-xs font-medium text-gray-500">Phụ huynh</div>
                          <div className="text-sm font-medium">{request.parent.fullName}</div>
                          <div className="text-xs text-gray-600">{request.parent.email}</div>
                          {request.parent.phone && (
                            <div className="text-xs text-gray-600">{request.parent.phone}</div>
                          )}
                        </div>
                      )}

                      {/* Message */}
                      {request.message && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            Lời nhắn
                          </div>
                          <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                            {request.message}
                          </div>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Gửi lúc: {formatDate(request.createdAt)}
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 mr-1" />
                            )}
                            Phê duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-3 border-t">
                  <div className="text-sm text-gray-600">
                    {meta.total === 0 
                      ? '0-0 trong 0' 
                      : `${(meta.page - 1) * meta.limit + 1}-${Math.min(meta.page * meta.limit, meta.total)} trong ${meta.total}`
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1 || isLoading}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
      </SheetContent>
    </Sheet>
  );
};

export default ClassJoinRequestsSheet;

