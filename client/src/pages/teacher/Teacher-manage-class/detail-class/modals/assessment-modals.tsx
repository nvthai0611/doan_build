"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AssessmentModalsProps {
  addAssessmentOpen: boolean
  setAddAssessmentOpen: (open: boolean) => void
  editAssessmentOpen: boolean
  setEditAssessmentOpen: (open: boolean) => void
  selectedItem: any
}

export function AssessmentModals({
  addAssessmentOpen,
  setAddAssessmentOpen,
  editAssessmentOpen,
  setEditAssessmentOpen,
  selectedItem,
}: AssessmentModalsProps) {
  return (
    <>
      {/* Add Assessment Modal */}
      <Dialog open={addAssessmentOpen} onOpenChange={setAddAssessmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm đánh giá mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề đánh giá</label>
              <Input placeholder="Nhập tiêu đề đánh giá" />
            </div>
            <div>
              <label className="text-sm font-medium">Loại đánh giá</label>
              <Select defaultValue="bai-kiem-tra">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bai-kiem-tra">Bài kiểm tra</SelectItem>
                  <SelectItem value="bai-tap">Bài tập</SelectItem>
                  <SelectItem value="thuc-hanh">Thực hành</SelectItem>
                  <SelectItem value="du-an">Dự án</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày đánh giá</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Điểm tối đa</label>
              <Input type="number" placeholder="10" />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea placeholder="Nhập mô tả đánh giá" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAssessmentOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setAddAssessmentOpen(false)}>Thêm đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assessment Modal */}
      <Dialog open={editAssessmentOpen} onOpenChange={setEditAssessmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tiêu đề đánh giá</label>
              <Input defaultValue={selectedItem?.title} />
            </div>
            <div>
              <label className="text-sm font-medium">Loại đánh giá</label>
              <Select
                defaultValue={
                  selectedItem?.type === "Bài kiểm tra"
                    ? "bai-kiem-tra"
                    : selectedItem?.type === "Bài tập"
                      ? "bai-tap"
                      : "thuc-hanh"
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bai-kiem-tra">Bài kiểm tra</SelectItem>
                  <SelectItem value="bai-tap">Bài tập</SelectItem>
                  <SelectItem value="thuc-hanh">Thực hành</SelectItem>
                  <SelectItem value="du-an">Dự án</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày đánh giá</label>
              <Input type="date" defaultValue="2025-08-15" />
            </div>
            <div>
              <label className="text-sm font-medium">Điểm tối đa</label>
              <Input type="number" defaultValue="10" />
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea placeholder="Nhập mô tả đánh giá" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAssessmentOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setEditAssessmentOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
