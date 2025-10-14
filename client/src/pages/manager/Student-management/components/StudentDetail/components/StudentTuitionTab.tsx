import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface StudentTuitionTabProps {
  student: any
}

export function StudentTuitionTab({ student }: StudentTuitionTabProps) {
  const feeRecords = student?.feeRecords || []
  const [expandedPayments, setExpandedPayments] = useState<Set<number>>(new Set())
  
  const togglePaymentHistory = (index: number) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }
  
  // Tính thống kê học phí
  const tuitionStats = {
    totalAmount: feeRecords.reduce((sum: number, fee: any) => sum + fee.amount, 0),
    paidAmount: feeRecords.reduce((sum: number, fee: any) => sum + (fee.paidAmount || 0), 0),
    pendingAmount: feeRecords.reduce((sum: number, fee: any) => sum + (fee.amount - (fee.paidAmount || 0)), 0),
    overdueCount: feeRecords.filter((fee: any) => 
      new Date(fee.dueDate) < new Date() && fee.amount > (fee.paidAmount || 0)
    ).length
  }

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tuitionStats.totalAmount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-muted-foreground">Tổng học phí</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {tuitionStats.paidAmount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {tuitionStats.pendingAmount.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-sm text-muted-foreground">Còn nợ</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{tuitionStats.overdueCount}</p>
            <p className="text-sm text-muted-foreground">Quá hạn</p>
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết học phí */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chi tiết học phí</h3>
          
          {feeRecords.length > 0 ? (
            <div className="space-y-4">
              {feeRecords.map((fee: any, index: number) => {
                const isPaid = fee.paidAmount >= fee.amount
                const isOverdue = new Date(fee.dueDate) < new Date() && !isPaid
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{fee.feeStructure?.name}</h4>
                        <p className="text-sm text-muted-foreground">{fee.description}</p>
                      </div>
                      <Badge 
                        variant={
                          isPaid ? 'default' : 
                          isOverdue ? 'destructive' : 'secondary'
                        }
                      >
                        {isPaid ? 'Đã thanh toán' : 
                         isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Số tiền:</span>
                        <p className="text-foreground font-medium">
                          {fee.amount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Đã trả:</span>
                        <p className="text-green-600 font-medium">
                          {(fee.paidAmount || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Còn nợ:</span>
                        <p className="text-red-600 font-medium">
                          {(fee.amount - (fee.paidAmount || 0)).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Hạn đóng:</span>
                        <p className="text-foreground">
                          {new Date(fee.dueDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Lịch sử thanh toán */}
                    {fee.payments && fee.payments.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Lịch sử thanh toán ({fee.payments.length} lần)
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePaymentHistory(index)}
                            className="h-6 px-2"
                          >
                            {expandedPayments.has(index) ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Ẩn
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Xem
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {expandedPayments.has(index) && (
                          <div className="space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded p-3">
                            {fee.payments.map((payment: any, paymentIndex: number) => (
                              <div key={paymentIndex} className="flex justify-between items-center text-sm py-1">
                                <div className="flex flex-col">
                                  <span className="text-foreground">
                                    {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                                  </span>
                                  {payment.method && (
                                    <span className="text-xs text-muted-foreground">
                                      {payment.method}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-green-600 font-medium">
                                    +{payment.amount.toLocaleString('vi-VN')}đ
                                  </span>
                                  {payment.note && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {payment.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chưa có thông tin học phí</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}