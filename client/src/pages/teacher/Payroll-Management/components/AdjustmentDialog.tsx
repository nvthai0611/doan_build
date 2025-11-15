import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, FileText, DollarSign } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adjustmentDetails?: any
  bonuses: number
  deductions: number
}

const AdjustmentDialog: React.FC<AdjustmentDialogProps> = ({
  open,
  onOpenChange,
  adjustmentDetails,
  bonuses,
  deductions
}) => {
  const adjustments = Array.isArray(adjustmentDetails)
    ? adjustmentDetails
    : adjustmentDetails
      ? [adjustmentDetails]
      : []

  const bonusItems = adjustments.filter((adj: any) => adj.type === 'bonus')
  const deductionItems = adjustments.filter((adj: any) => adj.type === 'deduction')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Điều chỉnh lương
          </DialogTitle>
          <DialogDescription>
            Chi tiết các khoản thưởng và khấu trừ trong kỳ lương
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thưởng Section */}
            {bonuses > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                        Thưởng
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        +{Number(bonuses).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                  {bonusItems.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                      {bonusItems.length} khoản
                    </Badge>
                  )}
                </div>

                {/* Chi tiết thưởng */}
                {bonusItems.length > 0 ? (
                  <div className="space-y-2">
                    {bonusItems.map((adjustment: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur rounded-lg p-3 border border-blue-200/50 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {adjustment.reason || 'Không có tiêu đề'}
                              </p>
                            </div>
                            {adjustment.description && (
                              <p className="text-xs text-gray-600 leading-relaxed ml-5">
                                {adjustment.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-bold text-blue-700">
                              +{Number(adjustment.amount).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-xs text-blue-600">đồng</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700 italic">
                    Không có mô tả chi tiết
                  </p>
                )}
              </div>
            )}

            {/* Khấu trừ Section */}
            {deductions > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 rounded-xl p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-700 uppercase tracking-wide">
                        Khấu trừ
                      </p>
                      <p className="text-2xl font-bold text-red-900">
                        -{Number(deductions).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                  {deductionItems.length > 0 && (
                    <Badge variant="destructive" className="bg-red-200 text-red-800">
                      {deductionItems.length} khoản
                    </Badge>
                  )}
                </div>

                {/* Chi tiết khấu trừ */}
                {deductionItems.length > 0 ? (
                  <div className="space-y-2">
                    {deductionItems.map((adjustment: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur rounded-lg p-3 border border-red-200/50 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {adjustment.reason || 'Không có tiêu đề'}
                              </p>
                            </div>
                            {adjustment.description && (
                              <p className="text-xs text-gray-600 leading-relaxed ml-5">
                                {adjustment.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-bold text-red-700">
                              -{Number(adjustment.amount).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-xs text-red-600">đồng</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-700 italic">
                    Không có mô tả chi tiết
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Empty State */}
          {bonuses === 0 && deductions === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Không có điều chỉnh lương trong kỳ này
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default AdjustmentDialog