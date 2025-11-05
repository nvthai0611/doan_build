"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { User, Calendar, CreditCard, FileText, Wallet, Search, X } from "lucide-react"
import financialService from "../../../../services/parent/financial-management/financial-parent.service"

interface AllocationItem {
  feeRecordPaymentId?: string
  amount?: number
  feeRecordId?: string
  studentId?: string
  studentName?: string
  studentCode?: string
  className?: string
  classCode?: string
  feeName?: string
  feeAmount?: number
  discountAmount?: number
  finalAmount?: number
  notes?: string
}

interface PaymentHistoryItem {
  id?: string
  date?: string
  amount?: number
  paidAmount?: number
  changeAmount?: number
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
  const groups: Record<string, PaymentHistoryItem[]> = {}
  payments.forEach((item) => {
    const d = item.date ? new Date(item.date) : new Date()
    const year = d.getMonth() + 1 >= 8 ? d.getFullYear() : d.getFullYear() - 1
    const schoolYear = `${year}-${year + 1}`
    if (!groups[schoolYear]) groups[schoolYear] = []
    groups[schoolYear].push(item)
  })
  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, payments]) => ({ year, payments }))
}

export function PaymentHistory() {
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null)
  const [searchMonth, setSearchMonth] = useState("")
  const [searchYear, setSearchYear] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<PaymentHistoryItem[]>([])

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => financialService.getPaymentByStatus('completed'),
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  // Debounce filter với delay 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchMonth && !searchYear) {
        setFilteredHistory(history as PaymentHistoryItem[])
        return
      }

      const filtered = (history as PaymentHistoryItem[]).filter((item) => {
        const d = item.date ? new Date(item.date) : new Date()
        const month = d.getMonth() + 1
        const year = d.getFullYear()

        const matchMonth = searchMonth ? month === Number(searchMonth) : true
        const matchYear = searchYear ? year === Number(searchYear) : true

        return matchMonth && matchYear
      })

      setFilteredHistory(filtered)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchMonth, searchYear, history])

  const grouped = groupPaymentsBySchoolYear(filteredHistory)

  // Reset bộ lọc
  const handleClearFilter = () => {
    setSearchMonth("")
    setSearchYear("")
  }

  const handleExpandYear = (year: string) => {
    setExpandedYear(expandedYear === year ? null : year)
    if (expandedYear !== year) {
      console.log("Call API for school year:", year)
    }
  }

  
  // Tính toán tổng kết thanh toán
  const calculatePaymentSummary = (allocations: AllocationItem[]) => {
    const totalOriginal = allocations.reduce((sum, alloc) => sum + (alloc?.feeAmount || 0), 0)
    const totalDiscount = allocations.reduce((sum, alloc) => sum + (alloc?.discountAmount || 0), 0)
    const totalFinal = allocations.reduce((sum, alloc) => sum + (alloc?.finalAmount || 0), 0)

    return {
      totalOriginal,
      totalDiscount,
      totalFinal
    }
  }
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử thanh toán theo năm học</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bộ lọc tìm kiếm */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Search className="h-4 w-4" />
              <span>Tìm kiếm theo tháng, năm</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-month" className="text-xs">Tháng</Label>
                <Input
                  id="search-month"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Nhập tháng (1-12)"
                  value={searchMonth}
                  onChange={(e) => setSearchMonth(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-year" className="text-xs">Năm</Label>
                <Input
                  id="search-year"
                  type="number"
                  min="2000"
                  max="2100"
                  placeholder="Nhập năm"
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilter}
                  disabled={!searchMonth && !searchYear}
                  className="h-9 w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            </div>

            {/* Hiển thị kết quả tìm kiếm */}
            {(searchMonth || searchYear) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tìm thấy <strong>{filteredHistory.length}</strong> giao dịch</span>
                {searchMonth && <Badge variant="secondary">Tháng {searchMonth}</Badge>}
                {searchYear && <Badge variant="secondary">Năm {searchYear}</Badge>}
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Danh sách thanh toán */}
          {grouped.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm">
                {(searchMonth || searchYear) 
                  ? "Không tìm thấy giao dịch nào phù hợp" 
                  : "Chưa có lịch sử thanh toán"}
              </div>
            </div>
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
                                        {format(new Date(item.date ?? ""), "dd/MM/yyyy HH:mm", { locale: vi })}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Chi tiết thanh toán
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Thông tin giao dịch */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-700 dark:text-green-300" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {format(new Date(selectedPayment.date ?? ""), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    ✓ Đã thanh toán
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Tổng số tiền</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {Number(selectedPayment.amount ?? 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span>Phương thức</span>
                  </div>
                  <div className="text-sm font-medium">
                    {selectedPayment.method === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Tiền mặt"}
                  </div>
                </div>

                {selectedPayment.method === "cash" && selectedPayment.paidAmount && (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Tiền khách đưa</div>
                      <div className="text-sm font-medium">
                        {Number(selectedPayment.paidAmount).toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    {selectedPayment.changeAmount && selectedPayment.changeAmount > 0 && (
                      <div className="space-y-1 col-span-2">
                        <div className="text-xs text-muted-foreground">Tiền thừa trả lại</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {Number(selectedPayment.changeAmount).toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {selectedPayment.transactionCode && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Mã giao dịch</div>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                    <code className="text-sm font-mono flex-1 break-all">
                      {selectedPayment.transactionCode}
                    </code>
                  </div>
                </div>
              )}

              <Separator />

              {/* Chi tiết học phí */}
              {selectedPayment.allocations && selectedPayment.allocations.length > 0 && (
                <div className="space-y-3">
                  <div className="font-semibold text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Chi tiết học phí ({selectedPayment.allocations.length} khoản)
                  </div>

                  <div className="space-y-4">
                    {selectedPayment.allocations.map((alloc, index) => {
                      const hasDiscount = alloc?.discountAmount && alloc.discountAmount > 0
                      
                      return (
                        <div 
                          key={alloc?.feeRecordPaymentId} 
                          className="border-2 border-primary/30 rounded-xl p-4 bg-white shadow-sm"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-semibold text-primary">
                                    {alloc?.studentName}
                                  </span>
                                  {alloc?.studentCode && (
                                    <span className="text-xs text-muted-foreground">
                                      ({alloc.studentCode})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-sm text-muted-foreground ml-6">
                                {alloc?.className && (
                                  <span>
                                    {alloc.className}
                                    {alloc.classCode && ` (${alloc.classCode})`}
                                  </span>
                                )}
                              </div>

                              {alloc?.feeName && (
                                <div className="text-xs text-muted-foreground ml-6">
                                  Khoản phí: <span className="font-medium">{alloc.feeName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator className="my-3" />

                          {/* Chi tiết số tiền */}
                          <div className="space-y-2">
                            {alloc?.feeAmount && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Học phí gốc:</span>
                                <span className="font-semibold">
                                  {Number(alloc.feeAmount).toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            )}

                            {hasDiscount && (
                              <div className="flex justify-between text-sm">
                                <span className="text-green-600 font-medium">Giảm giá học bổng:</span>
                                <span className="text-green-600 font-semibold">
                                  - {Number(alloc.discountAmount).toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            )}

                            <Separator />

                            <div className="flex justify-between items-center pt-1">
                              <span className="font-semibold">
                                {hasDiscount ? "Còn lại:" : "Số tiền:"}
                              </span>
                              <span className={`font-bold text-lg ${hasDiscount ? 'text-red-600' : 'text-primary'}`}>
                                {Number(alloc?.finalAmount || alloc?.amount || 0).toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>

                          {alloc?.notes && (
                            <>
                              <Separator className="my-3" />
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Ghi chú:</span> {alloc.notes}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Separator />

              {/* Tổng kết */}
              {selectedPayment.allocations && selectedPayment.allocations.length > 0 && (() => {
                const summary = calculatePaymentSummary(selectedPayment.allocations)
                const hasDiscount = summary.totalDiscount > 0

                return (
                  <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                    {summary.totalOriginal > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tổng học phí gốc:</span>
                        <span className="font-medium">
                          {summary.totalOriginal.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    )}

                    {hasDiscount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 font-medium">Tổng giảm giá:</span>
                        <span className="text-green-600 font-semibold">
                          - {summary.totalDiscount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Tổng đã thanh toán:</span>
                      <span className="font-bold text-2xl text-primary">
                        {Number(selectedPayment.amount).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                )
              })()}

              {selectedPayment.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Ghi chú thanh toán</div>
                    <div className="text-sm bg-muted p-3 rounded-lg">
                      {selectedPayment.notes}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}