"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import financialService from "../../../../services/parent/financial-management/financial-parent.service"

interface AllocationItem {
  feeRecordPaymentId?: string
  amount?: number
  feeRecordId?: string
  studentId?: string
  studentName?: string
  className?: string
  classCode?: string
  feeName?: string
  notes?: string
}

interface PaymentHistoryItem {
  id?: string
  date?: string
  amount?: number
  method?: string
  status?: string
  transactionCode?: string | null
  reference?: string | null
  notes?: string | null
  allocations?: AllocationItem[]
}

interface PaymentHistoryProps {
  children: any[]
}

export function PaymentHistory({ children }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>("all")

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => financialService.getPaymentByStatus('completed'),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán"
      case "pending":
        return "Đang xử lý"
      case "failed":
        return "Thất bại"
      default:
        return status || "Không xác định"
    }
  }

  const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case "bank_transfer":
        return "Chuyển khoản ngân hàng"
      case "cash":
        return "Tiền mặt"
      default:
        return method || "Khác"
    }
  }

  const copyToClipboard = (text?: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success("Đã sao chép vào clipboard")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const historyData = (history as PaymentHistoryItem[]) || []

  // Filter theo học sinh dựa trên allocations
  const filteredHistory = selectedStudent === "all"
    ? historyData
    : historyData.filter(item =>
        item?.allocations?.some(alloc => alloc?.studentId === selectedStudent)
      )

  return (
    <>
      {/* Student Filter */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap">Lọc theo học sinh:</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Chọn học sinh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả học sinh</SelectItem>
                {children?.map((child: any) => (
                  <SelectItem key={child?.id} value={child?.id}>
                    {child?.user?.fullName} ({child?.studentCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredHistory?.length > 0 ? (
            filteredHistory.map((item: PaymentHistoryItem) => {
              const firstAlloc = item?.allocations?.[0]
              const restCount = Math.max((item?.allocations?.length ?? 0) - 1, 0)
              return (
                <div
                  key={item?.id}
                  onClick={() => setSelectedPayment(item)}
                  className="flex items-start gap-3 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors"
                >
                  {getStatusIcon(item?.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-foreground">{item?.date}</p>
                      <p className="font-semibold text-primary">
                        {Number(item?.amount ?? 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>

                    {/* Hiển thị thông tin học sinh/lớp từ allocations (ưu tiên đối tượng đầu tiên) */}
                    {(firstAlloc?.studentName || firstAlloc?.className) && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {firstAlloc?.studentName}
                        {firstAlloc?.className && ` - ${firstAlloc?.className}`}
                        {restCount > 0 && ` +${restCount} khoản khác`}
                      </p>
                    )}

                    {/* Có thể hiển thị phương thức + trạng thái nếu cần */}
                    {/* <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{getMethodLabel(item?.method)}</p>
                      <Badge variant={getStatusVariant(item?.status)} className="text-xs">
                        {getStatusLabel(item?.status)}
                      </Badge>
                    </div> */}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedStudent === "all" 
                  ? "Chưa có lịch sử thanh toán"
                  : "Không có lịch sử thanh toán cho học sinh này"}
              </p>
              <p className="text-xs text-muted-foreground">
                Các giao dịch thanh toán của bạn sẽ hiển thị ở đây
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              {/* Payment Status */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getStatusIcon(selectedPayment?.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{getStatusLabel(selectedPayment?.status)}</p>
                    <Badge variant={getStatusVariant(selectedPayment?.status)} className="text-xs">
                      {selectedPayment?.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{selectedPayment?.date}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Số tiền</p>
                <p className="text-2xl font-bold text-primary">
                  {Number(selectedPayment?.amount ?? 0).toLocaleString("vi-VN")} đ
                </p>
              </div>

              {/* Allocations chi tiết */}
              {selectedPayment?.allocations && selectedPayment.allocations.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground mb-2">Phân bổ học phí</p>
                  <div className="space-y-3">
                    {selectedPayment.allocations.map((alloc) => (
                      <div key={alloc?.feeRecordPaymentId} className="text-sm border-b pb-3 last:border-b-0">
                        <p className="font-medium text-foreground">
                          {alloc?.studentName} {alloc?.className ? `- ${alloc?.className}` : ""}
                        </p>
                        {alloc?.feeName && (
                          <p className="text-xs text-muted-foreground">{alloc?.feeName}</p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Số tiền:</span>
                          <span className="font-semibold">
                            {Number(alloc?.amount ?? 0).toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</p>
                <p className="text-sm font-medium">{getMethodLabel(selectedPayment?.method)}</p>
              </div>

              {/* Transaction Code */}
              {selectedPayment?.transactionCode && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Mã giao dịch</p>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <code className="text-sm font-mono flex-1 break-all">
                      {selectedPayment?.transactionCode}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(selectedPayment?.transactionCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Reference */}
              {selectedPayment?.reference && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Tham chiếu</p>
                  <p className="text-sm">{selectedPayment?.reference}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPayment?.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm text-foreground">{selectedPayment?.notes}</p>
                </div>
              )}

              {/* Fee Record Link (nếu cần dẫn tới chi tiết) */}
              {/* {selectedPayment?.allocations && selectedPayment.allocations.length > 0 && (
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedPayment(null)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Xem chi tiết học phí
                  </Button>
                </div>
              )} */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}