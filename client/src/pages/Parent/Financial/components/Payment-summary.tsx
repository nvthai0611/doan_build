"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "../../../../components/Loading/LoadingButton"

interface PaymentSummaryProps {
  selectedCount: number
  totalAmount: number
  onPayment: () => void
  isLoading?: boolean
}

export function PaymentSummary({ selectedCount, totalAmount, onPayment, isLoading }: PaymentSummaryProps) {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-lg">Tóm tắt thanh toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Số khoản được chọn</p>
          <p className="text-2xl font-bold text-foreground">{selectedCount}</p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Tổng tiền thanh toán</p>
          <p className="text-3xl font-bold text-primary">{totalAmount.toLocaleString("vi-VN")} đ</p>
        </div>

        <LoadingButton
          onClick={onPayment}
          disabled={selectedCount === 0}
          loading= {isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          // size="lg"
        >
          Chọn thanh toán
        </LoadingButton>

        <p className="text-xs text-muted-foreground text-center">Chọn ít nhất 1 khoản để thanh toán</p>
      </CardContent>
    </Card>
  )
}
