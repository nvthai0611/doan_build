import { Badge } from '@/components/ui/badge'
import { XCircle } from 'lucide-react'

interface PayrollStatusBadgeProps {
  status: string
  onClickRejected?: () => void
}

export default function PayrollStatusBadge({ status, onClickRejected }: PayrollStatusBadgeProps) {
  type StatusConfig = {
    label: string
    className: string
    showIcon: boolean
    clickable?: boolean
  }

  const statusConfig: Record<string, StatusConfig> = {
    pending: {
      label: 'Chờ xử lý',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      showIcon: false
    },
    waiting_teacher_approval: {
      label: 'Chờ giáo viên duyệt',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      showIcon: false
    },
    rejected_by_teacher: {
      label: 'Đã khiếu nại',
      className: 'bg-red-100 text-red-800 border-red-200 cursor-pointer hover:bg-red-200 transition-colors',
      showIcon: true,
      clickable: true
    },
    approved_by_teacher: {
      label: 'Đã duyệt',
      className: 'bg-green-100 text-green-800 border-green-200',
      showIcon: false
    },
    paid: {
      label: 'Đã thanh toán',
      className: 'bg-green-100 text-green-800 border-green-200',
      showIcon: false
    },
    cancelled: {
      label: 'Đã hủy',
      className: 'bg-gray-200 text-gray-700 border-gray-300',
      showIcon: false
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status || '-',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    showIcon: false,
    clickable: false
  }

  const handleClick = () => {
    if (config.clickable && onClickRejected) {
      onClickRejected()
    }
  }

  return (
    <Badge 
      variant="outline"
      className={config.className}
      onClick={handleClick}
    >
      {config.showIcon && <XCircle className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
