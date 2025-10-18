import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Student } from '../../../types/student'

interface StudentScheduleTabProps {
  student: Student
}

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({
  student
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  if (!student.enrollments || student.enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Học viên chưa đăng ký lớp học nào
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {student.enrollments.map((enrollment: any) => (
        <Card key={enrollment.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {enrollment.class.subject.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Lớp</p>
                <p className="font-medium">{enrollment.class.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã môn học</p>
                <p className="font-medium">{enrollment.class.subject.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giáo viên</p>
                <p className="font-medium">
                  {enrollment.class.teacher?.user.fullName || 'Chưa phân công'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email giáo viên</p>
                <p className="font-medium">
                  {enrollment.class.teacher?.user.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái đăng ký</p>
                <Badge>{enrollment.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đăng ký</p>
                <p className="font-medium">{formatDate(enrollment.enrolledAt)}</p>
              </div>
            </div>

            {enrollment.finalGrade !== undefined && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Điểm tổng kết</p>
                <p className="text-xl font-bold">{enrollment.finalGrade}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}