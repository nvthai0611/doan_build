"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Plus } from "lucide-react"

interface AddTeacherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeacherModal({ open, onOpenChange }: AddTeacherModalProps) {
  const availableTeachers = [
    {
      id: 1,
      name: "Cô Phạm Thị G",
      email: "phamthig@email.com",
      subjects: ["Hóa học", "Sinh học"],
      experience: "3 năm",
      currentClasses: 2,
      rating: 4.8,
      status: "Có thể nhận thêm lớp",
    },
    {
      id: 2,
      name: "Thầy Hoàng Văn H",
      email: "hoangvanh@email.com",
      subjects: ["Hóa học", "Vật lý"],
      experience: "5 năm",
      currentClasses: 1,
      rating: 4.9,
      status: "Có thể nhận thêm lớp",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm giáo viên trợ giảng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tìm kiếm giáo viên trợ giảng</label>
            <Input placeholder="Nhập tên hoặc email giáo viên..." className="mt-1" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="text-sm text-muted-foreground">Danh sách giáo viên trợ giảng có thể thêm vào lớp:</div>

            {availableTeachers.map((teacher) => (
              <div key={teacher.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <div className="flex gap-1 mt-1">
                        {teacher.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="text-xs">
                      {teacher.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Kinh nghiệm</p>
                    <p className="font-medium">{teacher.experience}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lớp hiện tại</p>
                    <p className="font-medium">{teacher.currentClasses} lớp</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Đánh giá</p>
                    <p className="font-medium">⭐ {teacher.rating}/5</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm vào lớp
                  </Button>
                  <Button variant="outline" size="sm">
                    Xem hồ sơ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
