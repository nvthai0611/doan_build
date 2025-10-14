import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AttendanceStatusBadge } from "./attendance-status-badge"
import { getAttendanceRate } from "../../lib/attendance-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StudentAttendanceRowProps {
  summary: any
  sessions: any[]
}
const getAttendanceStatus = (status: string) => {
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
      <div className="flex items-center gap-3 w-64 flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={student.user.avatar || undefined} alt={student.user.fullName || ""} />
          <AvatarFallback>{student.user.fullName?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{student.user.fullName || "N/A"}</p>
          <p className="text-xs text-muted-foreground truncate">{student.studentCode || student.user.email}</p>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4 text-center">
          {/* Số buổi điểm danh */}
          <div className="min-w-0">
            <div className="font-bold text-green-600 text-lg sm:text-xl truncate">{stats.present}</div>
          </div>
          
          {/* Số buổi nghỉ */}
          <div className="min-w-0">
            <div className="font-bold text-red-600 text-lg sm:text-xl truncate">{stats.absent}</div>
          </div>
          
          {/* Số buổi nghỉ có phép */}
          <div className="min-w-0">
            <div className="font-bold text-blue-600 text-lg sm:text-xl truncate">{stats.excused}</div>
          </div>
          
          {/* Tỷ lệ tham dự */}
          <div className="min-w-0">
            <div className={`font-bold text-lg sm:text-xl truncate ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {attendanceRate}%
            </div>
          </div>
        </div>
      </div>
{/* flex gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[600px] overflow-x-auto */}
      {/* <div className="flex gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[800px]">
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
      </div> */}

    </div>
  )
}
