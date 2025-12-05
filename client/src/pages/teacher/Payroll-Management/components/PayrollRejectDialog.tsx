import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { XCircle, AlertTriangle } from 'lucide-react'

interface PayrollRejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: any
  onConfirm: (reason: string) => void
  loading?: boolean
}

const PayrollRejectDialog: React.FC<any> = ({
  open,
  onOpenChange,
  payroll,
  onConfirm,
  loading = false
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    // Validate reason
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }

    if (reason.trim().length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự')
      return
    }

    // Clear error and call confirm
    setError('')
    onConfirm(reason.trim())
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setReason('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  if (!payroll) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
            <XCircle className="w-6 h-6" />
            Từ chối bảng lương
          </DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối bảng lương này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Thông tin bảng lương */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Thông tin bảng lương
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Kỳ lương</p>
                <p className="font-medium text-gray-900">
                  {new Date(payroll.periodStart).toLocaleDateString('vi-VN')} - {new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Tổng thanh toán</p>
                <p className="font-medium text-gray-900">
                  {Number(payroll.totalAmount).toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>
          </div>

          {/* Textarea nhập lý do */}
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Nhập lý do từ chối (ít nhất 10 ký tự)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('') // Clear error when typing
              }}
              rows={5}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Đã nhập: {reason.length} ký tự (tối thiểu 10 ký tự)
            </p>
          </div>

          {/* Cảnh báo */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Lưu ý quan trọng
                </p>
                <ul className="text-xs text-red-800 space-y-1">
                  <li>• Sau khi từ chối, bảng lương sẽ được gửi lại để điều chỉnh</li>
                  <li>• Lý do từ chối sẽ được gửi đến phòng kế toán</li>
                  <li>• Vui lòng mô tả rõ ràng vấn đề cần điều chỉnh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang xử lý...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Xác nhận từ chối
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PayrollRejectDialog