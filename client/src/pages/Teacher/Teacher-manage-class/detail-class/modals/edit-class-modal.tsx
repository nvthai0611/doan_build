"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classData: any
}

export function EditClassModal({ open, onOpenChange, classData }: EditClassModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin lớp học</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Tên lớp học</label>
            <Input defaultValue={classData.name} />
          </div>
          <div>
            <label className="text-sm font-medium">Mã lớp học</label>
            <Input defaultValue={classData.code} />
          </div>
          <div>
            <label className="text-sm font-medium">Khóa học</label>
            <Select defaultValue={classData.subject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sơ Cấp">Sơ Cấp</SelectItem>
                <SelectItem value="Trung Cấp">Trung Cấp</SelectItem>
                <SelectItem value="Cao Cấp">Cao Cấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Phòng học</label>
            <Input defaultValue={classData.room} />
          </div>
          <div>
            <label className="text-sm font-medium">Ngày bắt đầu</label>
            <Input type="date" defaultValue="2025-07-26" />
          </div>
          <div>
            <label className="text-sm font-medium">Ngày kết thúc</label>
            <Input type="date" defaultValue="2025-07-30" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onOpenChange(false)}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
