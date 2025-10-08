"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Plus, Edit, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

interface HocVienTabProps {
  onAddStudent: () => void
  onEditStudent: (student: any) => void
  onDeleteStudent: (student: any) => void
}

export function HocVienTab({ onAddStudent, onEditStudent, onDeleteStudent }: HocVienTabProps) {
  const students = [
    { id: 1, name: "Nguyễn Văn A", email: "nguyenvana@email.com", status: "Đang học", attendance: "95%" },
    { id: 2, name: "Trần Thị B", email: "tranthib@email.com", status: "Đang học", attendance: "88%" },
    { id: 3, name: "Lê Văn C", email: "levanc@email.com", status: "Đã Nghỉ Học", attendance: "70%" },
  ]

  // const {data: listStudents, isLoading, error} = useQuery({
  //   queryKey: ['students'],
  //   queryFn: async () => {
  //     const response = await 
  //     if (!response.ok) throw new Error('Network response was not ok')
  //     return response.json()
  //   }
  // })

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách học viên
          </CardTitle>
          <Button onClick={onAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm học viên
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600">{student.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Tỷ lệ tham gia: {student.attendance}</p>
                    <Badge variant={student.status === "Đang học" ? "default" : "secondary"}>{student.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditStudent(student)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteStudent(student)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
