"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
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

interface YearGroup {
  year: string
  payments: PaymentHistoryItem[]
}

function groupPaymentsBySchoolYear(payments: PaymentHistoryItem[]): YearGroup[] {
  // Giả sử năm học là từ tháng 8 năm trước đến tháng 7 năm sau
  const groups: Record<string, PaymentHistoryItem[]> = {}
  payments.forEach((item) => {
    const d = item.date ? new Date(item.date) : new Date()
    const year = d.getMonth() + 1 >= 8 ? d.getFullYear() : d.getFullYear() - 1
    const schoolYear = `${year}-${year + 1}`
    if (!groups[schoolYear]) groups[schoolYear] = []
    groups[schoolYear].push(item)
  })
  // Sắp xếp giảm dần theo năm học
  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, payments]) => ({ year, payments }))
}

export function PaymentHistory() {
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null)

  // Lấy toàn bộ payment history (có thể filter theo user ở đây)
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => financialService.getPaymentByStatus('completed'),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const grouped = groupPaymentsBySchoolYear(history as PaymentHistoryItem[])

  // Khi expand 1 năm học, call API lấy list payment của năm đó (hiện tại chỉ console.log)
  const handleExpandYear = (year: string) => {
    setExpandedYear(expandedYear === year ? null : year)
    if (expandedYear !== year) {
      // Gọi API lấy list payment của năm đó ở đây (hiện tại chỉ log)
      // Có thể truyền year vào API nếu backend hỗ trợ
      // Ví dụ: financialService.getPaymentBySchoolYear(year)
      // eslint-disable-next-line no-console
      console.log("Call API for school year:", year)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử thanh toán theo năm học</CardTitle>
        </CardHeader>
        <CardContent>
          {grouped.length === 0 ? (
            <div className="text-muted-foreground text-sm">Chưa có lịch sử thanh toán</div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.year} className="border rounded-lg shadow-sm bg-white">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-lg font-semibold text-primary hover:bg-primary/5 transition rounded-t-lg"
                    onClick={() => handleExpandYear(group.year)}
                  >
                    <span>Năm học {group.year}</span>
                    <Badge variant={expandedYear === group.year ? "default" : "secondary"}>
                      {group.payments.length} giao dịch
                    </Badge>
                  </button>
                  {expandedYear === group.year && (
                    <div className="p-4 space-y-4 bg-muted/50 rounded-b-lg">
                      {/* Group by month */}
                      {Object.entries(
                        group.payments.reduce((acc: any, item) => {
                          const d = item.date ? new Date(item.date) : new Date()
                          const month = d.getMonth() + 1
                          const key = `${month}-${d.getFullYear()}`
                          if (!acc[key]) acc[key] = []
                          acc[key].push(item)
                          return acc
                        }, {})
                      )
                        .sort((a, b) => {
                          // Sort theo tháng giảm dần
                          const [am, ay] = a[0].split("-").map(Number)
                          const [bm, by] = b[0].split("-").map(Number)
                          return by !== ay ? by - ay : bm - am
                        })
                        .map(([monthKey, monthPayments]) => {
                          const [month, year] = monthKey.split("-")
                          return (
                            <div key={monthKey} className="mb-4">
                              <div className="font-semibold text-base mb-2 text-primary">
                                Tháng {month}/{year}
                              </div>
                              <div className="space-y-3">
                                {(monthPayments as PaymentHistoryItem[]).map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="p-3 bg-white border rounded-lg shadow flex flex-col gap-1 hover:bg-primary/5 transition cursor-pointer"
                                    onClick={() => setSelectedPayment(item)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm text-foreground">
                                        {format(new Date(item.date ?? ""), "dd/MM/yyyy", { locale: vi })}
                                      </span>
                                      <span className="font-semibold text-primary">
                                        {Number(item.amount ?? 0).toLocaleString("vi-VN")} đ
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.allocations?.[0]?.studentName} - {item.allocations?.[0]?.className}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.allocations?.length > 1 && `+${item.allocations.length - 1} khoản khác`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal chi tiết thanh toán */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <span className="font-medium">Ngày thanh toán: {format(new Date(selectedPayment.date ?? ""), "dd/MM/yyyy", { locale: vi })}</span>
                <Badge variant="default" className="text-white bg-green-600">{selectedPayment.status === "completed" ? "Đã thanh toán" : selectedPayment.status}</Badge>
              </div>
              <div>
                <div className="text-xs  text-muted-foreground mb-1">Số tiền</div>
                <div className="text-2xl font-bold text-green-600">
                  {Number(selectedPayment.amount ?? 0).toLocaleString("vi-VN")} đ
                </div>
              </div>
              {selectedPayment.allocations && selectedPayment.allocations.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Chi tiết học phí</div>
                  <div className="space-y-3">
                    {selectedPayment.allocations.map((alloc) => (
                      <div key={alloc?.feeRecordPaymentId} className="text-sm border-b pb-3 last:border-b-0">
                        <div className="font-medium text-foreground">
                          {alloc?.studentName} {alloc?.className ? `- ${alloc?.className}` : ""}
                        </div>
                        {alloc?.feeName && (
                          <div className="text-xs text-muted-foreground">{alloc?.feeName}</div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Số tiền:</span>
                          <span className="font-semibold text-green-600">
                            {Number(alloc?.amount ?? 0).toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</div>
                <div className="text-sm font-medium">{selectedPayment.method === "bank_transfer" ? "Chuyển khoản ngân hàng" : selectedPayment.method}</div>
              </div>
              {selectedPayment.transactionCode && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Mã giao dịch</div>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <code className="text-sm font-mono flex-1 break-all">
                      {selectedPayment.transactionCode}
                    </code>
                  </div>
                </div>
              )}
              {selectedPayment.reference && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tham chiếu</div>
                  <div className="text-sm">{selectedPayment.reference}</div>
                </div>
              )}
              {selectedPayment.notes && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Ghi chú</div>
                  <div className="text-sm text-foreground">{selectedPayment.notes}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}