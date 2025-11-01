import React, { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import financialParentService from "../../../../services/parent/financial-management/financial-parent.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Loading from "../../../../components/Loading/LoadingPage"
import { formatDate } from "../../../../utils/format"
import { Download, Copy, CheckCircle, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { paymentSocketService } from "../../../../services/socket/payment-socket.service"
import { PaymentStatus, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "../../../../lib/constants"
import { Badge } from "@/components/ui/badge"

export const PaymentProcessing: React.FC = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrInfo, setQrInfo] = useState<any | null>(null)
  const [qrExpiresAt, setQrExpiresAt] = useState<Date | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [showQrModal, setShowQrModal] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const QR_EXPIRY_TIME = 15 * 60 * 1000 // 15 phút
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const queryClient = useQueryClient()

  // Socket: subscribe khi có QR mới
  useEffect(() => {
    paymentSocketService.connect()
    return () => {
      paymentSocketService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (showQrModal && qrInfo?.orderCode) {
      paymentSocketService.subscribeToPayment(
        qrInfo.orderCode,
        {
          onSuccess: async (data: any) => {
            toast.success('Thanh toán thành công! 🎉', {
              description: `Đã thanh toán ${data.amount?.toLocaleString('vi-VN')} đ`,
              duration: 2000,
            })
            handleCloseModal()
          },
          onFailure: (data: any) => {
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
      if (qrInfo?.orderCode) {
        paymentSocketService.unsubscribeFromPayment(qrInfo.orderCode)
      }
    }
  }, [showQrModal, qrInfo?.orderCode])

  // Countdown QR
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    let countdown: NodeJS.Timeout | null = null

    if (qrExpiresAt) {
      const updateRemaining = () => {
        const diff = qrExpiresAt.getTime() - Date.now()
        setRemainingTime(diff > 0 ? diff : 0)
      }
      updateRemaining()
      countdown = setInterval(updateRemaining, 1000)
      timer = setTimeout(() => {
        setQrUrl(null)
        setQrInfo(null)
        setQrExpiresAt(null)
        setShowQrModal(false)
        toast.warning("Mã QR đã hết hạn. Vui lòng tạo lại mã mới.")
      }, qrExpiresAt.getTime() - Date.now())
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (countdown) clearInterval(countdown)
    }
  }, [qrExpiresAt])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-processing'],
    queryFn: async () => {
      return await financialParentService.getPaymentByStatus('pending')
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  const {
    data: paymentDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery<any>({
    queryKey: ['payment-detail', selectedPaymentId],
    queryFn: () => selectedPaymentId ? financialParentService.getPaymentDetails(selectedPaymentId) : Promise.resolve(null),
    enabled: !!selectedPaymentId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const mutation = useMutation({
    mutationFn: async (paymentId: string) => {
      setQrLoading(true)
      return await financialParentService.generateQrCodeForPayment(paymentId)
    },
    onSuccess: (res: any) => {
      setQrUrl(res?.data?.qrCodeUrl || null)
      setQrInfo(res?.data || null)
      setQrExpiresAt(new Date(Date.now() + QR_EXPIRY_TIME))
      setShowQrModal(true)
    },
    onError: () => {
      toast.error("Không thể tạo mã QR")
    },
    onSettled: () => {
      setQrLoading(false)
      setGeneratingId(null)
    }
  })

  const handleCopyContent = async () => {
    if (qrInfo?.content) {
      try {
        await navigator.clipboard.writeText(qrInfo.content)
        setCopied(true)
        toast.success("Đã sao chép nội dung chuyển khoản")
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error("Không thể sao chép")
      }
    }
  }

  const handleDownloadQR = () => {
    if (qrUrl) {
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = `QR_Payment_${qrInfo?.orderCode || "payment"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Đã tải xuống mã QR")
    }
  }

  const handleCloseModal = () => {
    if (qrInfo?.orderCode) {
      paymentSocketService.unsubscribeFromPayment(qrInfo.orderCode)
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setShowQrModal(false)
    setQrUrl(null)
    setQrInfo(null)
    setQrExpiresAt(null)
    setCopied(false)
    setRemainingTime(0)
    queryClient.invalidateQueries({ queryKey: ['payment-processing'] })
    queryClient.invalidateQueries({ queryKey: ['payment-history'] })
  }

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getPaymentStatusBadge = (status: string) => {
    // Ensure statusKey matches the enum value (likely lowercase)
    const statusKey = status as PaymentStatus
    const label = PAYMENT_STATUS_LABELS[statusKey] || status
    const colorClass = PAYMENT_STATUS_COLORS[statusKey] || 'border-gray-500 text-gray-700 bg-gray-50'
    
    return (
      <Badge variant="outline" className={`${colorClass} border-2 font-medium`}>
        {label}
      </Badge>
    )
  }

  if (isLoading) return <Loading />
  if (isError) return <div className="text-red-500">Lỗi khi tải dữ liệu</div>

  const payments = data as any[] || []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hóa đơn đang chờ thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          {payments?.length === 0 ? (
            <div className="text-muted-foreground text-sm">Không có hóa đơn nào đang xử lý</div>
          ) : (
            <ul className="space-y-4">
              {payments.map((payment: any) => (
                <li key={payment.id} className="border-b pb-2 last:border-b-0">
                  <div className="font-medium">Mã đơn hàng: {payment.orderCode}</div>
                  <div className="text-sm text-muted-foreground">
                    Tổng số tiền: <span className="text-red-500 font-semibold">{Number(payment.amount).toLocaleString("vi-VN")} đ</span>
                  </div>
                  {payment.status === 'partially_paid' && (
                    <div className="text-sm text-muted-foreground">
                      Đã thanh toán: <span className="text-green-500 font-semibold">{Number(payment.paidAmount).toLocaleString("vi-VN")} đ</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground text-red-500">
                    Hạn thanh toán: {payment.expirationDate ? formatDate(payment.expirationDate) : "--"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ngày tạo: {new Date(payment.orderDate).toLocaleString("vi-VN")}
                  </div>
                  <div className="mt-1">
                    {getPaymentStatusBadge(payment.status)}
                  </div>

                  {(() => {
                    const isExpired = payment.expirationDate ? new Date(payment.expirationDate) < new Date() : false
                    const isThisGenerating = generatingId === payment.id && qrLoading
                    return (
                      <div className="mt-2 flex items-center gap-3">
                        {/* {payment.status != 'partially_paid' && (
                          <Button
                          size="sm"
                          disabled={isExpired || isThisGenerating}
                          onClick={() => {
                            setGeneratingId(payment.id)
                            mutation.mutate(payment.id)
                          }}
                        >
                          {isThisGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Tạo mã QR
                        </Button>
                        )} */}

                        <button
                          className="text-blue-600 underline text-sm hover:text-blue-800"
                          onClick={() => {
                            setSelectedPaymentId(payment.id)
                            setQrUrl(null)
                            setQrInfo(null)
                            setQrExpiresAt(null)
                            setShowQrModal(false)
                          }}
                        >
                          Xem chi tiết
                        </button>
                        {isExpired && <span className="text-xs text-red-500 font-medium">Đã quá hạn</span>}
                      </div>
                    )
                  })()}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modal chi tiết payment */}
      <Dialog open={!!selectedPaymentId} onOpenChange={() => {
        setSelectedPaymentId(null)
        setQrUrl(null)
        setQrInfo(null)
        setQrExpiresAt(null)
        setShowQrModal(false)
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <Loading />
          ) : isDetailError ? (
            <div className="text-red-500">Lỗi khi tải chi tiết hóa đơn</div>
          ) : paymentDetail ? (
            <div>
              <div className="mb-2 font-medium">Mã đơn hàng: {paymentDetail.transactionCode}</div>
              <div className="mb-2">
                Số tiền: <span className="text-red-500 font-semibold">{Number(paymentDetail.amount).toLocaleString("vi-VN")} đ</span>
              </div>
              {paymentDetail.status === 'partially_paid' && (
                <div className="mb-2">
                  Đã thanh toán: <span className="text-green-500 font-semibold">{Number(paymentDetail.paidAmount).toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="mb-2">
                Trạng thái: {getPaymentStatusBadge(paymentDetail.status)}
              </div>
              <div className="mb-2">Ngày tạo: {new Date(paymentDetail.createdAt).toLocaleString("vi-VN")}</div>
              <div className="mb-2">
                Hạn thanh toán: {paymentDetail.expirationDate ? formatDate(paymentDetail.expirationDate) : "--"}
              </div>
              <div className="mb-4">
                <div className="font-bold text-lg mb-3 text-primary">Danh sách học phí</div>
                <ul className="space-y-4">
                  {(paymentDetail.feeRecordPayments || []).map((frp: any) => (
                    <li
                      key={frp.id}
                      className="border-2 border-primary/30 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-primary">
                          {frp.feeRecord?.student?.user?.fullName}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">
                          {frp.feeRecord?.student?.studentCode}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        <div>
                          <span className="font-medium text-muted-foreground">Lớp:&nbsp;</span>
                          <span className="font-semibold">{frp.feeRecord?.class?.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground">({frp.feeRecord?.class?.classCode})</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Khoản phí:&nbsp;</span>
                          <span className="font-semibold">{frp.feeRecord?.feeStructure?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-base mt-1">
                        <div>
                          <span className="font-medium text-muted-foreground">Số tiền:&nbsp;</span>
                          <span className="font-bold text-red-600 text-lg">
                            {Number(frp.feeRecord?.totalAmount).toLocaleString("vi-VN")} đ
                          </span>
                          {frp.feeRecord?.feeStructure?.amount && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Đơn giá: {Number(frp.feeRecord?.feeStructure?.amount).toLocaleString("vi-VN")} đ/ buổi)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Ghi chú:&nbsp;</span>
                        {frp.feeRecord?.notes || "--"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Cảnh báo nếu payment đã partially_paid */}
              {paymentDetail.status === "partially_paid" && (
                <div className="p-4 bg-amber-100 border-l-4 border-amber-500 rounded text-amber-900 font-medium mb-2">
                  Việc thay đổi nội dung thanh toán đã khiến giao dịch này bị sai, hãy liên hệ đến chủ trung tâm để giải quyết.
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            {paymentDetail && (paymentDetail.status === "pending") && (
              <Button
                onClick={() => {
                  setGeneratingId(paymentDetail.id)
                  setSelectedPaymentId(null)
                  mutation.mutate(paymentDetail.id)
                }}
                disabled={qrLoading && generatingId === paymentDetail.id}
              >
                {(qrLoading && generatingId === paymentDetail.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo mã QR
              </Button>
            )}
            <Button variant="outline" onClick={() => {
              setSelectedPaymentId(null)
              setQrUrl(null)
              setQrInfo(null)
              setQrExpiresAt(null)
              setShowQrModal(false)
            }}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={(open) => {
        if (!open) handleCloseModal()
      }}>
        <DialogContent className="sm:max-w-md max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Quét mã QR để thanh toán</span>
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
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="QR Code Payment"
                  className="w-72 h-72 object-contain"
                  onError={() => {
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
            {qrInfo && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-mono font-semibold">{qrInfo.orderCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-semibold text-primary">
                      {qrInfo.totalAmount?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="font-semibold">{qrInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <span className="font-mono">{qrInfo.accountNumber}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground block mb-1">Nội dung chuyển khoản:</span>
                        <span className="text-sm font-mono break-all">{qrInfo.content}</span>
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
    </>
  )
}