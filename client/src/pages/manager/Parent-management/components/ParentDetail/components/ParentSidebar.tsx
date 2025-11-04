"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User, Calendar, Users } from "lucide-react"

interface ParentSidebarProps {
  parentData: any
  formatDate?: (date: string | Date) => string
}

export function ParentSidebar({ parentData, formatDate }: ParentSidebarProps) {
  const defaultFormatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const format = formatDate || defaultFormatDate

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={parentData.user?.avatar} />
            <AvatarFallback className="text-2xl">
              {parentData.user?.fullName?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl mb-2">
            {parentData.user?.fullName || 'N/A'}
          </CardTitle>
          <Badge variant={parentData.user?.isActive ? "default" : "destructive"}>
            {parentData.user?.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium break-words">
                {parentData.user?.email || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="text-sm font-medium">
                {parentData.user?.phone || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
              <p className="text-sm font-medium">
                {parentData.user?.username || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Tổng số con đang giám hộ</p>
              <p className="text-sm font-medium">
                {parentData.studentCount || 0} con
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="text-sm font-medium">
                {parentData.createdAt ? format(parentData.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        {parentData.paymentStats && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold mb-3">Thống kê thanh toán</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span className="font-medium text-green-600">
                  {parentData.paymentStats.totalPaid?.toLocaleString('vi-VN')} đ
                </span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Còn nợ:</span>
                <span className="font-medium text-orange-600">
                  {parentData.paymentStats.totalPending?.toLocaleString('vi-VN')} đ
                </span>
              </div> */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số giao dịch:</span>
                <span className="font-medium">
                  {parentData.paymentStats.paymentCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
