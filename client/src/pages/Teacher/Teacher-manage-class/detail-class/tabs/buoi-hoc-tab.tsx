"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { teacherCommonService } from "../../../../../services/teacher/common/common.service"

interface BuoiHocTabProps {
  onAddSession: () => void
  onViewDetailSession: (session: any) => void
  onDeleteSession: (session: any) => void
  teacherClassAssignmentId: any
}

export function BuoiHocTab({ onAddSession, onViewDetailSession, onDeleteSession, teacherClassAssignmentId }: BuoiHocTabProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['class-sessions', teacherClassAssignmentId],
    queryFn: async () => {
      return await teacherCommonService.getClassSessions(teacherClassAssignmentId)
    },
    enabled: !!teacherClassAssignmentId,
    refetchOnWindowFocus: false,
    retry: 1
  })

  const sessions = (data || []).map((s: any, idx: number) => {
    const d = new Date(s.sessionDate)
    const dateStr = isNaN(d.getTime()) ? s.sessionDate : d.toLocaleDateString('vi-VN')
    return {
      id: s.id,
      title: `Buổi ${idx + 1}`,
      date: dateStr,
      status: s.status === 'scheduled' ? 'Sắp tới' : s.status === 'completed' ? 'Hoàn thành' : s.status || "Đã hủy",
      attendance: Array.isArray(s.attendances) ? s.attendances.length : 0,
      startTime: s.startTime,
      endTime: s.endTime,
      roomName: s.room?.name
    }
  })

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Danh sách buổi học
          </CardTitle>
          <Button onClick={onAddSession}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm buổi học
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải buổi học...</div>
              ) : isError ? (
                <div className="text-sm text-destructive">Không thể tải danh sách buổi học</div>
              ) : (
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Chưa có buổi học nào</div>
                  ) : (
                    sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">Ngày: {session.date}</p>
                          <p className="text-sm text-muted-foreground">Thời gian: {session.startTime} → {session.endTime}</p>
                          {session.roomName && (
                            <p className="text-sm text-muted-foreground">Phòng: {session.roomName}</p>
                          )}
                          {session.attendance > 0 && (
                            <p className="text-sm text-muted-foreground">Có mặt: {session.attendance} học viên</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={session.status === "Hoàn thành" ? "default" : "secondary"}>{session.status}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onViewDetailSession(session)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteSession(session)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
