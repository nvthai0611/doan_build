import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  BookOpen,
  MapPin,
  ArrowRight
} from 'lucide-react'

interface ScheduleChange {
  id: string
  classId: string
  originalDate: string
  originalTime: string
  newDate: string
  newTime: string
  newRoomId?: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  processedAt?: string
  class: {
    name: string
    subject: {
      name: string
    }
    teacher: {
      user: {
        fullName: string
        email: string
      }
    }
  }
  newRoom?: {
    name: string
    capacity: number
  }
}

interface ScheduleChangeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: ScheduleChange | null
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

const ScheduleChangeDetailModal: React.FC<ScheduleChangeDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject
}) => {
  if (!request) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Chi tiết yêu cầu đổi lịch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {(request.class?.teacher?.user?.fullName || 'U').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{request.class?.teacher?.user?.fullName || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">{request.class?.teacher?.user?.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={statusColors[request.status] || statusColors.pending}
              >
                {getStatusIcon(request.status)}
                {statusLabels[request.status] || request.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Schedule Change Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Thông tin đổi lịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lịch cũ</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{formatDate(request.originalDate)}</p>
                      <p className="text-sm text-muted-foreground">{request.originalTime}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lịch mới</label>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium">{formatDate(request.newDate)}</p>
                      <p className="text-sm text-muted-foreground">{request.newTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex items-center justify-center my-4">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Thông tin lớp học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tên lớp</label>
                  <p className="text-sm">{request.class?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Môn học</label>
                  <p className="text-sm">{request.class?.subject?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Giáo viên</label>
                  <p className="text-sm">{request.class?.teacher?.user?.fullName || 'Unknown'}</p>
                </div>
                {request.newRoom && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phòng học mới</label>
                    <p className="text-sm">{request.newRoom.name} (Sức chứa: {request.newRoom.capacity})</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Lý do đổi lịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
            </CardContent>
          </Card>

          {/* Processing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Thông tin xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ngày yêu cầu</label>
                <p className="text-sm">{formatDateTime(request.requestedAt)}</p>
              </div>
              {request.processedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày xử lý</label>
                  <p className="text-sm">{formatDateTime(request.processedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {request.status === 'pending' && (onApprove || onReject) && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              {onReject && (
                <Button 
                  variant="destructive" 
                  onClick={() => onReject(request.id)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </Button>
              )}
              {onApprove && (
                <Button 
                  onClick={() => onApprove(request.id)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Duyệt yêu cầu
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleChangeDetailModal
