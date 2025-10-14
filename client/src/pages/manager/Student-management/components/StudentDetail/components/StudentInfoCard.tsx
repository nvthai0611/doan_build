import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit } from "lucide-react"

interface StudentInfoCardProps {
  student: any
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Thông tin học viên</h2>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tên học viên</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.fullName || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Địa chỉ email</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.email || 'Chưa cập nhật'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.phone || 'Chưa cập nhật'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Mã học viên</p>
            <p className="text-sm font-medium text-indigo-600">{student?.studentCode || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Giới tính</p>
            <p className="text-sm font-medium text-foreground">{student?.user?.gender == 'MALE' ? 'Nam' : 'Nữ'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Ngày sinh</p>
            <p className="text-sm font-medium text-foreground">
              {student?.user?.birthDate ? new Date(student.user.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Khối lớp</p>
            <p className="text-sm font-medium text-foreground">{student?.grade || 'N/A'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Trường học</p>
            <p className="text-sm font-medium text-foreground">{student?.school?.name || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}