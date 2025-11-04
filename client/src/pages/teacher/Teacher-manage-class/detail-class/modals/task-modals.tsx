"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TaskModalsProps {
  addTaskOpen: boolean
  setAddTaskOpen: (open: boolean) => void
  editTaskOpen: boolean
  setEditTaskOpen: (open: boolean) => void
  selectedItem: any
}

export function TaskModals({
  addTaskOpen,
  setAddTaskOpen,
  editTaskOpen,
  setEditTaskOpen,
  selectedItem,
}: TaskModalsProps) {
  return (
    <>
      {/* Add Task Modal */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm công việc mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề công việc</label>
              <Input placeholder="Nhập tiêu đề công việc" />
            </div>
            <div>
              <label className="text-sm font-medium">Hạn hoàn thành</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Mức độ ưu tiên</label>
              <Select defaultValue="trung-binh">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cao">Cao</SelectItem>
                  <SelectItem value="trung-binh">Trung bình</SelectItem>
                  <SelectItem value="thap">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select defaultValue="chua-bat-dau">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chua-bat-dau">Chưa bắt đầu</SelectItem>
                  <SelectItem value="dang-thuc-hien">Đang thực hiện</SelectItem>
                  <SelectItem value="hoan-thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea placeholder="Nhập mô tả công việc" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setAddTaskOpen(false)}>Thêm công việc</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề công việc</label>
              <Input defaultValue={selectedItem?.title} />
            </div>
            <div>
              <label className="text-sm font-medium">Hạn hoàn thành</label>
              <Input type="date" defaultValue="2025-08-01" />
            </div>
            <div>
              <label className="text-sm font-medium">Mức độ ưu tiên</label>
              <Select
                defaultValue={
                  selectedItem?.priority === "Cao"
                    ? "cao"
                    : selectedItem?.priority === "Trung bình"
                      ? "trung-binh"
                      : "thap"
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cao">Cao</SelectItem>
                  <SelectItem value="trung-binh">Trung bình</SelectItem>
                  <SelectItem value="thap">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                defaultValue={
                  selectedItem?.status === "Hoàn thành"
                    ? "hoan-thanh"
                    : selectedItem?.status === "Đang thực hiện"
                      ? "dang-thuc-hien"
                      : "chua-bat-dau"
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chua-bat-dau">Chưa bắt đầu</SelectItem>
                  <SelectItem value="dang-thuc-hien">Đang thực hiện</SelectItem>
                  <SelectItem value="hoan-thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea placeholder="Nhập mô tả công việc" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTaskOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setEditTaskOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
