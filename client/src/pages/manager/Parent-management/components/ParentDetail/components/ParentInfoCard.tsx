"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Users, 
  Edit,
  CheckCircle,
  XCircle
} from "lucide-react"
import { EditParentModal } from "../../EditParentModal"

interface ParentInfoCardProps {
  parentData: any
  onUpdate?: () => void
}

export function ParentInfoCard({ parentData, onUpdate }: ParentInfoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false)
    onUpdate?.()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const genderMap: any = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác"
  }

  return (
    <>
      <Card className=" top-6">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-2xl">
                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl mb-2">
              {parentData.user?.fullName}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={parentData.user?.isActive 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
              }
            >
              {parentData.user?.isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Hoạt động
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Vô hiệu hóa
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {parentData.user?.email || "-"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {parentData.user?.phone || "-"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {parentData.user?.username || "-"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {formatDate(parentData.user?.birthDate)} - {genderMap[parentData.user?.gender] || "-"}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Số học sinh:</span>
                <span className="font-medium">
                  {parentData.students?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày tạo:</span>
                <span className="font-medium">
                  {formatDate(parentData.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cập nhật:</span>
                <span className="font-medium">
                  {formatDate(parentData.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button 
            className="w-full gap-2" 
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa thông tin
          </Button>
        </CardContent>
      </Card>

      <EditParentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        parentId={parentData.id}
        parentData={parentData}
      />
    </>
  )
}
