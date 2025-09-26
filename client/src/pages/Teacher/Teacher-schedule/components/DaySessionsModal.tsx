"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { ScheduleData } from "../utils"

interface DaySessionsModalProps {
  date: string | null
  sessions: ScheduleData[]
  isOpen: boolean
  onClose: () => void
  onSelectSession?: (session: ScheduleData) => void
}

export default function DaySessionsModal({ date, sessions, isOpen, onClose, onSelectSession }: DaySessionsModalProps) {
  if (!date) return null

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
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Các buổi học trong ngày {formatDate(date)}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-6 pt-4">
          <div className="space-y-3">
            {sessions.map((s) => (
              <button
                key={s.id}
                className="w-full text-left border rounded-lg p-4 hover:bg-muted/50 transition"
                onClick={() => onSelectSession && onSelectSession(s)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.subject} - {s.className}</div>
                  {getStatusBadge(s.status)}
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {s.startTime} - {s.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {s.room || 'Chưa phân phòng'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> {s.studentCount} học sinh
                  </div>
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground py-6">Không có buổi học nào</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
