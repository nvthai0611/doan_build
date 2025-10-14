import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudentScheduleTabProps {
  student: any
}

export function StudentScheduleTab({ student }: StudentScheduleTabProps) {
  const enrollments = student?.enrollments || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đang học</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Hoàn thành</Badge>
      case 'withdrawn':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Dừng học</Badge>
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Tạm dừng</Badge>
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tất cả lịch học</h3>
          
          {enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-foreground">{enrollment.class?.name}</h4>
                      <Badge variant="outline">{enrollment.class?.subject?.name}</Badge>
                    </div>
                    {getStatusBadge(enrollment.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Giáo viên:</span>
                      <p className="text-foreground mt-1">
                        {enrollment.teacherClassAssignment?.teacher?.user?.fullName || 'Chưa phân công'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-muted-foreground">Ngày đăng ký:</span>
                      <p className="text-foreground mt-1">{formatDate(enrollment.enrolledAt)}</p>
                    </div>
                    
                    {enrollment.completedAt && (
                      <div>
                        <span className="font-medium text-muted-foreground">Ngày hoàn thành:</span>
                        <p className="text-foreground mt-1">{formatDate(enrollment.completedAt)}</p>
                      </div>
                    )}
                    
                    {enrollment.finalGrade && (
                      <div>
                        <span className="font-medium text-muted-foreground">Điểm cuối khóa:</span>
                        <p className="text-foreground mt-1 font-semibold">{enrollment.finalGrade}</p>
                      </div>
                    )}
                    
                    {enrollment.completionStatus && (
                      <div>
                        <span className="font-medium text-muted-foreground">Kết quả:</span>
                        <p className="text-foreground mt-1">
                          {enrollment.completionStatus === 'PASSED' ? 'Đạt' : 'Không đạt'}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-muted-foreground">Môn học:</span>
                      <p className="text-foreground mt-1">{enrollment.class?.subject?.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Hiển thị thông tin giáo viên chi tiết nếu có */}
                  {enrollment.teacherClassAssignment?.teacher && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Thông tin giáo viên:</span>
                        <span className="text-sm text-foreground">
                          {enrollment.teacherClassAssignment.teacher.user.fullName}
                        </span>
                        {enrollment.teacherClassAssignment.teacher.user.email && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {enrollment.teacherClassAssignment.teacher.user.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Học viên chưa đăng ký lớp nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}