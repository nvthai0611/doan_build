import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { User, Phone, Mail, Calendar } from "lucide-react"

interface StudentSidebarProps {
  student: any
  accountStatus: boolean
  onAccountStatusToggle: (checked: boolean) => void
  formatDate: (date: string | Date) => string
  isUpdatingStatus?: boolean
}

export function StudentSidebar({ 
  student, 
  accountStatus, 
  onAccountStatusToggle, 
  formatDate,
  isUpdatingStatus = false
}: StudentSidebarProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={student?.user?.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gray-300">
              {student?.user?.fullName ? 
                student.user.fullName.charAt(0).toUpperCase() :
                <User className="h-16 w-16 text-gray-500" />
              }
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Account Status Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Switch
            checked={accountStatus}
            onCheckedChange={onAccountStatusToggle}
            disabled={isUpdatingStatus}
            className="data-[state=checked]:bg-indigo-600 disabled:opacity-50"
          />
          <span className="text-sm text-foreground">
            {isUpdatingStatus ? 'Đang cập nhật...' : (accountStatus ? 'Hoạt động' : 'Không hoạt động')}
          </span>
        </div>

        {/* Student Stats */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Tổng số lớp:</p>
            <p className="text-xl font-semibold text-blue-600">
              {student?.enrollments?.length || 0}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Công nợ:</p>
            <p className="text-xl font-semibold text-red-600">
              {student?.feeRecords?.reduce((total: number, fee: any) => 
                total + (fee.amount - (fee.paidAmount || 0)), 0
              ).toLocaleString('vi-VN') || 0} đ
            </p>
          </div>
        </div>

        {/* Verify Button */}
        <Button
          variant="outline"
          className="w-full mb-8 border-indigo-600 text-indigo-600 hover:bg-indigo-50 bg-transparent"
        >
          <span className="mr-2">✓</span>
          Xác thực
        </Button>

        {/* Login Account Info */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Thông tin tài khoản đăng nhập</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tên đăng nhập</p>
              <p className="text-sm text-indigo-600">{student?.user?.username || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-indigo-600">{student?.user?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-indigo-600">{student?.user?.email || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Ngày tạo tài khoản</p>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-gray-600">
                  {student?.createdAt ? formatDate(student.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}