"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react"

interface ParentScheduleTabProps {
  parentData: any
}

export function ParentScheduleTab({ parentData }: ParentScheduleTabProps) {
  const students = parentData?.students || []

  // Collect all class sessions from all students
  const allSessions: any[] = []
  students.forEach((student: any) => {
    student.enrollments?.forEach((enrollment: any) => {
      if (enrollment.class) {
        allSessions.push({
          studentName: student.user?.fullName,
          studentCode: student.studentCode,
          className: enrollment.class.name,
          subject: enrollment.class.subject?.name,
          grade: enrollment.class.grade,
          status: enrollment.status
        })
      }
    })
  })

  if (allSessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có lịch học nào</p>
            <p className="text-sm text-muted-foreground mt-2">
              Các học sinh chưa được đăng ký vào lớp học nào
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch học của các con</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tổng quan lịch học của {students.length} học sinh
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allSessions.map((session, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold">{session.className}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {session.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {session.grade}
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                    >
                      {session.status === 'active' ? 'Đang học' : 
                       session.status === 'completed' ? 'Hoàn thành' : 
                       'Tạm dừng'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{session.studentName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {session.studentCode}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Lưu ý về lịch học
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Đây là danh sách các lớp học mà các con đang tham gia. 
                Để xem lịch học chi tiết, vui lòng vào trang chi tiết từng học sinh.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
