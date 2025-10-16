"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DollarSign, Calendar, User, CreditCard } from "lucide-react"

interface ParentPaymentsTabProps {
  parentData: any
}

export function ParentPaymentsTab({ parentData }: ParentPaymentsTabProps) {
  const payments = parentData?.payments || []

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { variant: "default", label: "Hoàn thành" },
      pending: { variant: "secondary", label: "Chờ xử lý" },
      failed: { variant: "destructive", label: "Thất bại" }
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
            <CardTitle className="text-sm font-medium">Còn nợ</CardTitle>
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

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Khoản phí</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(payment.paidAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {payment.feeRecord?.student?.user?.fullName || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {payment.feeRecord?.feeStructure?.name || 'N/A'}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {payment.feeRecord?.feeStructure?.period || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getMethodBadge(payment.method)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {payment.reference || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Fees */}
      {parentData.pendingFees && parentData.pendingFees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Khoản phí</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Đã thanh toán</TableHead>
                    <TableHead>Còn lại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentData.pendingFees.map((fee: any) => {
                    const remaining = Number(fee.amount) - Number(fee.paidAmount)
                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {fee.student?.user?.fullName || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {fee.feeStructure?.name || 'N/A'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {fee.feeStructure?.period || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(fee.dueDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {formatCurrency(Number(fee.amount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-green-600">
                            {formatCurrency(Number(fee.paidAmount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(remaining)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Chưa thanh toán</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
