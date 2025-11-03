import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Receipt, User, Calendar, Wallet } from "lucide-react"
import { toast } from "sonner"
import financialParentService from "../../../../services/parent/financial-management/financial-parent.service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface PaymentCartSidebarProps {
  selectedFees: string[]
  feeRecords: any[]
  currentPayment: any
  setCurrentPayment: (payment: any) => void
  setSelectedFees: (ids: string[]) => void
  setPaymentData?: (data: any) => void
  setShowQrModal?: (show: boolean) => void
}

export const PaymentCartSidebar: React.FC<PaymentCartSidebarProps> = ({
  selectedFees,
  feeRecords,
  currentPayment,
  setCurrentPayment,
  setSelectedFees,
  setPaymentData,
  setShowQrModal
}) => {
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const selectedRecords = feeRecords.filter((fee) => selectedFees.includes(fee.id))
  const totalAmount = selectedRecords.reduce((sum, fee) => sum + (fee.totalAmount > 0 ? fee.totalAmount : 0), 0)

  // Xử lý xác nhận tạo payment
  const handleConfirmCreatePayment = async () => {
    setLoading(true)
    try {
      const res: any = await financialParentService.createQrCodeForPayment(selectedFees)
      if (!res?.data?.qrCodeUrl) {
        toast.error(res?.message || "Không thể tạo mã QR cho hóa đơn")
        return
      }
      setCurrentPayment(res.data)
      if (setPaymentData) setPaymentData(res.data)
      if (setShowQrModal) setShowQrModal(true)
      setShowConfirmModal(false)
      toast.success(res.message || "Tạo hóa đơn thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tạo hóa đơn")
    } finally {
      setLoading(false)
    }
  }

  // Mở modal xác nhận
  const handleOpenConfirmModal = () => {
    if (selectedFees.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hóa đơn")
      return
    }
    setShowConfirmModal(true)
  }

  // Cập nhật payment (thêm/xóa hóa đơn)
  const handleUpdatePayment = async (newFeeRecordIds: string[]) => {
    if (!currentPayment?.id) return
    setLoading(true)
    try {
      const res: any = await financialParentService.updatePaymentFeeRecords(currentPayment.id, newFeeRecordIds)
      setCurrentPayment({ ...currentPayment, feeRecordIds: newFeeRecordIds })
      setSelectedFees(newFeeRecordIds)
      toast.success(res.message || "Cập nhật hóa đơn thành công")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật hóa đơn")
    } finally {
      setLoading(false)
    }
  }

  // Xóa hóa đơn khỏi payment
  const handleRemoveFee = (feeId: string) => {
    const newList = selectedFees.filter(id => id !== feeId)

    if (!currentPayment?.id) {
      setSelectedFees(newList)
      toast.success("Đã xóa hóa đơn")
      return
    }

    handleUpdatePayment(newList)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hóa đơn thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedRecords.length > 0 ? (
            selectedRecords.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div>
                  <div className="font-medium">{fee.courseName}</div>
                  <div className="text-xs text-muted-foreground">{fee.studentName} ({fee.studentCode})</div>
                  <div className="text-xs text-muted-foreground">Giá học phí gốc: <span className="font-semibold text-primary">{(fee.amount).toLocaleString("vi-VN")} đ</span></div>
                  <div className="text-xs text-muted-foreground">Giảm giá theo học bổng: <span className="font-semibold text-green-600">- {(fee.amount - fee.totalAmount).toLocaleString("vi-VN")} đ</span></div>
                  <div className="text-xs text-muted-foreground">Còn lại: <span className="font-semibold text-red-600">{fee.totalAmount.toLocaleString("vi-VN")} đ</span></div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleRemoveFee(fee.id)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Chưa chọn hóa đơn nào
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-medium">Tổng cộng:</span>
            <span className="font-semibold text-primary">{totalAmount.toLocaleString("vi-VN")} đ</span>
          </div>

          {!currentPayment ? (
            <Button
              className="w-full mt-2"
              onClick={handleOpenConfirmModal}
              disabled={loading || selectedFees.length === 0}
            >
              Tạo hóa đơn/payment
            </Button>
          ) : (
            <div className="text-xs text-green-600 pt-2">Đã tạo hóa đơn, bạn có thể thêm/xóa hóa đơn trước khi thanh toán.</div>
          )}
        </CardContent>
      </Card>

      {/* Modal xác nhận */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Xác nhận tạo hóa đơn thanh toán
            </DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra thông tin trước khi tạo mã QR thanh toán
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Danh sách học phí */}
            <div className="space-y-3">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Danh sách học phí ({selectedRecords.length} hóa đơn)
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {selectedRecords.map((fee, index) => (
                  <div key={fee.id} className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{fee.courseName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{fee.studentName}</span>
                          <span className="text-primary">({fee.studentCode})</span>
                        </div>

                        {fee.dueDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Hạn: {new Date(fee.dueDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Học phí gốc
                        </div>
                        <div className="font-medium">
                          {fee.amount.toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>

                    {fee.amount !== fee.totalAmount && (
                      <>
                        <Separator className="my-2" />
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 font-medium">
                              Giảm giá học bổng
                            </span>
                            <span className="text-green-600 font-semibold">
                              - {(fee.amount - fee.totalAmount).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Còn lại</span>
                            <span className="font-semibold text-red-600">
                              {fee.totalAmount.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tổng kết */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Số lượng hóa đơn
                </span>
                <span className="font-medium">
                  {selectedRecords.length} hóa đơn
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tổng học phí gốc
                </span>
                <span className="font-medium">
                  {selectedRecords.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString("vi-VN")} đ
                </span>
              </div>

              {selectedRecords.some(fee => fee.amount !== fee.totalAmount) && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 font-medium">
                    Tổng giảm giá
                  </span>
                  <span className="text-green-600 font-semibold">
                    - {selectedRecords.reduce((sum, fee) => sum + (fee.amount - fee.totalAmount), 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">
                  Tổng thanh toán
                </span>
                <span className="font-bold text-2xl text-primary">
                  {totalAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm space-y-1">
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  📌 Lưu ý:
                </div>
                <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>Sau khi xác nhận, hệ thống sẽ tạo mã QR thanh toán</li>
                  <li>Vui lòng quét mã QR để hoàn tất thanh toán</li>
                  <li>Hóa đơn sẽ được tự động cập nhật sau khi thanh toán thành công</li>
                  <li>Bạn có thể thêm/xóa hóa đơn trước khi thanh toán</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmCreatePayment}
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tạo...</span>
                </div>
              ) : (
                "Xác nhận & Tạo QR"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}