"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FeeRecordItem } from "./Fee-record-item"
import { PaymentSummary } from "./Payment-summary"
import { PaymentHistory } from "./Payment-history"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import financialParentService from "../../../../services/parent/financial-management/financial-parent.service"
import Loading from "../../../../components/Loading/LoadingPage"
import { PaymentProcessing } from "./Payment-processing"
import { toast } from "sonner"
import { X, Download, Copy, CheckCircle, Clock } from "lucide-react"
import { parentChildService } from "../../../../services/parent/child-management/child.service"
import { paymentSocketService } from "../../../../services/socket/payment-socket.service"
import { PaymentCartSidebar } from "./payment-cart-sidebar"

interface FeeRecordData {
  id: string
  studentId: string
  feeStructureId: string
  classId: string
  amount: number
  dueDate: string
  paidAmount: number
  status: string
  discount: number
  notes: string
  createdAt: string
  totalAmount: number | null
  feeStructure: {
    amount: number
  }
  class: {
    id: string
    name: string
    classCode: string
    feeAmount: number
    feePeriod: string
  }
  student: {
    id: string
    userId: string
    studentCode: string
    user: {
      fullName: string
    }
    school: {
      name: string
    }
  }
}

interface PaymentData {
  orderCode: string
  qrCodeUrl: string
  totalAmount: number
  content: string
  accountNumber: string
  bankCode: string
  bankName: string
  expiresAt: string
}

const QR_EXPIRY_TIME = 15 * 60 * 1000 // 15 minutes in milliseconds

