"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Clock, AlertCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentHistoryItem {
  id: string
  date: string
  amount: number
  method: string
  status: string
  transactionCode?: string
  reference?: string
  notes?: string
  feeRecordId?: string
  studentName?: string
}

interface PaymentHistoryProps {
  history: PaymentHistoryItem[]
}

export function PaymentHistory({ history }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null)

  const getStatusIcon = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã thanh toán"
      case "pending":
        return "Đang xử lý"
      case "failed":
        return "Thất bại"
      default:
        return status
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPayment(item)}
                className="flex items-start gap-3 pb-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors"
              >
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-sm text-foreground">{item.date}</p>
                    <p className="font-semibold text-primary">{item.amount.toLocaleString("vi-VN")} đ</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{item.method}</p>
                  <p className="text-xs text-muted-foreground">{getStatusLabel(item.status)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch sử thanh toán</p>
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
                {getStatusIcon(selectedPayment.status)}
                <div>
                  <p className="text-sm font-medium">{getStatusLabel(selectedPayment.status)}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayment.date}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Số tiền</p>
                <p className="text-2xl font-bold text-primary">{selectedPayment.amount.toLocaleString("vi-VN")} đ</p>
              </div>

              {/* Payment Method */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</p>
                <p className="text-sm font-medium">
                  {selectedPayment.method === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Tiền mặt"}
                </p>
              </div>

              {/* Transaction Code */}
              {selectedPayment.transactionCode && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Mã giao dịch</p>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <code className="text-sm font-mono flex-1 break-all">{selectedPayment.transactionCode}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(selectedPayment.transactionCode || "")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Reference */}
              {selectedPayment.reference && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Tham chiếu</p>
                  <p className="text-sm">{selectedPayment.reference}</p>
                </div>
              )}

              {/* Student Name */}
              {selectedPayment.studentName && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Học sinh</p>
                  <p className="text-sm font-medium">{selectedPayment.studentName}</p>
                </div>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm text-foreground">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
