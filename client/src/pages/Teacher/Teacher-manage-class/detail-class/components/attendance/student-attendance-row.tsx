import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AttendanceStatusBadge } from "./attendance-status-badge"
import { getAttendanceRate } from "../../lib/attendance-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StudentAttendanceRowProps {
  summary: any
  sessions: any[]
}
const getAttendanceStatus = (status) => {
  switch (status) {
    case 'present':
      return 'Có mặt';
    case 'absent':
      return 'Vắng mặt';
    case 'excused':
      return 'Có phép';
    default:
      return 'Chưa mở'; // Trạng thái dự phòng
  }
};

export function StudentAttendanceRow({ summary, sessions }: StudentAttendanceRowProps) {
  const { student, attendanceRecords, stats } = summary
  const attendanceRate = getAttendanceRate(stats.present, stats.total)

  return (
    <div className="flex items-center gap-4 border-b border-border py-3 hover:bg-muted/50 transition-colors">
      {/* Student Info - Fixed Width */}
      <div className="sticky left-0 z-10 bg-background flex items-center gap-3 w-64 flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.user.avatar || undefined} alt={student.user.fullName || ""} />
          <AvatarFallback>{student.user.fullName?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{student.user.fullName || "N/A"}</p>
          <p className="text-xs text-muted-foreground truncate">{student.studentCode || student.user.email}</p>
        </div>
      </div>
{/* flex gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[600px] overflow-x-auto */}
      <div className="flex gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[800px]">
        {sessions.map((session) => {
          const attendance = attendanceRecords.get(session.id)
          return (
            <TooltipProvider key={session.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0 w-6 flex items-center justify-center">
                    {attendance ? (
                      <AttendanceStatusBadge status={attendance.status} size="sm" />
                    ) : (
                      <div className="h-6 w-6 rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                        -
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">{new Date(session.sessionDate).toLocaleDateString("vi-VN")}</p>
                    {attendance ? (
                      <>
                        <p>Trạng thái: {getAttendanceStatus(attendance.status)}</p>
                        {attendance.note && <p>Ghi chú: {attendance.note}</p>}
                      </>
                    ) : (
                      <p>Chưa điểm danh</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Stats - Fixed Width */}
      <div className="flex items-center gap-3 w-48 flex-shrink-0 justify-end">
        <div className="flex gap-1.5">
          <Badge variant="outline" className="text-xs">
            {stats.present}/{stats.total}
          </Badge>
          <Badge
            variant={attendanceRate >= 80 ? "default" : attendanceRate >= 60 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {attendanceRate}%
          </Badge>
        </div>
      </div>
    </div>
  )
}
