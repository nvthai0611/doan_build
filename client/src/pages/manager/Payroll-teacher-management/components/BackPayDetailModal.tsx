import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, User, Wallet, Calendar, FileText } from "lucide-react"

// Định nghĩa lại Interface khớp với dữ liệu mới
interface BackPayItem {
  description: string
  sessionDate: string
  payoutAmount: number
  payoutRate: number
  revenueBase: number
  source?: {
    type: string
    feeRecordId: string
    monthDebt: string
  }
  student?: {
    id: string
    code: string
    name: string
  }
  class?: {
    id: string
    name: string
    code: string
  }
}

interface BackPayDetailModalProps {
  data: BackPayItem | null
  open: boolean
  onClose: () => void
}

export default function BackPayDetailModal({ data, open, onClose }: BackPayDetailModalProps) {
  if (!data) return null
  
  const fmt = (n?: number) => Number(n || 0).toLocaleString("vi-VN")

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  // Component con để hiển thị từng dòng thông tin
  const InfoRow = ({ label, value, className = "", valueClassName = "text-gray-900" }: any) => (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-semibold ${valueClassName}`}>{value}</span>
    </div>
  )

  return (
    <Dialog  open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Chi tiết khoản lương ở các buổi học cũ
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về nguồn gốc và cách tính khoản thanh toán này.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* 1. Thông tin Tài chính (Quan trọng nhất) */}
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 space-y-1">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Số tiền thực nhận</span>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                    Đã cộng vào lương
                </Badge>
            </div>
            <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-emerald-700">
                    +{fmt(data.payoutAmount)}
                </span>
                <span className="text-sm font-medium text-emerald-600">VNĐ</span>
            </div>
            <Separator className="bg-emerald-200 my-3" />
            <InfoRow 
                label="Doanh thu gốc (Hóa đơn nợ)" 
                value={`${fmt(data.revenueBase)} đ`} 
                className="py-1"
            />
            <InfoRow 
                label="Tỷ lệ hưởng (%)" 
                value={`${(data.payoutRate )}`} 
                className="py-1"
            />
          </div>

          {/* 2. Thông tin Nguồn gốc (Học sinh & Lớp) */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Thông tin nguồn nợ
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1">
                <div className="grid grid-cols-[24px_1fr] gap-1 items-start mb-3">
                    <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Lớp học</p>
                        <p className="text-sm font-medium text-gray-900">
                            {data.class ? `${data.class.name} (${data.class.code})` : 'Lớp đã xóa'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-[24px_1fr] gap-1 items-start">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500">Học sinh</p>
                        <p className="text-sm font-medium text-gray-900">
                            {data.student ? `${data.student.name} (${data.student.code})` : 'Không xác định'}
                        </p>
                    </div>
                </div>
            </div>
          </div>

          {/* 3. Thông tin Thời gian & Mô tả */}
          <div>
             <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                Chi tiết ghi nhận
            </h4>
            <div className="space-y-3 px-1">
                <div className="flex gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">Ngày thu tiền: {formatDate(data.sessionDate)}</p>
                        {data.source?.monthDebt && (
                            <p className="text-xs text-red-500 font-medium mt-0.5">
                                Kỳ nợ gốc: Tháng {new Date(data.source.monthDebt).getMonth() + 1}/{new Date(data.source.monthDebt).getFullYear()}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 italic">"{data.description}"</p>
                </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}