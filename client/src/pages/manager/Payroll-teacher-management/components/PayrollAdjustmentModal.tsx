import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Minus,
  DollarSign,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { payrollService } from '@/services/center-owner/payroll-teacher/payroll.service'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdjustmentItem {
  id: string
  payrollId: string
  teacherName: string
  period: string
  originalAmount: number
  adjustments: {
    type: 'bonus' | 'deduction'
    amount: number
    reason: string
  }[]
  newTotal: number
}

interface PayrollAdjustmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPayrolls: any[]
}

export const PayrollAdjustmentModal = ({
  open,
  onOpenChange,
  selectedPayrolls,
}: PayrollAdjustmentModalProps) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // State cho form điều chỉnh chung
  const [adjustmentType, setAdjustmentType] = useState<'bonus' | 'deduction'>('bonus')
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('')
  const [adjustmentReason, setAdjustmentReason] = useState<string>('')

  // State cho danh sách điều chỉnh của từng payroll
  const [payrollAdjustments, setPayrollAdjustments] = useState<AdjustmentItem[]>([])

  // State cho chế độ edit
  const [editingPayrollId, setEditingPayrollId] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    type: 'bonus' as 'bonus' | 'deduction',
    amount: '',
    reason: '',
  })

  // Helper functions cho format số
  const formatNumber = (value: string) => {
    const num = value.replace(/[^\d]/g, '')
    if (!num) return ''
    return Number(num).toLocaleString('vi-VN')
  }

  const unformatNumber = (value: string) => {
    return value.replace(/[^\d]/g, '')
  }

  const handleAmountChange = (value: string) => {
    const unformatted = unformatNumber(value)
    setAdjustmentAmount(unformatted)
  }

  const handleEditAmountChange = (value: string) => {
    const unformatted = unformatNumber(value)
    setEditForm((prev) => ({ ...prev, amount: unformatted }))
  }

  // Initialize danh sách payroll khi modal mở
  useMemo(() => {
    if (open && selectedPayrolls.length > 0) {
      const items: AdjustmentItem[] = selectedPayrolls.map((p) => ({
        id: `adj-${p.id}`,
        payrollId: p.id.toString(),
        teacherName: p.teacher?.user?.fullName || '-',
        period: `${new Date(p.periodStart).toLocaleDateString('vi-VN')} - ${new Date(p.periodEnd).toLocaleDateString('vi-VN')}`,
        originalAmount: Number(p.totalAmount || 0),
        adjustments: [],
        newTotal: Number(p.totalAmount || 0),
      }))
      setPayrollAdjustments(items)
    }
  }, [open, selectedPayrolls])

  // Mutation: Apply adjustments
  const applyAdjustmentsMutation = useMutation({
    mutationFn: (data: any) => payrollService.applyPayrollAdjustments(data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã áp dụng điều chỉnh lương cho các bảng lương',
        variant: 'default',
      })
      queryClient.invalidateQueries({ queryKey: ['payrollTeachers'] })
      handleClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể áp dụng điều chỉnh',
        variant: 'destructive',
      })
    },
  })

  const fmt = (n: number) => n.toLocaleString('vi-VN')

  // Thêm điều chỉnh cho TẤT CẢ payroll
  const handleAddAdjustmentToAll = () => {
    if (!adjustmentAmount || !adjustmentReason.trim()) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng nhập đầy đủ số tiền và lý do',
        variant: 'default',
      })
      return
    }

    const amount = parseFloat(adjustmentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Số tiền phải là số dương',
        variant: 'default',
      })
      return
    }

    const newAdjustment = {
      type: adjustmentType,
      amount,
      reason: adjustmentReason.trim(),
    }

    setPayrollAdjustments((prev) =>
      prev.map((item) => {
        const updatedAdjustments = [...item.adjustments, newAdjustment]
        return {
          ...item,
          adjustments: updatedAdjustments,
          newTotal: calculateNewTotal(item.originalAmount, updatedAdjustments),
        }
      })
    )

    // Reset form
    setAdjustmentAmount('')
    setAdjustmentReason('')
  }

  // Xóa điều chỉnh của 1 payroll
  const handleRemoveAdjustment = (payrollId: string, index: number) => {
    setPayrollAdjustments((prev) =>
      prev.map((item) => {
        if (item.payrollId === payrollId) {
          const updatedAdjustments = item.adjustments.filter((_, i) => i !== index)
          return {
            ...item,
            adjustments: updatedAdjustments,
            newTotal: calculateNewTotal(item.originalAmount, updatedAdjustments),
          }
        }
        return item
      })
    )
  }

  // Bắt đầu edit điều chỉnh
  const handleStartEdit = (payrollId: string, index: number) => {
    const payroll = payrollAdjustments.find((p) => p.payrollId === payrollId)
    if (payroll) {
      const adj = payroll.adjustments[index]
      setEditingPayrollId(payrollId)
      setEditingIndex(index)
      setEditForm({
        type: adj.type,
        amount: adj.amount.toString(),
        reason: adj.reason,
      })
    }
  }

  // Lưu edit
  const handleSaveEdit = () => {
    if (!editForm.amount || !editForm.reason.trim()) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng nhập đầy đủ thông tin',
        variant: 'default',
      })
      return
    }

    const amount = parseFloat(editForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Số tiền phải là số dương',
        variant: 'default',
      })
      return
    }

    setPayrollAdjustments((prev) =>
      prev.map((item) => {
        if (item.payrollId === editingPayrollId && editingIndex !== null) {
          const updatedAdjustments = [...item.adjustments]
          updatedAdjustments[editingIndex] = {
            type: editForm.type,
            amount,
            reason: editForm.reason.trim(),
          }
          return {
            ...item,
            adjustments: updatedAdjustments,
            newTotal: calculateNewTotal(item.originalAmount, updatedAdjustments),
          }
        }
        return item
      })
    )

    handleCancelEdit()
  }

  // Hủy edit
  const handleCancelEdit = () => {
    setEditingPayrollId(null)
    setEditingIndex(null)
    setEditForm({ type: 'bonus', amount: '', reason: '' })
  }

  // Tính tổng tiền mới
  const calculateNewTotal = (originalAmount: number, adjustments: any[]) => {
    let total = originalAmount
    adjustments.forEach((adj) => {
      if (adj.type === 'bonus') {
        total += adj.amount
      } else {
        total -= adj.amount
      }
    })
    return Math.max(0, total)
  }

  // Submit
  const handleSubmit = () => {
    const payrollsWithAdjustments = payrollAdjustments.filter(
      (p) => p.adjustments.length > 0
    )

    if (payrollsWithAdjustments.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Chưa có điều chỉnh nào được thêm',
        variant: 'default',
      })
      return
    }

    const payload = {
      adjustments: payrollsWithAdjustments.map((p) => ({
        payrollId: p.payrollId,
        items: p.adjustments,
      })),
    }

    applyAdjustmentsMutation.mutate(payload)
  }

  const handleClose = () => {
    setPayrollAdjustments([])
    setAdjustmentAmount('')
    setAdjustmentReason('')
    setAdjustmentType('bonus')
    handleCancelEdit()
    onOpenChange(false)
  }

  // Tổng số điều chỉnh
  const totalAdjustments = payrollAdjustments.reduce(
    (sum, p) => sum + p.adjustments.length,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Điều chỉnh lương - {selectedPayrolls.length} bảng lương
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form thêm điều chỉnh chung */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm điều chỉnh cho tất cả bảng lương
            </h3>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="adj-type">Loại điều chỉnh</Label>
                <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                  <SelectTrigger id="adj-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-green-600" />
                        Thưởng
                      </div>
                    </SelectItem>
                    <SelectItem value="deduction">
                      <div className="flex items-center gap-2">
                        <Minus className="w-4 h-4 text-red-600" />
                        Khấu trừ
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="adj-amount">Số tiền (VNĐ)</Label>
                <Input
                  id="adj-amount"
                  type="text"
                  placeholder="0"
                  value={formatNumber(adjustmentAmount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="adj-reason">Lý do</Label>
                <Input
                  id="adj-reason"
                  placeholder="Ví dụ: Thưởng tháng 12..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleAddAdjustmentToAll} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Áp dụng cho tất cả
            </Button>
          </div>

          {/* Thông báo */}
          {totalAdjustments > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Đã có {totalAdjustments} điều chỉnh trên {payrollAdjustments.filter(p => p.adjustments.length > 0).length} bảng lương
              </AlertDescription>
            </Alert>
          )}

          {/* Danh sách payroll và điều chỉnh */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">
              Chi tiết điều chỉnh từng bảng lương
            </h3>

            {payrollAdjustments.map((payroll) => (
              <div
                key={payroll.id}
                className="border rounded-lg p-4 space-y-3 bg-white"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {payroll.teacherName}
                    </p>
                    <p className="text-sm text-slate-600">{payroll.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Lương gốc</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {fmt(payroll.originalAmount)} đ
                    </p>
                  </div>
                </div>

                {/* Danh sách điều chỉnh */}
                {payroll.adjustments.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    {payroll.adjustments.map((adj, index) => {
                      const isEditing =
                        editingPayrollId === payroll.payrollId &&
                        editingIndex === index

                      if (isEditing) {
                        // Form edit inline
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200"
                          >
                            <Select
                              value={editForm.type}
                              onValueChange={(v: any) =>
                                setEditForm((prev) => ({ ...prev, type: v }))
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bonus">Thưởng</SelectItem>
                                <SelectItem value="deduction">Khấu trừ</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              type="text"
                              value={formatNumber(editForm.amount)}
                              onChange={(e) => handleEditAmountChange(e.target.value)}
                              className="w-32"
                              placeholder="Số tiền"
                            />

                            <Input
                              value={editForm.reason}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  reason: e.target.value,
                                }))
                              }
                              className="flex-1"
                              placeholder="Lý do"
                            />

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveEdit}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        )
                      }

                      // Display mode
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                adj.type === 'bonus' ? 'default' : 'destructive'
                              }
                              className="gap-1"
                            >
                              {adj.type === 'bonus' ? (
                                <Plus className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              {adj.type === 'bonus' ? 'Thưởng' : 'Khấu trừ'}
                            </Badge>
                            <span className="font-medium">
                              {fmt(adj.amount)} đ
                            </span>
                            <span className="text-sm text-slate-600">
                              - {adj.reason}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleStartEdit(payroll.payrollId, index)
                              }
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveAdjustment(payroll.payrollId, index)
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Tổng mới */}
                {payroll.adjustments.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-medium text-slate-700">
                      Tổng tiền sau điều chỉnh:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {fmt(payroll.newTotal)} đ
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={applyAdjustmentsMutation.isPending || totalAdjustments === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {applyAdjustmentsMutation.isPending
              ? 'Đang xử lý...'
              : `Áp dụng (${totalAdjustments})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}