"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, User, CreditCard, Eye } from "lucide-react"
import { DataTable, Column } from "../../../../../../components/common/Table/DataTable"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ParentService } from "../../../../../../services/center-owner/parent-management/parent.service"
import { toast } from "sonner"


interface ParentPaymentsTabProps {
  parentData: any
}

export const ParentPaymentsTab: React.FC<ParentPaymentsTabProps> = ({ parentData }) => {
  const payments = parentData?.payments || []
  const [paymentPage, setPaymentPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const rowsPerPage = 5

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [paymentDetail, setPaymentDetail] = useState<any>(null)

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

type BadgeVariant = "secondary" | "default" | "destructive" | "outline" | null | undefined

const getStatusBadge = (status: string) => {
  // Sử dụng variant để đổi màu theo semantic của shadcn/ui
  // default: xám, secondary: xám nhạt, destructive: đỏ
  const variants: Record<string, { variant: BadgeVariant; label: string }> = {
    completed: { variant: "default", label: "Hoàn thành" },        // Xanh lá cây
    pending: { variant: "destructive", label: "Chờ xử lý" },       // Đỏ
    partially_paid: { variant: "secondary", label: "Thanh toán một phần" } // Xám nhạt
  }
  const statusInfo = variants[status] || { variant: "secondary", label: status }
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}

  const getMethodBadge = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản",
      card: "Thẻ",
      online: "Online"
    }
    return methods[method] || method
  }

  // Fetch payment details and open modal
  const openDetail = async (paymentId: string) => {
    try {
      setDetailError(null)
      setDetailLoading(true)
      setIsDetailOpen(true)
      const res = await ParentService.getPaymentDetailsOfParent(paymentId, parentData.id) 
            
      // service trả về response.data -> đảm bảo hỗ trợ cả trường hợp trả về object hay wrapper
      if(!res.success){
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
          studentName:
            frp.feeRecord?.student?.user?.fullName || frp.studentName || frp.feeRecord?.student?.user?.fullName,
          className: frp.feeRecord?.class?.name || frp.className,
          classCode: frp.feeRecord?.class?.classCode || frp.classCode,
          feeName:
            frp.feeRecord?.feeStructure?.name ||
            frp.feeName ||
            frp.feeRecord?.feeStructure?.name,
          amount: frp.amount ?? frp.feeRecord?.amount,
          notes: frp.notes ?? frp.note ?? null,
        })) ??
        []

        const unifiedDetail = {
        ...data,
        allocations: mappedAllocations,
      }
      
      
      setPaymentDetail(unifiedDetail)
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
  }

  // Columns for payment history
  const paymentColumns: Column<any>[] = [
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
          <div className="text-muted-foreground text-xs">
            {payment.feeRecordPayments?.[0]?.feeRecord?.feeStructure?.period || ''}
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
      key: "method",
      header: "Phương thức",
      render: (payment) => (
        <Badge variant="outline">
          {getMethodBadge(payment.method)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (payment) => getStatusBadge(payment.status),
      align: "center",
    },
    // {
    //   key: "reference",
    //   header: "Mã tham chiếu",
    //   render: (payment) => (
    //     <span className="text-xs text-muted-foreground">
    //       {payment.reference || payment.transactionCode || '-'}
    //     </span>
    //   ),
    // },
    // Actions column -> mở modal chi tiết
    {
      key: "actions",
      header: "Thao tác",
      render: (payment) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => openDetail(payment.id || payment.transactionCode || payment.orderCode)}>
            <Eye className="mr-2 h-4 w-4" />
            Chi tiết
          </Button>
        </div>
      ),
      align: "right",
    },
  ]

  // Columns for pending fees
  const pendingFeeColumns: Column<any>[] = [
    {
      key: "student",
      header: "Học sinh",
      render: (fee) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {fee.student?.user?.fullName || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "feeStructure",
      header: "Khoản phí",
      render: (fee) => (
        <div className="text-sm">
          <div className="font-medium">{fee.feeStructure?.name || "N/A"}</div>
          <div className="text-muted-foreground text-xs">
            {fee.feeStructure?.period || ""}
          </div>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Hạn thanh toán",
      render: (fee) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(fee.dueDate)}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (fee) => (
        <span className="font-semibold">{formatCurrency(Number(fee.amount))}</span>
      ),
      align: "right",
    },
    {
      key: "paidAmount",
      header: "Đã thanh toán",
      render: (fee) => (
        <span className="text-sm text-green-600">{formatCurrency(Number(fee.paidAmount))}</span>
      ),
      align: "right",
    },
    {
      key: "remaining",
      header: "Còn lại",
      render: (fee) => {
        const remaining = Number(fee.amount) - Number(fee.paidAmount)
        return (
          <span className="font-semibold text-orange-600">{formatCurrency(remaining)}</span>
        )
      },
      align: "right",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: () => <Badge variant="secondary">Chưa thanh toán</Badge>,
      align: "center",
    },
  ]

  // Pagination logic for payments
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
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true,
  }

  // Pagination logic for pending fees
  const pendingFees = parentData.pendingFees || []
  const pagedPendingFees = pendingFees.slice(
    (pendingPage - 1) * rowsPerPage,
    pendingPage * rowsPerPage
  )
  const pendingPagination = {
    currentPage: pendingPage,
    totalPages: Math.ceil(pendingFees.length / rowsPerPage) || 1,
    totalItems: pendingFees.length,
    itemsPerPage: rowsPerPage,
    onPageChange: setPendingPage,
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true,
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có giao dịch thanh toán nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(parentData.paymentStats?.totalPending || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {parentData.pendingFees?.length || 0} hóa đơn chưa thanh toán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parentData.pendingFees?.length === 0 ? (
                <Badge variant="default">Đã thanh toán</Badge>
              ) : (
                <Badge variant="secondary">Còn nợ</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cập nhật gần nhất
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table with DataTable */}
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

      {/* Pending Fees Table with DataTable */}
      {pendingFees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={pagedPendingFees}
              columns={pendingFeeColumns}
              emptyMessage="Không có hóa đơn chưa thanh toán"
              className="mt-2"
              enableSearch
              striped
              pagination={pendingPagination}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => { if(!open) closeDetail(); }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
            {/* <DialogDescription>
              Xem chi tiết giao dịch và các phân bổ (allocations)
            </DialogDescription> */}
          </DialogHeader>

          <div className="mt-4">
            {detailLoading && <div className="text-sm text-muted-foreground">Đang tải...</div>}
            {detailError && <div className="text-sm text-destructive">{detailError}</div>}
            {!detailLoading && !detailError && paymentDetail && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Số tiền</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(paymentDetail.amount || paymentDetail.totalAmount)}</div>
                  </div>
                  {/* Nếu partially_paid → hiển thị thêm phần đã trả */}
                    {paymentDetail.status === 'partially_paid' && (
                      <div className="text-sx text-muted-foreground mt-1">
                        Đã trả:{" "}
                        <span className="font-medium text-2xl  text-green-600">
                          {formatCurrency(Number(paymentDetail.paidAmount ?? paymentDetail.paid ?? 0))}
                        </span>
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
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Ghi chú</div>
                  <div className="p-3 rounded-md bg-muted text-sm">{paymentDetail.notes || '-'}</div>
                </div>

                <div>
                  {/* <div className="text-sm font-semibold">Phân bổ (Allocations)</div> */}
                  <div className="mt-2 space-y-2">
                    {(paymentDetail.allocations || []).map((a: any) => (
                      <div key={a.feeRecordPaymentId || a.feeRecordId || Math.random()} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">{a.studentName || a.student?.user?.fullName || 'Học sinh'}</div>
                            <div className="text-xs text-muted-foreground">{a.className ? `${a.className}(${a.classCode || ''}) ` : ''}</div>
                            <div className="text-xs text-muted-foreground">{a.feeName || a.feeRecord?.feeStructure?.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{formatCurrency(a.amount || a.feeRecordAmount)}</div>
                            <div className="text-xs text-muted-foreground">Ghi chú: {a.notes || '-'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(paymentDetail.allocations || []).length === 0 && <div className="text-sm text-muted-foreground">Không có phân bổ</div>}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="ghost" onClick={closeDetail}>Đóng</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
