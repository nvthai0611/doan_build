"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, User, Eye } from "lucide-react"
import { DataTable, Column } from "../../../../../../components/common/Table/DataTable"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ParentService } from "../../../../../../services/center-owner/parent-management/parent.service"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { PaymentStatus, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "../../../../../../lib/constants"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Input } from "@/components/ui/input"


interface ParentPaymentsTabProps {
  parentData: any
}

export const ParentPaymentsTab: React.FC<ParentPaymentsTabProps> = ({ parentData }) => {
  const queryClient = useQueryClient()
  const allPayments = parentData?.payments || []
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partially_paid' | 'pending'>('all')
  const [searchCode, setSearchCode] = useState<string>("")
  // filter payments for history (completed / partially_paid) according to statusFilter
  const payments = useMemo(() => {
    const filtered =
      statusFilter === 'all'
        ? allPayments.filter((p: any) =>
            ['completed', 'partially_paid', 'pending'].includes(String(p?.status))
          )
        : allPayments.filter((p: any) => String(p?.status) === statusFilter)

    // Lọc theo transactionCode / orderCode / reference
    const term = searchCode.trim().toLowerCase()
    const byCode = term
      ? filtered.filter((p: any) => {
          const code = String(p?.transactionCode || p?.orderCode || p?.reference || "").toLowerCase()
          return code.includes(term)
        })
      : filtered

    const getTs = (p: any) => {
      const d = p?.updatedAt || p?.paidAt || p?.orderDate || p?.createdAt
      return d ? new Date(d).getTime() : 0
    }

    // Sort DESC by updatedAt (fallback paidAt -> orderDate -> createdAt)
    return [...byCode].sort((a, b) => getTs(b) - getTs(a))
  }, [allPayments, statusFilter, searchCode])
  const [paymentPage, setPaymentPage] = useState(1)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [paymentDetail, setPaymentDetail] = useState<any>(null)
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  // State for status update
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const formatDate = (date: string | Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return '-'
    return Number(amount)?.toLocaleString('vi-VN') + ' đ'
  }

// Xóa BadgeVariant và variants cũ, thay bằng badge theo constants
const getStatusBadge = (status: string) => {
  const statusKey = status as PaymentStatus
  const label = PAYMENT_STATUS_LABELS[statusKey] || status
  const colorClass = PAYMENT_STATUS_COLORS[statusKey] || 'border-gray-500 text-gray-700 bg-gray-50'
  return (
    <Badge variant="outline" className={`${colorClass} border-2 font-medium`}>
      {label}
    </Badge>
  )
}

  const getMethodBadge = (method: string) => {
    const methodConfig: Record<string, { label: string; color: string }> = {
      cash: { 
        label: "Tiền mặt", 
        color: "border-emerald-500 text-emerald-700 bg-emerald-50" 
      },
      bank_transfer: { 
        label: "Chuyển khoản", 
        color: "border-blue-500 text-blue-700 bg-blue-50" 
      },
      card: { 
        label: "Thẻ", 
        color: "border-purple-500 text-purple-700 bg-purple-50" 
      },
      online: { 
        label: "Online", 
        color: "border-indigo-500 text-indigo-700 bg-indigo-50" 
      }
    }
    
    const config = methodConfig[method] || { 
      label: method, 
      color: "border-gray-500 text-gray-700 bg-gray-50" 
    }
    
    return (
      <Badge variant="outline" className={`${config.color} border-2 font-medium`}>
        {config.label}
      </Badge>
    )
  }

  // Fetch payment details and open modal
  const openDetail = async (paymentId: string) => {
    try {
      setDetailError(null)
      setDetailLoading(true)
      setIsDetailOpen(true)
      const res = await ParentService.getPaymentDetailsOfParent(paymentId, parentData.id) 
      
      if (!res.success) {
        toast.error('Không tìm thấy chi tiết thanh toán')
        setDetailError('Không tìm thấy chi tiết thanh toán')
        setPaymentDetail(null)
        return
      }
      
      const data = res.data 
      const mappedAllocations =
        data.allocations ??
        data.feeRecordPayments?.map((frp: any) => ({
          feeRecordPaymentId: frp.id,
          feeRecordId: frp.feeRecordId,
          studentName: frp.feeRecord?.student?.user?.fullName || frp.studentName,
          className: frp.feeRecord?.class?.name || frp.className,
          classCode: frp.feeRecord?.class?.classCode || frp.classCode,
          feeName: frp.feeRecord?.feeStructure?.name || frp.feeName,
          amount: frp.amount ?? frp.feeRecord?.amount,
          notes: frp.notes ?? frp.note ?? null,
        })) ?? []

      const unifiedDetail = {
        ...data,
        allocations: mappedAllocations,
      }
      
      setPaymentDetail(unifiedDetail)
      setSelectedStatus(data.status || 'pending')
    } catch (err: any) {
      console.error('Error fetching payment detail:', err)
      setDetailError(err?.message || 'Lỗi khi lấy chi tiết')
      setPaymentDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }
  
  const closeDetail = () => {
    setIsDetailOpen(false)
    setPaymentDetail(null)
    setDetailError(null)
    setDetailLoading(false)
    setSelectedStatus('')
  }

  const handleUpdateStatus = async () => {
    if (!paymentDetail?.id) {
      toast.error('Không xác định được thanh toán')
      return
    }

    if (!selectedStatus || selectedStatus === paymentDetail.status) {
      toast.warning('Vui lòng chọn trạng thái khác với trạng thái hiện tại')
      return
    }

    setIsUpdatingStatus(true)
    try {
      const result = await ParentService.updatePaymentStatus(
        paymentDetail.id,
        selectedStatus
      )

      toast.success(result.message || 'Cập nhật trạng thái thành công')
      
      // Invalidate queries để reload dữ liệu
      await queryClient.invalidateQueries({
        queryKey: ['parent-detail', parentData.id],
      })
      
      closeDetail()
    } catch (err: any) {
      console.error('Error updating payment status:', err)
      toast.error(err?.message || 'Lỗi khi cập nhật trạng thái')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Columns for payment history
  const paymentColumns: Column<any>[] = [
    
    {
      key: "student",
      header: "Học sinh",
      render: (payment) => {
        // payment may come from formattedPayments (allocations) or raw
        const studentName = payment.feeRecordPayments?.[0]?.feeRecord?.student?.user?.fullName
          || payment.allocations?.[0]?.studentName
          || payment?.studentName
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{studentName || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      key: "feeStructure",
      header: "Khoản phí",
      render: (payment) => (
        <div className="text-sm">
          <div className="font-medium">
            {payment.feeRecordPayments?.[0]?.feeRecord?.feeStructure?.name || payment.allocations?.[0]?.feeName || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (payment) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(Number(payment.amount))}
        </span>
      ),
      align: "right",
    },
    {
      key: "paidAt",
      header: "Ngày thanh toán",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(payment.paidAt || payment.date)}</span>
        </div>
      ),
    },
    {
      key: "method",
      header: "Phương thức",
      render: (payment) => (
          <>
          {getMethodBadge(payment.method)}
          </>
        
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (payment) => getStatusBadge(payment.status),
      align: "center",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (payment) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => openDetail(payment.id || payment.transactionCode || payment.orderCode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Chi tiết
          </Button>
        </div>
      ),
      align: "right",
    },
  ]

  const pagedPayments = payments.slice(
    (paymentPage - 1) * rowsPerPage,
    paymentPage * rowsPerPage
  )
  
  const paymentPagination = {
    currentPage: paymentPage,
    totalPages: Math.ceil(payments.length / rowsPerPage) || 1,
    totalItems: payments.length,
    itemsPerPage: rowsPerPage,
    onPageChange: setPaymentPage,
    onItemsPerPageChange: (r: number) => {
      setRowsPerPage(r);
      setPage(1);
    },
    showItemsPerPage: true,
    showPageInfo: true,
  }

  // Render filter controls above summary
  // ...don't early return so both tables can show their own empty states
  
  // Filter UI
  const StatusButton = ({ value, label }: { value: 'all' | 'completed' | 'partially_paid' | 'pending'; label: string }) => (
    <Button
      variant={statusFilter === value ? 'default' : 'ghost'}
      size="sm"
      onClick={() => {
        setStatusFilter(value)
        setPaymentPage(1)
      }}
    >
      {label}
    </Button>
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đã thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(parentData.paymentStats?.totalPaid || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parentData.paymentStats?.paymentCount || 0} giao dịch
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lọc trạng thái:</span>
          <StatusButton value="all" label="Tất cả" />
          <StatusButton value="completed" label="Hoàn thành" />
          <StatusButton value="partially_paid" label="Thanh toán một phần" />
          <StatusButton value="pending" label="Chưa thanh toán" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value)
              setPaymentPage(1)
            }}
            placeholder="Tìm theo mã giao dịch..."
            className="w-[260px]"
          />
        </div>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pagedPayments}
            columns={paymentColumns}
            emptyMessage="Chưa có giao dịch thanh toán nào"
            className="mt-2"
            enableSearch
            striped
            pagination={paymentPagination}
          />
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => { if (!open) closeDetail(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            <DialogDescription>
              Mã giao dịch : {paymentDetail?.transactionCode || paymentDetail?.orderCode || '-'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {detailLoading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
            {detailError && <div className="text-sm text-destructive">{detailError}</div>}
            {!detailLoading && !detailError && paymentDetail && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Số tiền</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(paymentDetail.amount || paymentDetail.totalAmount)}
                    </div>
                  </div>
                  {paymentDetail.status === 'partially_paid' && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Đã trả</div>
                      <div className="text-xl font-medium text-green-600">
                        {formatCurrency(Number(paymentDetail.paidAmount ?? paymentDetail.paid ?? 0))}
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Trạng thái</div>
                    <div className="mt-1">{getStatusBadge(paymentDetail.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Phương thức</div>
                    <div className="font-medium">{getMethodBadge(paymentDetail.method)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Mã tham chiếu</div>
                    <div className="font-medium">{paymentDetail.reference || paymentDetail.transactionCode || '-'}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Ngày tạo</div>
                    <div className="font-medium">{formatDate(paymentDetail.orderDate || paymentDetail.createdAt)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Hạn thanh toán</div>
                    <div className="font-medium">{formatDate(paymentDetail.expirationDate)}</div>
                  </div>             
                  {paymentDetail.status == 'completed' && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Ngày thanh toán</div>
                      <div className="font-medium">{formatDate(paymentDetail.paidAt || paymentDetail.completedAt)}</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Ghi chú</div>
                  <div className="p-3 rounded-md bg-muted text-sm">{paymentDetail.notes || '-'}</div>
                </div>

                {/* Status Update Section */}
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-3">Cập nhật trạng thái thanh toán</div>
                  <div className="flex items-center gap-3">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chưa thanh toán</SelectItem>
                        <SelectItem value="partially_paid">Thanh toán một phần</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleUpdateStatus}
                      disabled={isUpdatingStatus || selectedStatus === paymentDetail.status}
                    >
                      {isUpdatingStatus ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                  </div>
                </div>

                {/* Allocations */}
                <div>
                  <div className="text-sm font-semibold mb-2">Chi tiết phân bổ</div>
                  <div className="mt-2 space-y-2">
                    {(paymentDetail.allocations || []).map((a: any) => (
                      <div key={a.feeRecordPaymentId || a.feeRecordId || Math.random()} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">{a.studentName || 'Học sinh'}</div>
                            <div className="text-xs text-muted-foreground">{a.className ? `${a.className} (${a.classCode || ''})` : ''}</div>
                            <div className="text-xs text-muted-foreground">{a.feeName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{formatCurrency(a.amount)}</div>
                            <div className="text-xs text-muted-foreground">Ghi chú: {a.notes || '-'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(paymentDetail.allocations || []).length === 0 && (
                      <div className="text-sm text-muted-foreground">Không có phân bổ</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDetail} disabled={isUpdatingStatus}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