export function PaymentSelectionPage() {
  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const [expandedFee, setExpandedFee] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [selectedStudent, setSelectedStudent] = useState<string>("all")
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPayment, setCurrentPayment] = useState<any | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['feeRecords', 'pending'],

    queryFn: async () => {
      return await financialParentService.getAllFeeRecordsOfParent('pending')
    },
    staleTime: 3 * 60 * 1000,
    retry: 1,
  })

  const { data: children, isLoading: isLoadingChildren, isError: isErrorChildren } = useQuery({
    queryKey: ['listStudent'],
    queryFn: async () => {
      return await parentChildService.getChildren()
    },
    staleTime: 3 * 60 * 1000,
    retry: 1,
  })
  
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  // Start countdown when modal opens
  useEffect(() => {
    if (showQrModal && paymentData) {
      setRemainingTime(QR_EXPIRY_TIME)

      timerRef.current = setTimeout(() => {
        handleCloseModal()
        toast.warning('Mã QR đã hết hạn. Vui lòng tạo mã mới.')
      }, QR_EXPIRY_TIME)

      countdownRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [showQrModal, paymentData])

  // Connect socket khi component mount
  useEffect(() => {
    paymentSocketService.connect()
    
    return () => {
      paymentSocketService.disconnect()
    }
  }, [])

  

  // Subscribe payment updates khi QR modal mở
  
  useEffect(() => {
  if (showQrModal && paymentData?.orderCode) {
    paymentSocketService.subscribeToPayment(
      paymentData.orderCode,
      {
        onSuccess: async (data) => {
          console.log(data);
          
           toast.success('Thanh toán thành công!', {
            description: `Đã thanh toán ${data.amount?.toLocaleString('vi-VN')} đ`,
            duration: 2000,
          })

          handleCloseModal()
        },
        
        onFailure: (data) => {
          toast.error('Thanh toán thất bại', {
            description: data.reason || 'Vui lòng thử lại',
          })
          handleCloseModal()
        },
        
        onExpired: () => {
          toast.warning('Mã QR đã hết hạn', {
            description: 'Vui lòng tạo mã mới',
          })
          handleCloseModal()
        }
      }
    )
  }

  return () => {
    if (paymentData?.orderCode) {
      paymentSocketService.unsubscribeFromPayment(paymentData.orderCode)
    }
  }
}, [showQrModal, paymentData?.orderCode]) // Dependencies vẫn giữ nguyên

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSelectFee = (feeId: string) => {
    setSelectedFees((prev) => 
      prev.includes(feeId) 
        ? prev.filter((id) => id !== feeId) 
        : [...prev, feeId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFees.length === filteredFeeRecords.length) {
      setSelectedFees([])
    } else {
      setSelectedFees(filteredFeeRecords.map((fee) => fee.id))
    }
  }

  

  const handleCopyContent = async () => {
    if (paymentData?.content) {
      try {
        await navigator.clipboard.writeText(paymentData.content)
        setCopied(true)
        toast.success("Đã sao chép nội dung chuyển khoản")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Không thể sao chép")
      }
    }
  }

  const handleDownloadQR = () => {
    if (paymentData?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = paymentData.qrCodeUrl
      link.download = `QR_Payment_${paymentData.orderCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Đã tải xuống mã QR")
    }
  }

const handleCloseModal = () => {
  // Unsubscribe trước khi đóng
  if (paymentData?.orderCode) {
    paymentSocketService.unsubscribeFromPayment(paymentData.orderCode)
  }

  // Cleanup timers
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
  if (countdownRef.current) {
    clearInterval(countdownRef.current)
    countdownRef.current = null
  }

  // Đóng modal và reset state trước
  setShowQrModal(false)
  setPaymentData(null)
  setCopied(false)
  setRemainingTime(0)
  setCurrentPayment(null)
  
// 1. Chỉ 'invalidate' (làm cũ) các query.
  // Query nào đang active (đang xem) nó sẽ tự refetch.
  // Query nào inactive (tab khác) sẽ refetch khi user bấm vào.
  setSelectedFees([])
  queryClient.invalidateQueries({ queryKey: ['feeRecords'] })
  queryClient.invalidateQueries({ queryKey: ['payment-processing'] })
  queryClient.invalidateQueries({ queryKey: ['payment-history'] }) // Nên thêm cả history
}

  if (isLoading || isLoadingChildren) {
    return <Loading />
  }

  const feeRecords = (isError) ? [] : (response as any[] || [])
  const childrenList = (isErrorChildren) ? [] : (children as any[])


  const transformedFeeRecords = feeRecords?.map((fee) => {
    const calculatedTotal = fee.totalAmount ?? (Number(fee.amount) - Number(fee.discount))
    const remainingAmount = calculatedTotal - Number(fee.paidAmount)

    return {
      id: fee?.id,
      studentId: fee?.studentId,
      studentName: fee?.student.user.fullName,
      studentCode: fee?.student.studentCode,
      className: fee?.class.name,
      classCode: fee?.class.classCode,
      schoolName: fee?.student.school.name || "QNEdu",
      courseName: fee?.class.name,
      courseDetails: `${fee?.class.feePeriod === 'per_session' ? 'Theo buổi học' : fee.class.feePeriod === 'monthly' ? 'Theo tháng' : fee.class.feePeriod === 'semester' ? 'Theo học kỳ' : 'Theo năm'}`,
      pricePerSession: `${Number(fee?.class.feeAmount).toLocaleString('vi-VN')} đ/${fee.class.feePeriod === 'per_session' ? 'buổi học' : fee.class.feePeriod}`,
      dueDate: new Date(fee?.dueDate).toLocaleDateString('vi-VN'),
      status: fee?.status,
      feeStructureAmount: Number(fee?.feeStructure.amount),
      amount: Number(fee?.amount),
      paidAmount: Number(fee?.paidAmount),
      discount: Number(fee?.discount),
      totalAmount: calculatedTotal,
      remainingAmount: remainingAmount,
      attendanceCount: fee?.student.attendedSessionsCount,
      notes: fee?.notes,
    }
  })

  // Filter fee records by selected student
  const filteredFeeRecords = selectedStudent === "all" 
    ? transformedFeeRecords 
    : transformedFeeRecords.filter(fee => fee.studentId === selectedStudent)


//   useEffect(() => {
//   // Giữ lại các feeId vẫn còn trong filteredFeeRecords
//   setSelectedFees((prev) =>
//     prev.filter((id) => filteredFeeRecords.some((fee) => fee.id === id))
//   )
// }, [filteredFeeRecords])
  //   const selectedRecords = filteredFeeRecords.filter((fee) => 
  //   selectedFees.includes(fee.id)
  // )
  // const totalAmount = selectedRecords.reduce((sum, fee) => 
  //   sum + (fee.remainingAmount > 0 ? fee.remainingAmount : 0), 0
  // )
  
  return (  
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Danh sách hoá đơn</h1>
          {/* <p className="text-muted-foreground">
            Tổng số hoá đơn: {filteredFeeRecords.length}
          </p> */}
        </div>

        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="fees">Danh sách hoá đơn</TabsTrigger>
            <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thanh toán</TabsTrigger>
          </TabsList>

          {/* Fee List Tab */}
          <TabsContent value="fees" className="mt-0">
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
                      {childrenList.map((child: any) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.user.fullName} ({child.studentCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredFeeRecords.length === 0 ? (
              <Card>
                <CardContent className="pt-6 pb-6">
                  <p className="text-center text-muted-foreground">
                    {selectedStudent === "all" 
                      ? "Không có hoá đơn nào cần thanh toán"
                      : "Không có hoá đơn nào cho học sinh này"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="lg:flex-[2] space-y-4 overflow-hidden">
                  {/* Select All */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="select-all"
                          checked={selectedFees.length === filteredFeeRecords.length && filteredFeeRecords.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                          Chọn tất cả ({selectedFees.length}/{filteredFeeRecords.length})
                        </label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fee Records */}
                  <div className="space-y-4">
                    {feeRecords.length > 0 ? (
                      filteredFeeRecords.map((fee: any) => (
                      <FeeRecordItem
                        key={fee.id}
                        fee={fee}
                        isSelected={selectedFees.includes(fee.id)}
                        isExpanded={expandedFee === fee.id}
                        onSelect={() => handleSelectFee(fee.id)}
                        onExpand={() => setExpandedFee(expandedFee === fee.id ? null : fee.id)}
                      />
                    ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Không có hóa đơn nào
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:flex-1 lg:self-start">
                  {/* <div className="lg:sticky lg:top-4 space-y-6">
                    {/* Payment Summary */}
                    {/* <PaymentSummary
                      selectedCount={selectedFees.length}
                      totalAmount={totalAmount}
                      onPayment={handleSelectPayment}
                    /> */}

                    {/* Details Card */}
                    {/* <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Chi tiết thanh toán</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedRecords.length > 0 ? (
                          selectedRecords.map((fee) => (
                            <div key={fee.id} className="text-sm border-b pb-3 last:border-b-0">
                              <p className="font-medium text-foreground">{fee.courseName}</p>
                              <p className="text-muted-foreground text-xs">
                                {fee.studentName} ({fee.studentCode})
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">Số tiền cần thanh toán:</span>
                                <span className="text-primary font-semibold">
                                  {fee.remainingAmount.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Chọn khoản thanh toán để xem chi tiết
                          </p>
                        )}
                      </CardContent>
                    </Card> */}
                  {/* </div> */}
    <PaymentCartSidebar
                    selectedFees={selectedFees}
                    feeRecords={filteredFeeRecords}
                    currentPayment={currentPayment}
                    setCurrentPayment={setCurrentPayment}
                    setSelectedFees={setSelectedFees}
                    setPaymentData={setPaymentData}
                    setShowQrModal={setShowQrModal}
                  />
                </div>
              </div>
            )}
          </TabsContent>
            
          {/* Payment History Tab */}
          <TabsContent value="history" className="mt-0">
            <PaymentHistory  />
          </TabsContent>

          <TabsContent value="processing" className="mt-0">
  <PaymentProcessing />
</TabsContent>
        </Tabs>

        {/* QR Code Modal - Giữ nguyên code cũ */}
        <Dialog open={showQrModal} onOpenChange={(open) => {
    // Nếu 'open' là false (tức là dialog được lệnh đóng)
    if (!open) {
      handleCloseModal() // GỌI HÀM CLEANUP VÀ REFETCH Ở ĐÂY
    }
  }}>
          <DialogContent className="sm:max-w-md max-h-[100vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Quét mã QR để thanh toán</span>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCloseModal}
                >
                  <X className="h-4 w-4" />
                </Button> */}
              </DialogTitle>
              <DialogDescription>
                Sử dụng ứng dụng ngân hàng để quét mã QR này
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Mã QR hết hạn sau: <span className="font-mono font-bold">{formatTime(remainingTime)}</span>
                </span>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                {paymentData?.qrCodeUrl ? (
                  <img 
                    src={paymentData.qrCodeUrl} 
                    alt="QR Code Payment" 
                    className="w-72 h-72 object-contain"
                    onError={() => {
                      console.error("QR Code load error")
                      toast.error("Không thể tải mã QR")
                    }}
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-muted rounded">
                    <p className="text-muted-foreground">Đang tải mã QR...</p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              {paymentData && (
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mã đơn hàng:</span>
                      <span className="font-mono font-semibold">{paymentData.orderCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số tiền:</span>
                      <span className="font-semibold text-primary">
                        {paymentData.totalAmount?.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ngân hàng:</span>
                      <span className="font-semibold">{paymentData.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số tài khoản:</span>
                      <span className="font-mono">{paymentData.accountNumber}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-xs text-muted-foreground block mb-1">Nội dung chuyển khoản:</span>
                          <span className="text-sm font-mono break-all">{paymentData.content}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={handleCopyContent}
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleDownloadQR}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Đóng
                </Button>
              </div>

              {/* Warning */}
              <div className="text-xs text-muted-foreground text-center p-3 bg-muted rounded">
                ⚠️ Vui lòng kiểm tra kỹ thông tin trước khi chuyển khoản, không thay đổi nội dung để không xảy ra lỗi. 
                Có lỗi hãy liên hệ với chủ trung tâm của QNEdu để được giúp đỡ.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
