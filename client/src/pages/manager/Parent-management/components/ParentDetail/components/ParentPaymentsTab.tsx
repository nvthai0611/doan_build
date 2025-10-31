"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, User, CreditCard } from "lucide-react"
import { DataTable, Column } from "../../../../../../components/common/Table/DataTable"
import { useState } from "react"

interface ParentPaymentsTabProps {
  parentData: any
}

export const ParentPaymentsTab: React.FC<ParentPaymentsTabProps> = ({ parentData }) => {
  const payments = parentData?.payments || []
  const [paymentPage, setPaymentPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const rowsPerPage = 5

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount?.toLocaleString('vi-VN') + ' đ'
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

  // Columns for payment history
  const paymentColumns: Column<any>[] = [
    {
      key: "paidAt",
      header: "Ngày thanh toán",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(payment.paidAt)}</span>
        </div>
      ),
    },
    {
      key: "student",
      header: "Học sinh",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {payment.feeRecord?.student?.user?.fullName || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: "feeStructure",
      header: "Khoản phí",
      render: (payment) => (
        <div className="text-sm">
          <div className="font-medium">
            {payment.feeRecord?.feeStructure?.name || 'N/A'}
          </div>
          <div className="text-muted-foreground text-xs">
            {payment.feeRecord?.feeStructure?.period || ''}
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
    {
      key: "reference",
      header: "Mã tham chiếu",
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment.reference || '-'}
        </span>
      ),
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
    </div>
  )
}
