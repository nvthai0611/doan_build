import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { toast } from "sonner"
import financialParentService from "../../../../services/parent/financial-management/financial-parent.service"

interface PaymentCartSidebarProps {
  selectedFees: string[]
  feeRecords: any[]
  currentPayment: any
  setCurrentPayment: (payment: any) => void
  setSelectedFees: (ids: string[]) => void
  setPaymentData?: (data: any) => void,
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

  const selectedRecords = feeRecords.filter((fee) => selectedFees.includes(fee.id))
  const totalAmount = selectedRecords.reduce((sum, fee) => sum + (fee.remainingAmount > 0 ? fee.remainingAmount : 0), 0)

  // Tạo payment mới
const handleCreatePayment = async () => {
  if (selectedFees.length === 0) {
    toast.error("Vui lòng chọn ít nhất một hóa đơn")
    return
  }
  setLoading(true)
  try {
    // Gọi API mới: tạo payment + QR code trong 1 bước
    const res: any = await financialParentService.createQrCodeForPayment(selectedFees)
    if (!res?.data?.qrCodeUrl) {
      toast.error(res?.message || "Không thể tạo mã QR cho hóa đơn")
      return
    }
    setCurrentPayment(res.data)
    if (setPaymentData) setPaymentData(res.data)
    if (setShowQrModal) setShowQrModal(true)
    toast.success(res.message || "Tạo hóa đơn thành công")
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Không thể tạo hóa đơn")
  } finally {
    setLoading(false)
  }
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
    if (newList.length === 0) {
      toast.error("Phải có ít nhất 1 hóa đơn trong payment")
      return
    }
    handleUpdatePayment(newList)
  }

  return (
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
                <div className="text-xs text-muted-foreground">Còn lại: <span className="font-semibold text-primary">{fee.remainingAmount.toLocaleString("vi-VN")} đ</span></div>
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
            onClick={handleCreatePayment}
            disabled={loading || selectedFees.length === 0}
          >
            {loading ? "Đang tạo..." : "Tạo hóa đơn/payment"}
          </Button>
        ) : (
          <div className="text-xs text-green-600 pt-2">Đã tạo hóa đơn, bạn có thể thêm/xóa hóa đơn trước khi thanh toán.</div>
        )}
      </CardContent>
    </Card>
  )
}