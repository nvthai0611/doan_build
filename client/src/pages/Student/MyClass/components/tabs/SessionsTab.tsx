import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"
import type { StudentSession } from "../../../../../services/student/schedule/schedule.types"
import { SessionDetailsDialog } from "./SessionDetailsDialog"

interface SessionsTabProps {
  classId: string
  classStartDate?: string
  classEndDate?: string
  classInfo?: any
  onViewSession?: (sessionId: string) => void
}

export function SessionsTab({ classId, classStartDate, classEndDate, classInfo, onViewSession }: SessionsTabProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<StudentSession | undefined>(undefined)
  // Gọi không truyền khoảng ngày để backend trả tối đa; lọc theo class ở client
  const requestFilters = useMemo(() => ({} as Record<string, string>), [classId, classStartDate, classEndDate])

  const { data, isLoading, isError } = useQuery<StudentSession[]>({
    queryKey: ["student", "class-sessions", classId],
    queryFn: async () => {
      const sessions = await studentClassInformationService.getClassSessions(classId)
      return sessions as any
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!classId,
  })

  const rows: StudentSession[] = useMemo(() => (data || []) as any, [data])

  const statusBadge = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled' || s === 'planned') return "bg-blue-100 text-blue-700 border border-blue-200"
    if (s === 'completed' || s === 'done') return "bg-green-100 text-green-700 border border-green-200"
    if (s === 'cancelled' || s === 'canceled') return "bg-red-100 text-red-700 border border-red-200"
    if (s === 'ongoing' || s === 'in_progress') return "bg-amber-100 text-amber-700 border border-amber-200"
    return "bg-gray-100 text-gray-700 border border-gray-200"
  }

  const statusTextVi = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled' || s === 'planned') return 'Sắp tới'
    if (s === 'completed' || s === 'done') return 'Hoàn thành'
    if (s === 'cancelled' || s === 'canceled') return 'Đã hủy'
    if (s === 'ongoing' || s === 'in_progress') return 'Đang diễn ra'
    return 'Không xác định'
  }

  if (isLoading) return <Loading />
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">Không thể tải danh sách buổi học</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Danh sách buổi học
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">Chưa có buổi học nào</div>
        ) : (
          <div className="space-y-4">
            {rows.map((s, idx) => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{`Buổi ${idx + 1}`}</p>
                  <p className="text-sm text-muted-foreground">Ngày: {new Date(s.sessionDate).toLocaleDateString('vi-VN')}</p>
                  <p className="text-sm text-muted-foreground">Thời gian: {s.startTime} → {s.endTime}</p>
                  {s.room?.name && (
                    <p className="text-sm text-muted-foreground">Phòng: {s.room?.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={statusBadge(s.status as any)}>{statusTextVi(s.status)}</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedSessionId(s.id); setSelectedSession(s); setDetailOpen(true) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <SessionDetailsDialog open={detailOpen} onOpenChange={setDetailOpen} sessionId={selectedSessionId} session={selectedSession} classInfo={classInfo} />
      </CardContent>
    </Card>
  )
}
