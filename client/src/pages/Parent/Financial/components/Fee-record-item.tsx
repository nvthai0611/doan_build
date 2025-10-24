"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeeRecord {
  id: string
  studentName: string
  className: string
  schoolName: string
  courseName: string
  courseDetails: string
  pricePerSession: string
  dueDate: string
  status: string
  amount: number
  paidAmount: number
  discount: number
  totalAmount: number
}

interface FeeRecordItemProps {
  fee: FeeRecord
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onExpand: () => void
}

export function FeeRecordItem({ fee, isSelected, isExpanded, onSelect, onExpand }: FeeRecordItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600"
      case "pending":
        return "text-orange-600"
      case "overdue":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán"
      case "pending":
        return "Chờ thanh toán"
      case "overdue":
        return "Quá hạn"
      default:
        return status
    }
  }

  return (
    <Card className={`transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} className="mt-1" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{fee.schoolName}</h3>
                <p className="text-sm text-muted-foreground">{fee.className}</p>
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${getStatusColor(fee.status)}`}>
                {getStatusLabel(fee.status)}
              </span>
            </div>

            {/* Course Info */}
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📚</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{fee.courseName}</p>
                  <p className="text-xs text-muted-foreground">{fee.courseDetails}</p>
                  <p className="text-xs text-muted-foreground">{fee.pricePerSession}</p>
                </div>
              </div>
            </div>

            {/* Amount Info */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Học phí gốc</p>
                <p className="font-semibold text-foreground">{fee.amount.toLocaleString("vi-VN")} đ</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Số tiền</p>
                <p className="font-semibold text-primary">{fee.totalAmount.toLocaleString("vi-VN")} đ</p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Hạn thanh toán:</span>
              <span className="font-medium text-foreground">{fee.dueDate}</span>
            </div>

            {/* Expand Button */}
            <Button variant="ghost" size="sm" onClick={onExpand} className="w-full justify-between">
              <span className="text-xs">{isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Học phí gốc</p>
                    <p className="font-medium text-foreground">{fee.amount.toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Giảm giá khác</p>
                    <p className="font-medium text-red-600">{fee.discount.toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Đã thanh toán</p>
                    <p className="font-medium text-green-600">{fee.paidAmount.toLocaleString("vi-VN")} đ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Còn nợ</p>
                    <p className="font-medium text-primary">
                      {(fee.totalAmount - fee.paidAmount).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
