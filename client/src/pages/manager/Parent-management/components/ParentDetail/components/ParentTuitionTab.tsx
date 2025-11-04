'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, User, AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ParentService } from '../../../../../../services/center-owner/parent-management/parent.service';
import {
  DataTable,
  Column,
} from '../../../../../../components/common/Table/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { FeeRecordStatus, FEE_RECORD_STATUS_LABELS, FEE_RECORD_STATUS_COLORS } from '../../../../../../lib/constants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ParentTuitionTabProps {
  parentData: any;
}

export function ParentTuitionTab({ parentData }: ParentTuitionTabProps) {
  const queryClient = useQueryClient();
  const pendingFees = parentData?.pendingFees || [];
  const students = parentData?.students || [];
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [cashGiven, setCashGiven] = useState<string>(''); // số tiền khách đưa
  const [notes, setNotes] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const pagedPendingFees = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return pendingFees.slice(start, start + rowsPerPage);
  }, [pendingFees, page, rowsPerPage]);

  const pagination = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(pendingFees.length / rowsPerPage)),
    totalItems: pendingFees.length,
    itemsPerPage: rowsPerPage,
    onPageChange: (p: number) => setPage(p),
    onItemsPerPageChange: (r: number) => {
      setRowsPerPage(r);
      setPage(1);
    },
    showItemsPerPage: true,
    showPageInfo: true,
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '-';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const getStatusBadge = (status: string) => {
    const statusKey = status as FeeRecordStatus;
    const label = FEE_RECORD_STATUS_LABELS[statusKey] || status;
    const colorClass = FEE_RECORD_STATUS_COLORS[statusKey] || 'border-gray-500 text-gray-700 bg-gray-50';
    
    return (
      <Badge variant="outline" className={`${colorClass} border-2 font-medium`}>
        {label}
      </Badge>
    );
  };

  // Tính tổng học phí (tất cả các fee)
  const totalFees = useMemo(
    () =>
      pendingFees.reduce(
        (sum: number, fee: any) => sum + Number(fee.amount || 0),
        0,
      ),
    [pendingFees],
  );

  // Tổng đã thanh toán sẽ được tính từ các payment có status completed/partially_paid
  const totalPaid = useMemo(() => {
    const payments = parentData?.payments || [];
    return payments.reduce((sum: number, payment: any) => {
      if (payment.status === 'completed') {
        return sum + Number(payment.amount || 0);
      }
      if (payment.status === 'partially_paid') {
        return sum + Number(payment.paidAmount || 0);
      }
      return sum;
    }, 0);
  }, [parentData?.payments]);

  const columns: Column<any>[] = [
    {
      key: 'student',
      header: 'Học sinh',
      render: (fee) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {fee.student?.user?.fullName || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {students.find((s: any) => s.id === fee.studentId)?.studentCode ||
                ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'feeName',
      header: 'Khoản phí',
      render: (fee) => (
        <div className="text-sm">
          <div className="font-medium">{fee.feeStructure?.name || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Hạn thanh toán',
      render: (fee) => {
        const isOverdue = fee.dueDate
          ? new Date(fee.dueDate) < new Date()
          : false;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div
                className={`text-sm ${
                  isOverdue ? 'text-red-600 font-medium' : ''
                }`}
              >
                {formatDate(fee.dueDate)}
              </div>
              {isOverdue && (
                <div className="text-xs text-destructive">Quá hạn</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Tổng tiền',
      align: 'right',
      render: (fee) => (
        <div className="font-medium text-right">
          {formatCurrency(Number(fee.totalAmount))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (fee) => getStatusBadge(fee.status),
      align: 'center',
    },
  ];

  const selectedFees = useMemo(() => {
    return (pendingFees || []).filter((f: any) => selectedItems.includes(f.id));
  }, [pendingFees, selectedItems]);

  // Tổng tiền thực thu: ưu tiên totalAmount (đã trừ giảm giá), fallback amount
  const selectedTotalAmount = useMemo(() => {
    return selectedFees.reduce(
      (sum: number, fee: any) =>
        sum + Number(fee.totalAmount ?? fee.amount ?? 0),
      0,
    );
  }, [selectedFees]);

  const cashGivenNumber = useMemo(() => {
    // Robust: luôn loại bỏ ký tự không phải số trước khi parse
    const numeric = String(cashGiven).replace(/[^\d]/g, '');
    const n = Number(numeric);
    return Number.isFinite(n) ? n : 0;
  }, [cashGiven]);

  const changeAmount = Math.max(0, cashGivenNumber - selectedTotalAmount);
  const canPayNow =
    selectedFees.length > 0 &&
    !creating &&
    selectedTotalAmount > 0 &&
    cashGivenNumber >= selectedTotalAmount;

  const handleOpenConfirm = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 hóa đơn để tạo.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmCreate = async (payNow = false) => {
    if (!parentData?.id) {
      toast.error('Không xác định được phụ huynh.');
      return;
    }

    if (payNow && cashGivenNumber < selectedTotalAmount) {
      toast.error('Số tiền khách đưa chưa đủ để thanh toán.');
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        feeRecordIds: selectedItems,
        payNow: payNow,
        method: payNow ? 'cash' : 'bank_transfer',
      };

      // Thêm cashGiven nếu thanh toán tiền mặt
      if (payNow && cashGivenNumber > 0) {
        payload.cashGiven = cashGivenNumber;
      }

      // Thêm notes nếu có
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const resp = await ParentService.createBillForParent(
        parentData.id,
        payload,
      );

      const message = resp?.message || 'Tạo hóa đơn thành công';
      toast.success(message);
      
      setSelectedItems([]);
      setCashGiven('');
      setNotes('');
      setConfirmOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ['parent-detail', parentData.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ['parent-payments', parentData.id],
      });
    } catch (err: any) {
      console.error('Error creating bill:', err);
      toast.error(err?.message || 'Lỗi khi tạo hóa đơn');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học phí cần thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalFees)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingFees.length} hóa đơn
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            if (selectedItems.length === pendingFees.length)
              setSelectedItems([]);
            else setSelectedItems(pendingFees.map((f: any) => f.id));
          }}
        >
          {selectedItems.length === pendingFees.length
            ? 'Bỏ chọn tất cả'
            : 'Chọn tất cả'}
        </Button>
        <Button
          onClick={handleOpenConfirm}
          disabled={selectedItems.length === 0}
        >
          Tạo hóa đơn ({selectedItems.length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pagedPendingFees}
            columns={columns}
            emptyMessage="Không có học phí chưa thanh toán"
            enableSearch
            striped
            enableCheckbox
            selectedItems={selectedItems}
            onSelectionChange={(items) => setSelectedItems(items)}
            getItemId={(item) => item.id}
            allData={pendingFees}
            pagination={pagination}
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Confirm modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Xác nhận tạo hóa đơn</DialogTitle>
            <DialogDescription>
              Kiểm tra chi tiết các khoản trước khi tạo
              {selectedItems.length > 1 ? ' các' : ''} hóa đơn.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Danh sách fees */}
            <div className="space-y-3">
              {selectedFees.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Không có mục nào được chọn.
                </div>
              ) : (
                selectedFees.map((fee: any) => {
                  const isOverdue = fee.dueDate
                    ? new Date(fee.dueDate) < new Date()
                    : false;
                  const student =
                    fee.student ||
                    students.find((s: any) => s.id === fee.studentId);
                  
                  const originalAmount = Number(fee.feeStructure?.amount || fee.amount || 0);
                  const discountPercent = Number(fee.scholarship || 0);
                  const discountAmount = (originalAmount * discountPercent) / 100;
                  const finalAmount = Number(fee.totalAmount || fee.amount || 0);
                  
                  return (
                    <div
                      key={fee.id}
                      className="border rounded-md p-3 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {fee.feeStructure?.name || 'Khoản phí'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Học sinh: {student?.user?.fullName || 'N/A'}
                            {student?.studentCode
                              ? ` • ${student.studentCode}`
                              : ''}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            Hạn:{' '}
                            <span
                              className={
                                isOverdue ? 'text-red-600 font-medium' : ''
                              }
                            >
                              {formatDate(fee.dueDate)}
                            </span>
                            {isOverdue && (
                              <Badge variant="destructive" className="ml-2">
                                Quá hạn
                              </Badge>
                            )}
                          </div>
                          {fee.notes && (
                            <div className="text-xs text-muted-foreground">
                              Ghi chú: {fee.notes}
                            </div>
                          )}
                          <div className="mt-1">
                            {getStatusBadge(fee.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-md p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Học phí gốc:</span>
                          <span className="font-medium">{formatCurrency(originalAmount)}</span>
                        </div>
                        
                        {discountPercent > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Học bổng/Giảm giá ({discountPercent}%):
                              </span>
                              <span className="font-medium text-green-600">
                                -{formatCurrency(discountAmount)}
                              </span>
                            </div>
                            <div className="border-t pt-2"></div>
                          </>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Thành tiền:</span>
                          <span className="font-semibold text-lg text-orange-600">
                            {formatCurrency(finalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tổng tiền */}
            <div className="border-t pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  Đã chọn:{' '}
                  <span className="font-medium">{selectedFees.length}</span> khoản
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-sm">
                    Tổng tiền:{' '}
                    <span className="font-semibold text-lg text-orange-600">
                      {formatCurrency(selectedTotalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Khu vực thanh toán */}
            <div className="rounded-md border p-3 space-y-3 bg-muted/30">
              <div className="text-sm font-medium">Thanh toán tại quầy</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Thành tiền</span>
                <span className="font-semibold">{formatCurrency(selectedTotalAmount)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm">Khách đưa</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={cashGiven === '' ? '' : Number(String(cashGiven).replace(/[^\d]/g, '')).toLocaleString('vi-VN')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    setCashGiven(raw);
                  }}
                  className="w-48 text-right"
                  placeholder="0"
                />
              </div>
              {cashGiven !== '' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tiền thừa</span>
                    <span className={`${cashGivenNumber >= selectedTotalAmount ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {cashGivenNumber >= selectedTotalAmount
                        ? formatCurrency(Math.max(0, cashGivenNumber - selectedTotalAmount))
                        : `Thiếu ${formatCurrency(selectedTotalAmount - cashGivenNumber)}`}
                    </span>
                  </div>
                  {cashGivenNumber < selectedTotalAmount && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Số tiền khách đưa chưa đủ để thanh toán.
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCashGiven(String(Math.floor(selectedTotalAmount)))}
                >
                  Đủ tiền
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCashGiven('')}
                >
                  Xóa
                </Button>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú cho hóa đơn..."
                rows={3}
                className="resize-none"
                maxLength={500}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {notes.length}/500
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setCashGiven('');
                setNotes('');
              }}
              disabled={creating}
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleConfirmCreate(true)}
              disabled={creating || selectedFees.length === 0 || cashGivenNumber < selectedTotalAmount}
            >
              {creating ? 'Đang xử lý...' : 'Tạo và thanh toán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
