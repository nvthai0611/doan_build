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
import { DollarSign, Calendar, User, AlertCircle } from "lucide-react"

interface ParentTuitionTabProps {
  parentData: any
}

export function ParentTuitionTab({ parentData }: ParentTuitionTabProps) {
  const pendingFees = parentData?.pendingFees || []
  const students = parentData?.students || []

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

  // Calculate totals
  const totalPending = pendingFees.reduce(
    (sum: number, fee: any) => sum + (Number(fee.amount) - Number(fee.paidAmount)), 
    0
  )

  const totalFees = pendingFees.reduce(
    (sum: number, fee: any) => sum + Number(fee.amount), 
    0
  )

  const totalPaid = pendingFees.reduce(
    (sum: number, fee: any) => sum + Number(fee.paidAmount), 
    0
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học phí</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalFees)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingFees.length} hóa đơn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0}% hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Còn nợ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cần thanh toán
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees Table */}
      {pendingFees.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết học phí chưa thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học sinh</TableHead>
                    <TableHead>Khoản phí</TableHead>
                    <TableHead>Kỳ</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-right">Đã trả</TableHead>
                    <TableHead className="text-right">Còn lại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFees.map((fee: any) => {
                    const remaining = Number(fee.amount) - Number(fee.paidAmount)
                    const isOverdue = new Date(fee.dueDate) < new Date()
                    
                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {fee.student?.user?.fullName || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {students.find((s: any) => s.id === fee.studentId)?.studentCode || ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {fee.feeStructure?.name || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {fee.feeStructure?.period || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                              {formatDate(fee.dueDate)}
                            </span>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              Quá hạn
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(fee.amount))}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(Number(fee.paidAmount))}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-orange-600">
                          {formatCurrency(remaining)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={isOverdue ? "destructive" : "secondary"}
                          >
                            {isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Không có học phí chưa thanh toán</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tất cả học phí đã được thanh toán đầy đủ
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      {pendingFees.length > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Lưu ý về học phí
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Vui lòng thanh toán học phí trước hạn để tránh bị gián đoạn quá trình học tập. 
                  Liên hệ văn phòng để được hỗ trợ thanh toán.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
