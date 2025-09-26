"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditScheduleModal({ open, onOpenChange }: EditScheduleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch học</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Thứ trong tuần</label>
            <Select defaultValue="thu-tu">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thu-hai">Thứ Hai</SelectItem>
                <SelectItem value="thu-ba">Thứ Ba</SelectItem>
                <SelectItem value="thu-tu">Thứ Tư</SelectItem>
                <SelectItem value="thu-nam">Thứ Năm</SelectItem>
                <SelectItem value="thu-sau">Thứ Sáu</SelectItem>
                <SelectItem value="thu-bay">Thứ Bảy</SelectItem>
                <SelectItem value="chu-nhat">Chủ Nhật</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Giờ bắt đầu</label>
              <Input type="time" defaultValue="18:00" />
            </div>
            <div>
              <label className="text-sm font-medium">Giờ kết thúc</label>
              <Input type="time" defaultValue="19:30" />
            </div>
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
