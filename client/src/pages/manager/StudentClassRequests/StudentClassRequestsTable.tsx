import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentClassRequestService, {
  StudentClassRequest,
  GetRequestsParams,
} from '../../../services/center-owner/student-class-request.service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {    
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; variant: any; color: string }> = {
  pending: {
    label: 'Chờ duyệt',
    variant: 'default' as const,
    color: 'text-yellow-600',
  },
  approved: {
    label: 'Đã chấp nhận',
    variant: 'default' as const,
    color: 'text-green-600',
  },
  rejected: {
    label: 'Đã từ chối',
    variant: 'destructive' as const,
    color: 'text-red-600',
  },
  under_review: {
    label: 'Đang xem xét',
    variant: 'secondary' as const,
    color: 'text-blue-600',
  },
  cancelled: {
    label: 'Đã hủy',
    variant: 'outline' as const,
    color: 'text-gray-600',
  },
  expired: {
    label: 'Đã hết hạn',
    variant: 'outline' as const,
    color: 'text-gray-600',
  },
};

interface StudentClassRequestsTableProps {
  filterStatus?: string;
}

export const StudentClassRequestsTable: React.FC<StudentClassRequestsTableProps> = ({
  filterStatus,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<StudentClassRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const params: GetRequestsParams = {
    page,
    limit: 10,
    ...(filterStatus && { status: filterStatus }),
  };

  // Query danh sách requests
  const {
    data: requestsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['student-class-requests', params],
    queryFn: () => studentClassRequestService.getAllRequests(params),
    refetchInterval: 30000, // Auto refresh mỗi 30s
  });

  // Mutation approve
  const approveMutation = useMutation({
    mutationFn: (id: string) => studentClassRequestService.approveRequest(id),
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: data.message,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['student-class-requests'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowApproveDialog(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra khi chấp nhận yêu cầu',
        variant: 'destructive',
      });
    },
  });

  // Mutation reject
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      studentClassRequestService.rejectRequest(id, reason),
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: data.message,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['student-class-requests'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra khi từ chối yêu cầu',
        variant: 'destructive',
      });
    },
  });

  const handleApprove = (request: StudentClassRequest) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const handleReject = (request: StudentClassRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate(selectedRequest.id);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ id: selectedRequest.id, reason: rejectReason });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu tham gia lớp học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu tham gia lớp học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Có lỗi xảy ra: {(error as any)?.message || 'Không thể tải dữ liệu'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const requests = requestsData?.data || [];
  const meta = requestsData?.meta;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yêu cầu tham gia lớp học</CardTitle>
              <CardDescription>
                Quản lý yêu cầu tham gia lớp học từ phụ huynh
              </CardDescription>
            </div>
            {meta && meta.pendingCount > 0 && (
              <Badge variant="default" className="text-lg px-3 py-1">
                {meta.pendingCount} chờ duyệt
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Không có yêu cầu nào</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học sinh</TableHead>
                      <TableHead>Phụ huynh</TableHead>
                      <TableHead>Lớp học</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.parent ? (
                            <div>
                              <div className="font-medium">
                                {request.parent.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.parent.phone}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{request.class.name}</div>
                          {request.class.teacher && (
                            <div className="text-sm text-gray-500">
                              GV: {request.class.teacher.fullName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{request.class.subject || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(request.createdAt)}</div>
                            {request.processedAt && (
                              <div className="text-gray-500">
                                Xử lý: {formatDate(request.processedAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_CONFIG[request.status]?.variant || 'default'}>
                            {STATUS_CONFIG[request.status]?.label || request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Chấp nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Đã xử lý</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Trang {meta.page} / {meta.totalPages} (Tổng: {meta.total})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={meta.page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={meta.page === meta.totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận chấp nhận yêu cầu</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-4 space-y-2">
                  <p>
                    Bạn có chắc chắn muốn chấp nhận yêu cầu tham gia lớp học cho:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <p>
                      <strong>Học sinh:</strong> {selectedRequest.student.fullName}
                    </p>
                    <p>
                      <strong>Lớp học:</strong> {selectedRequest.class.name}
                    </p>
                    <p>
                      <strong>Môn học:</strong> {selectedRequest.class.subject || 'N/A'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Học sinh sẽ được ghi danh vào lớp học ngay lập tức.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={approveMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Chấp nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="mt-4 space-y-4">
                  <p>Bạn có chắc chắn muốn từ chối yêu cầu này?</p>
                  <div className="bg-gray-50 p-3 rounded-md space-y-1">
                    <p>
                      <strong>Học sinh:</strong> {selectedRequest.student.fullName}
                    </p>
                    <p>
                      <strong>Lớp học:</strong> {selectedRequest.class.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reject-reason">
                      Lý do từ chối (tùy chọn)
                    </Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Nhập lý do từ chối..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={rejectMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

