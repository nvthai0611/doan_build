"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentTeacherEditModalsProps {
  editStudentOpen: boolean
  setEditStudentOpen: (open: boolean) => void
  editTeacherOpen: boolean
  setEditTeacherOpen: (open: boolean) => void
  selectedItem: any
}

export function StudentTeacherEditModals({
  editStudentOpen,
  setEditStudentOpen,
  editTeacherOpen,
  setEditTeacherOpen,
  selectedItem,
}: StudentTeacherEditModalsProps) {
  return (
    <>
      {/* Edit Student Modal */}
      <Dialog open={editStudentOpen} onOpenChange={setEditStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin học viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Họ và tên</label>
              <Input defaultValue={selectedItem?.name} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" defaultValue={selectedItem?.email} />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select defaultValue={selectedItem?.status === "Đang học" ? "dang-hoc" : "da-ket-thuc"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dang-hoc">Đang học</SelectItem>
                  {/* <SelectItem value="tam-nghi">Đã Nghỉ Học</SelectItem> */}
                  <SelectItem value="da-ket-thuc">Đã Nghỉ Học</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudentOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setEditStudentOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Modal */}
      <Dialog open={editTeacherOpen} onOpenChange={setEditTeacherOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin giáo viên</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Họ và tên</label>
              <Input defaultValue={selectedItem?.name} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" defaultValue={selectedItem?.email} />
            </div>
            <div>
              <label className="text-sm font-medium">Vai trò</label>
              <Select defaultValue={selectedItem?.role === "Giáo viên chính" ? "giao-vien-chinh" : "tro-giang"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="giao-vien-chinh">Giáo viên chính</SelectItem>
                  <SelectItem value="tro-giang">Trợ giảng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Môn học</label>
              <Input defaultValue={selectedItem?.subject} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeacherOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setEditTeacherOpen(false)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
