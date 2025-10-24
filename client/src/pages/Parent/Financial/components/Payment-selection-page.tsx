"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeeRecordItem } from "./Fee-record-item"
import { PaymentSummary } from "./Payment-summary"
import { PaymentHistory } from "./Payment-history"

// Mock data - replace with actual API calls
const mockFeeRecords = [
  {
    id: "1",
    studentName: "Nguyễn Văn A",
    className: "Lớp 10A",
    schoolName: "CenterUp - Demo",
    courseName: "Học thêm",
    courseDetails: "2 buổi học",
    pricePerSession: "200.000 đ/buổi học",
    dueDate: "17/10/2025",
    status: "pending",
    amount: 400000,
    paidAmount: 0,
    discount: 0,
    totalAmount: 400000,
  },
  {
    id: "2",
    studentName: "Nguyễn Văn A",
    className: "Lớp 10A",
    schoolName: "CenterUp - Demo",
    courseName: "TOEIC 5.5",
    courseDetails: "1 buổi học",
    pricePerSession: "1.600 đ/buổi học",
    dueDate: "17/10/2025",
    status: "pending",
    amount: 2000,
    paidAmount: 400,
    discount: -400,
    totalAmount: 1600,
  },
  {
    id: "3",
    studentName: "Nguyễn Văn A",
    className: "Lớp 10A",
    schoolName: "CenterUp - Demo",
    courseName: "SB Growth Pre A1 Part 2 in thương",
    courseDetails: "1 Quyển",
    pricePerSession: "55.000 đ/Quyển",
    dueDate: "17/10/2025",
    status: "pending",
    amount: 110000,
    paidAmount: 0,
    discount: -55000,
    totalAmount: 55000,
  },
]

const mockPaymentHistory = [
  {
    id: "1",
    date: "17/10/2025",
    amount: 400000,
    method: "Chuyển khoản",
    status: "completed",
  },
  {
    id: "2",
    date: "15/10/2025",
    amount: 200000,
    method: "Thẻ tín dụng",
    status: "completed",
  },
  {
    id: "3",
    date: "10/10/2025",
    amount: 100000,
    method: "Ví điện tử",
    status: "completed",
  },
]

export function PaymentSelectionPage() {
  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const [expandedFee, setExpandedFee] = useState<string | null>(null)

  const handleSelectFee = (feeId: string) => {
    setSelectedFees((prev) => (prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]))
  }

  const handleSelectAll = () => {
    if (selectedFees.length === mockFeeRecords.length) {
      setSelectedFees([])
    } else {
      setSelectedFees(mockFeeRecords.map((fee) => fee.id))
    }
  }

  const selectedRecords = mockFeeRecords.filter((fee) => selectedFees.includes(fee.id))
  const totalAmount = selectedRecords.reduce((sum, fee) => sum + fee.totalAmount, 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Danh sách hoá đơn</h1>
          <p className="text-muted-foreground">Dashboard</p>
        </div>

        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="fees">Danh sách hoá đơn</TabsTrigger>
            <TabsTrigger value="history">Lịch sử thanh toán</TabsTrigger>
          </TabsList>

          {/* Fee List Tab */}
          <TabsContent value="fees" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Select All */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="select-all"
                        checked={selectedFees.length === mockFeeRecords.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                        Chọn tất cả ({selectedFees.length}/{mockFeeRecords.length})
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Records */}
                <div className="space-y-4">
                  {mockFeeRecords.map((fee) => (
                    <FeeRecordItem
                      key={fee.id}
                      fee={fee}
                      isSelected={selectedFees.includes(fee.id)}
                      isExpanded={expandedFee === fee.id}
                      onSelect={() => handleSelectFee(fee.id)}
                      onExpand={() => setExpandedFee(expandedFee === fee.id ? null : fee.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:flex-1">
                <div className="lg:sticky lg:top-4 space-y-6">
                {/* Payment Summary */}
                <PaymentSummary
                  selectedCount={selectedFees.length}
                  totalAmount={totalAmount}
                  onPayment={() => console.log("Processing payment for:", selectedRecords)}
                />

                {/* Details Card */}
                <Card  >
                  <CardHeader>
                    <CardTitle className="text-base">Chi tiết thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRecords.length > 0 ? (
                      selectedRecords.map((fee) => (
                        <div key={fee.id} className="text-sm border-b pb-3 last:border-b-0">
                          <p className="font-medium text-foreground">{fee.courseName}</p>
                          <p className="text-muted-foreground text-xs">{fee.studentName}</p>
                          <p className="text-primary font-semibold mt-1">{fee.totalAmount.toLocaleString("vi-VN")} đ</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chọn khoản thanh toán để xem chi tiết
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              </div>

            </div>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history" className="mt-0">
            <PaymentHistory history={mockPaymentHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
