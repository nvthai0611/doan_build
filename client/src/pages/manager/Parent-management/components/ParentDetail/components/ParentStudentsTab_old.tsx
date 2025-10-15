"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  GraduationCap, 
  School, 
  Mail, 
  Phone,
  BookOpen,
  MapPin
} from "lucide-react"

interface ParentStudentsDetailTabProps {
  parentData: any
}

export function ParentStudentsDetailTab({ parentData }: ParentStudentsDetailTabProps) {
  const students = parentData?.students || []

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Chưa có học sinh nào được liên kết</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {students.map((student: any) => (
        <Card key={student.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={student.user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {student.user?.fullName?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl mb-1">
                    {student.user?.fullName || 'N/A'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {student.studentCode || 'N/A'}
                    </Badge>
                    <Badge variant={student.user?.isActive ? "default" : "destructive"} className="text-xs">
                      {student.user?.isActive ? 'Đang học' : 'Tạm dừng'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium break-words">
                    {student.user?.email || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                  <p className="text-sm font-medium">
                    {student.user?.phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Lớp</p>
                  <p className="text-sm font-medium">
                    {student.grade || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <School className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Trường</p>
                  <p className="text-sm font-medium">
                    {student.school?.name || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {student.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Địa chỉ</p>
                    <p className="text-sm font-medium">
                      {student.address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enrollments */}
            {student.enrollments && student.enrollments.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">
                    Khóa học đang tham gia ({student.enrollments.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {student.enrollments.map((enrollment: any) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {enrollment.class?.name || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {enrollment.class?.subject?.name || 'N/A'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {enrollment.class?.grade || ''}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={enrollment.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {enrollment.status === 'active' ? 'Đang học' : 
                         enrollment.status === 'completed' ? 'Hoàn thành' : 
                         'Tạm dừng'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
