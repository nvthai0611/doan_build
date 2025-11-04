"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, BookOpen, AlertTriangle } from "lucide-react"
import { ScheduleData } from "../utils"

interface SessionDetailModalProps {
  session: ScheduleData | null
  isOpen: boolean
  onClose: () => void
}

export default function SessionDetailModal({ session, isOpen, onClose }: SessionDetailModalProps) {
  if (!session) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Đã lên lịch</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Đã hoàn thành</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTime = (time: string) => time.slice(0, 5)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Chi tiết buổi học - {session.subject} ({session.className})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            {getStatusBadge(session.status)}
            <div className="text-sm text-muted-foreground">
              ID: {session.id}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Ngày học</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(session.date)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Thời gian</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(session.startTime)} -{' '}
                  {formatTime(session.endTime)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-chart-2" />
              <div>
                <div className="font-medium">Phòng học</div>
                <div className="text-sm text-muted-foreground">
                  {session.room || 'Chưa phân phòng'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-chart-4" />
              <div>
                <div className="font-medium">Số học sinh</div>
                <div className="text-sm text-muted-foreground">
                  {session.studentCount}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="font-medium mb-2">Ghi chú</div>
              <div className="text-sm text-muted-foreground">
                {session.notes}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex w-full justify-between">
            <div className="w-1/2 pr-5">
              <Button onClick={onClose} className="flex-1 w-full">
                Điểm danh
              </Button>
            </div>
            <div className="w-1/2">
              <Button
                onClick={onClose}
                className="flex-1 w-full"
                variant="destructive"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
