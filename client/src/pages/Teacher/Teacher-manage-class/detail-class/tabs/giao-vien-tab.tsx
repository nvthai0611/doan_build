"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, Edit, Trash2 } from "lucide-react"

interface GiaoVienTabProps {
  onAddTeacher: () => void
  onEditTeacher: (teacher: any) => void
  onDeleteTeacher: (teacher: any) => void
}

export function GiaoVienTab({ onAddTeacher, onEditTeacher, onDeleteTeacher }: GiaoVienTabProps) {
  const teachers = [
    { id: 1, name: "Thầy Nguyễn Văn X", email: "nguyenvanx@email.com", role: "Giáo viên chính", subject: "Hóa học" },
    { id: 2, name: "Cô Trần Thị Y", email: "tranthiy@email.com", role: "Trợ giảng", subject: "Hóa học" },
  ]

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Danh sách giáo viên
          </CardTitle>
          <Button onClick={onAddTeacher}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm giáo viên
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{teacher.role}</Badge>
                      <Badge variant="secondary">{teacher.subject}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditTeacher(teacher)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteTeacher(teacher)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
