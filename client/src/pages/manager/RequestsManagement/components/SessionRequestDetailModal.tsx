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
  MapPin
} from 'lucide-react'

interface SessionRequest {
  id: string
  requestType: string
  teacherId: string
  classId: string
  sessionDate: string
  startTime: string
  endTime: string
  roomId?: string
  reason: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  teacher: {
    user: {
      fullName: string
      email: string
    }
  }
  class: {
    name: string
    subject: {
      name: string
    }
  }
  room?: {
    name: string
    capacity: number
  }
  approvedByUser?: {
    fullName: string
    email: string
  }
}

interface SessionRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: SessionRequest | null
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

const requestTypeLabels = {
  makeup_session: 'Buổi học bù',
  extra_session: 'Buổi học thêm',
}

const requestTypeColors = {
  makeup_session: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  extra_session: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
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

const SessionRequestDetailModal: React.FC<SessionRequestDetailModalProps> = ({
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
            <BookOpen className="w-5 h-5" />
            Chi tiết yêu cầu tạo buổi học
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {(request.teacher?.user?.fullName || 'U').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{request.teacher?.user?.fullName || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">{request.teacher?.user?.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={requestTypeColors[request.requestType as keyof typeof requestTypeColors] || 'bg-gray-100 text-gray-700'}
              >
                {requestTypeLabels[request.requestType as keyof typeof requestTypeLabels] || request.requestType}
              </Badge>
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

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Thông tin buổi học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày học</label>
                  <p className="text-sm">{formatDate(request.sessionDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Thời gian</label>
                  <p className="text-sm">{request.startTime} - {request.endTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lớp học</label>
                  <p className="text-sm">{request.class?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{request.class?.subject?.name || 'Unknown'}</p>
                </div>
                {request.room && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phòng học</label>
                    <p className="text-sm">{request.room.name} (Sức chứa: {request.room.capacity})</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Thông tin xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-sm">{formatDateTime(request.createdAt)}</p>
                </div>
                {request.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ngày xử lý</label>
                    <p className="text-sm">{formatDateTime(request.approvedAt)}</p>
                  </div>
                )}
                {request.approvedByUser && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Người xử lý</label>
                    <p className="text-sm">{request.approvedByUser.fullName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Lý do tạo buổi học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
              {request.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Ghi chú</label>
                  <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
                </div>
              )}
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
                {request.room && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phòng học</label>
                      <p className="text-sm">{request.room.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sức chứa</label>
                      <p className="text-sm">{request.room.capacity} học sinh</p>
                    </div>
                  </>
                )}
              </div>
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


export default SessionRequestDetailModal