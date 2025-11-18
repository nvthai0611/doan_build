import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, AlertCircle, Calendar, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'

interface PayrollApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: any
  summary: any
  onConfirm: () => void
  loading?: boolean
}

const PayrollApprovalDialog: React.FC<PayrollApprovalDialogProps> = ({
  open,
  onOpenChange,
  payroll,
  summary,
  onConfirm,
  loading = false
}) => {
  if (!payroll) return null

  const hasAdjustments = Number(payroll.bonuses) > 0 || Number(payroll.deductions) > 0
  const hasBackPay = Number(payroll.backPayAmount || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Xác nhận duyệt bảng lương
          </DialogTitle>
          <DialogDescription>
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Kỳ lương */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Kỳ lương</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700 mb-1">Từ ngày</p>
                <p className="text-sm font-medium text-blue-900">
                  {new Date(payroll.periodStart).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Đến ngày</p>
                <p className="text-sm font-medium text-blue-900">
                  {new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Tổng quan buổi học */}
          {summary && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Tổng quan buổi học</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-700 mb-1">Tổng buổi học</p>
                  <p className="text-2xl font-bold text-green-900">{summary.totalSessions}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Buổi chính thức</p>
                  <p className="text-2xl font-bold text-green-900">{summary.regularSessions}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Buổi dạy thay</p>
                  <p className="text-2xl font-bold text-green-900">{summary.substituteSessions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chi tiết thanh toán */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Chi tiết thanh toán</h3>
            
            {/* Lương cơ bản */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Lương từ buổi học</span>
              <span className="font-semibold text-gray-900">
                {summary?.totalPayout ? Number(summary.totalPayout).toLocaleString('vi-VN') : '0'} đ
              </span>
            </div>

            {/* Thưởng */}
            {Number(payroll.bonuses) > 0 && (
              <div className="flex items-center justify-between py-2 bg-blue-50 px-3 rounded">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Thưởng</span>
                </div>
                <span className="font-semibold text-blue-700">
                  +{Number(payroll.bonuses).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            {/* Khấu trừ */}
            {Number(payroll.deductions) > 0 && (
              <div className="flex items-center justify-between py-2 bg-red-50 px-3 rounded">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">Khấu trừ</span>
                </div>
                <span className="font-semibold text-red-700">
                  -{Number(payroll.deductions).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            {/* Truy lĩnh */}
            {hasBackPay && (
              <div className="flex items-center justify-between py-2 bg-yellow-50 px-3 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Truy lĩnh</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                    {payroll.computedDetails?.metadata?.backPayCount || 0} khoản
                  </Badge>
                </div>
                <span className="font-semibold text-yellow-700">
                  +{Number(payroll.backPayAmount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            <Separator />

            {/* Tổng cộng */}
            <div className="flex items-center justify-between py-3 bg-green-100 px-4 rounded-lg">
              <span className="text-base font-semibold text-green-900">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-green-700">
                {Number(payroll.totalAmount).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Cảnh báo */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Lưu ý quan trọng
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Sau khi xác nhận, bạn không thể chỉnh sửa bảng lương này</li>
                  <li>• Vui lòng kiểm tra kỹ tất cả các thông tin trước khi xác nhận</li>
                  <li>• Nếu có sai sót, vui lòng liên hệ phòng kế toán</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Xác nhận duyệt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PayrollApprovalDialog