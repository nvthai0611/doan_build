"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity,
  Calendar,
  UserPlus,
  Edit,
  Link as LinkIcon,
  Unlink
} from "lucide-react"

interface ParentActivityTabProps {
  parentId: string
}

export function ParentActivityTab({ parentId }: ParentActivityTabProps) {
  // Mock activity data - replace with actual API call when available
  const activities = [
    {
      id: 1,
      type: "create",
      title: "Tạo tài khoản",
      description: "Tài khoản phụ huynh được tạo",
      date: "2024-01-15T10:00:00",
      icon: UserPlus,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "link",
      title: "Liên kết học sinh",
      description: "Liên kết với học sinh Nguyễn Văn B (HV000001)",
      date: "2024-01-20T14:30:00",
      icon: LinkIcon,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "edit",
      title: "Cập nhật thông tin",
      description: "Cập nhật số điện thoại và địa chỉ email",
      date: "2024-03-10T09:15:00",
      icon: Edit,
      color: "text-orange-600"
    },
    {
      id: 4,
      type: "unlink",
      title: "Hủy liên kết",
      description: "Hủy liên kết với học sinh Trần Thị C (HV000002)",
      date: "2024-05-22T16:45:00",
      icon: Unlink,
      color: "text-red-600"
    }
  ]

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Lịch sử hoạt động
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const { date, time } = formatDateTime(activity.date)
              const Icon = activity.icon
              
              return (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${activity.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {activity.type === 'create' && 'Tạo mới'}
                          {activity.type === 'link' && 'Liên kết'}
                          {activity.type === 'edit' && 'Chỉnh sửa'}
                          {activity.type === 'unlink' && 'Hủy liên kết'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{date}</span>
                        <span>•</span>
                        <span>{time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có hoạt động nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
