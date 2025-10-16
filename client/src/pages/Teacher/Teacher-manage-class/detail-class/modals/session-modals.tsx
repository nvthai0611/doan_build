"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface SessionModalsProps {
  addSessionOpen: boolean
  setAddSessionOpen: (open: boolean) => void
  editSessionOpen: boolean
  setEditSessionOpen: (open: boolean) => void
  selectedItem: any
}

export function SessionModals({
  addSessionOpen,
  setAddSessionOpen,
  editSessionOpen,
  setEditSessionOpen,
  selectedItem,
}: SessionModalsProps) {
  return (
    <>
      {/* Add Session Modal */}
      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm buổi học mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề buổi học</label>
              <Input placeholder="Nhập tiêu đề buổi học" />
            </div>
            <div>
              <label className="text-sm font-medium">Ngày học</label>
              <Input type="date" />
            </div>
            {/* <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select defaultValue="sap-toi">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sap-toi">Sắp tới</SelectItem>
                  <SelectItem value="dang-dien-ra">Đang diễn ra</SelectItem>
                  <SelectItem value="hoan-thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea placeholder="Nhập ghi chú cho buổi học" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSessionOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setAddSessionOpen(false)}>Thêm buổi học</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Modal */}
      <Dialog open={editSessionOpen} onOpenChange={setEditSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa buổi học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề buổi học</label>
              <Input defaultValue={selectedItem?.title} />
            </div>
            <div>
              <label className="text-sm font-medium">Ngày học</label>
              <Input type="date" defaultValue="2025-07-26" />
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select defaultValue={selectedItem?.status === "Hoàn thành" ? "hoan-thanh" : "sap-toi"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sap-toi">Sắp tới</SelectItem>
                  <SelectItem value="dang-dien-ra">Đang diễn ra</SelectItem>
                  <SelectItem value="hoan-thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea placeholder="Nhập ghi chú cho buổi học" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSessionOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setEditSessionOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
