import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudentAttendanceTabProps {
  student: any
}

export function StudentAttendanceTab({ student }: StudentAttendanceTabProps) {
  const attendances = student?.attendances || []
  
  // Tính thống kê điểm danh
  const attendanceStats = {
    total: attendances.length,
    present: attendances.filter((a: any) => a.status === 'present').length,
    absent: attendances.filter((a: any) => a.status === 'absent').length,
    late: attendances.filter((a: any) => a.status === 'late').length,
  }

  const attendanceRate = attendanceStats.total > 0 
    ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{attendanceStats.total}</p>
            <p className="text-sm text-muted-foreground">Tổng buổi học</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
            <p className="text-sm text-muted-foreground">Có mặt</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            <p className="text-sm text-muted-foreground">Vắng mặt</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{attendanceRate}%</p>
            <p className="text-sm text-muted-foreground">Tỷ lệ tham gia</p>
          </CardContent>
        </Card>
      </div>

      {/* Chi tiết điểm danh */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Lịch sử điểm danh</h3>
          
          {attendances.length > 0 ? (
            <div className="space-y-2">
              {attendances.slice(0, 20).map((attendance: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {attendance.session?.class?.subject?.name} - {attendance.session?.class?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attendance.session?.sessionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={
                        attendance.status === 'present' ? 'default' :
                        attendance.status === 'late' ? 'secondary' : 'destructive'
                      }
                    >
                      {attendance.status === 'present' ? 'Có mặt' :
                       attendance.status === 'late' ? 'Muộn' : 'Vắng mặt'}
                    </Badge>
                    {attendance.note && (
                      <p className="text-xs text-muted-foreground mt-1">{attendance.note}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {attendances.length > 20 && (
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Và {attendances.length - 20} buổi học khác...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chưa có dữ liệu điểm danh</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}