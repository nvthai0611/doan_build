"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserCheck } from "lucide-react"

interface AddStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentModal({ open, onOpenChange }: AddStudentModalProps) {
  const pendingRequests = [
    {
      id: 1,
      studentName: "Nguyễn Văn D",
      studentEmail: "nguyenvand@email.com",
      studentCode: "SV001",
      requestDate: "25/07/2025",
      message: "Em muốn tham gia lớp học Hóa 6 để nâng cao kiến thức.",
      school: "THCS Nguyễn Du",
    },
    {
      id: 2,
      studentName: "Trần Thị E",
      studentEmail: "tranthie@email.com",
      studentCode: "SV002",
      requestDate: "24/07/2025",
      message: "Em cần học thêm môn Hóa để chuẩn bị cho kỳ thi.",
      school: "THCS Lê Lợi",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Duyệt học viên vào lớp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Danh sách học viên đã đăng ký và đang chờ duyệt vào lớp học này:
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">{request.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{request.studentName}</p>
                      <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                      <p className="text-xs text-muted-foreground">Mã SV: {request.studentCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Ngày đăng ký</p>
                    <p className="text-sm font-medium">{request.requestDate}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Trường:</span> {request.school}
                  </p>
                  <div>
                    <p className="text-sm font-medium mb-1">Lý do đăng ký:</p>
                    <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">{request.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Duyệt
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Từ chối
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
