"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Search, 
  Link as LinkIcon, 
  Unlink, 
  User, 
  Mail,
  Phone,
  GraduationCap,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { ParentService } from "../../../../../../services/center-owner/parent-management/parent.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

interface ParentStudentsTabProps {
  parentData: any
}

export function ParentStudentsTab({ parentData }: ParentStudentsTabProps) {
  const students = parentData?.students || []
  const parentId = parentData?.id
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [studentCode, setStudentCode] = useState("")
  const [searchedStudent, setSearchedStudent] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Link student mutation
  const linkStudentMutation = useMutation({
    mutationFn: (studentId: string) => ParentService.linkStudentToParent(parentId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-detail", parentId] })
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      toast.success("Liên kết học sinh thành công!")
      setStudentCode("")
      setSearchedStudent(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi liên kết học sinh")
    }
  })

  // Unlink student mutation
  const unlinkStudentMutation = useMutation({
    mutationFn: (studentId: string) => ParentService.unlinkStudentFromParent(parentId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-detail", parentId] })
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      toast.success("Hủy liên kết học sinh thành công!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi hủy liên kết")
    }
  })

  const handleSearchStudent = async () => {
    if (!studentCode.trim()) {
      toast.error("Vui lòng nhập mã học sinh")
      return
    }

    setIsSearching(true)
    try {
      const result = await ParentService.searchStudentByCode(studentCode.trim())
      setSearchedStudent(result)
      toast.success("Tìm thấy học sinh!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không tìm thấy học sinh")
      setSearchedStudent(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLinkStudent = () => {
    if (!searchedStudent) return
    linkStudentMutation.mutate(searchedStudent.id)
  }

  const handleUnlinkStudent = (studentId: string) => {
    unlinkStudentMutation.mutate(studentId)
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm và liên kết học sinh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã học sinh (VD: HV000001)"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchStudent()}
            />
            <Button
              onClick={handleSearchStudent}
              disabled={isSearching}
              variant="outline"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Searched Student Result */}
          {searchedStudent && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{searchedStudent.user?.fullName}</p>
                    <p className="text-sm text-gray-500">
                      Mã: {searchedStudent.studentCode} | Lớp: {searchedStudent.grade}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {searchedStudent.user?.email}
                      </span>
                    </div>
                    {searchedStudent.parent && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Đã có phụ huynh: {searchedStudent.parent.user?.fullName}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleLinkStudent}
                  disabled={linkStudentMutation.isPending || !!searchedStudent.parent}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Liên kết
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách học sinh ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students && students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p 
                        className="font-medium hover:text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/center-qn/students/${student.id}`)}
                      >
                        {student.user?.fullName}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <GraduationCap className="w-3 h-3" />
                          <span>{student.studentCode}</span>
                        </div>
                        {student.user?.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{student.user.email}</span>
                          </div>
                        )}
                        {student.user?.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{student.user.phone}</span>
                          </div>
                        )}
                      </div>
                      {student.school && (
                        <p className="text-xs text-gray-400 mt-1">
                          Trường: {student.school.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnlinkStudent(student.id)}
                    disabled={unlinkStudentMutation.isPending}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Unlink className="w-4 h-4 mr-1" />
                    Hủy liên kết
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Chưa có học sinh nào được liên kết</p>
              <p className="text-sm text-gray-400 mt-1">
                Sử dụng công cụ tìm kiếm ở trên để liên kết học sinh
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
