"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Phone, CalendarIcon } from "lucide-react"
import type { Child } from "../../../services/parent"

interface ChildGeneralInfoProps {
  child: Child
}

export function ChildGeneralInfo({ child }: ChildGeneralInfoProps) {
  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={child.user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{child.user?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{child.user.fullName}</h2>
                  <Badge variant="secondary" className="mt-2">
                    Học sinh
                  </Badge>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span>{child.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{child.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{child.studentCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{child.dateOfBirth?.slice(0,10)}</span>
                    </div>
                  </div>
                </div>
                <Button>Chỉnh sửa</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Thành tích học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{child.gpa}</div>
              <div className="text-sm text-muted-foreground mt-1">Điểm trung bình</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">
                {child.rank}/{child.totalStudents}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Xếp hạng lớp</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{child.attendance}%</div>
              <div className="text-sm text-muted-foreground mt-1">Tỷ lệ điểm danh</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Trạng thái hoạt động</p>
              <p className="text-sm text-muted-foreground">Tài khoản đang hoạt động bình thường</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Đang hoạt động
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
