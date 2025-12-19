import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, User, Calendar, CreditCard, Banknote } from 'lucide-react'
import { payrollService } from '@/services/center-owner/payroll-teacher/payroll.service'
import { useToast } from '@/hooks/use-toast'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: any
}

export const PaymentModal = ({ open, onOpenChange, payroll }: PaymentModalProps) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => payrollService.createPayrollPayment(data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã tạo giao dịch thanh toán lương',
        variant: 'default'
      })
      queryClient.invalidateQueries({ queryKey: ['payroll-detail'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-payrolls'] })
      handleClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể tạo thanh toán',
        variant: 'destructive'
      })
    }
  })

  const handleClose = () => {
    setPaymentMethod('')
    setNotes('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!paymentMethod) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn phương thức thanh toán',
        variant: 'default'
      })
      return
    }

    createPaymentMutation.mutate({
      payrollIds: [payroll.id.toString()],
      totalAmount: Number(payroll.totalAmount),
      paymentMethod,
      notes: notes.trim() || undefined
    })
  }

  const fmt = (n: number) => n.toLocaleString('vi-VN')

  if (!payroll) return null

  const periodLabel = `${new Date(payroll.periodStart).toLocaleDateString('vi-VN')} - ${new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-green-600" />
            Tạo thanh toán lương
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Thông tin giáo viên */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-700">Giáo viên:</span>
              <span className="text-slate-900">{payroll.teacher?.user?.fullName || '-'}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-700">Kỳ lương:</span>
              <span className="text-slate-900">{periodLabel}</span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Tổng tiền:</span>
                <span className="text-2xl font-bold text-green-600">
                  {fmt(Number(payroll.totalAmount))} đ
                </span>
              </div>
            </div>
          </div>

          {/* Chi tiết lương */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-blue-700 font-medium mb-1">Lương cơ bản</p>
              <p className="text-lg font-semibold text-blue-900">
                {fmt(Number(payroll.totalAmount) - Number(payroll.bonuses || 0) + Number(payroll.deductions || 0) - Number(payroll.backPayAmount || 0))} đ
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-amber-700 font-medium mb-1">Thưởng</p>
              <p className="text-lg font-semibold text-amber-900">
                +{fmt(Number(payroll.bonuses || 0))} đ
              </p>
            </div>

            <div className="bg-rose-50 rounded-lg p-3">
              <p className="text-rose-700 font-medium mb-1">Khấu trừ</p>
              <p className="text-lg font-semibold text-rose-900">
                -{fmt(Number(payroll.deductions || 0))} đ
              </p>
            </div>

            {payroll.backPayAmount > 0 && (
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-purple-700 font-medium mb-1">Lương buổi học cũ</p>
                <p className="text-lg font-semibold text-purple-900">
                  +{fmt(Number(payroll.backPayAmount))} đ
                </p>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Phương thức thanh toán
              <span className="text-red-500">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Chọn phương thức thanh toán" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Chuyển khoản ngân hàng
                  </div>
                </SelectItem> */}
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Tiền mặt
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Ví dụ: Đã chuyển khoản vào tài khoản Vietcombank..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createPaymentMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createPaymentMutation.isPending || !paymentMethod}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {createPaymentMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}