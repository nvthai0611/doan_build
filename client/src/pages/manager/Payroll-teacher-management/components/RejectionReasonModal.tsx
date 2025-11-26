import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { XCircle, Calendar, FileText, User } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RejectionReasonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: any
}

export const RejectionReasonModal = ({
  open,
  onOpenChange,
  payroll
}: RejectionReasonModalProps) => {
  if (!payroll) return null

  const rejectionDate = payroll.teacherActionAt 
    ? format(new Date(payroll.teacherActionAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })
    : '-'

  const teacherName = payroll.teacher?.user?.fullName || '-'
  const rejectionReason = payroll.rejectionReason || payroll.teacherRejectionReason || 'Không có lý do'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <XCircle className="w-6 h-6 text-red-600" />
            Lý do từ chối bảng lương
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trạng thái:</span>
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Đã từ chối
            </Badge>
          </div>

          {/* Teacher Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Giáo viên từ chối</p>
                <p className="font-medium text-slate-900">{teacherName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-1">Thời gian từ chối</p>
                <p className="font-medium text-slate-900">{rejectionDate}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Lý do từ chối:
                </p>
                <p className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                  {rejectionReason}
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Bạn cần kiểm tra lại thông tin và tính toán lại bảng lương 
              theo yêu cầu của giáo viên trước khi gửi lại.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}