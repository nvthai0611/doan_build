"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { teacherClassService } from "../../../../../services/teacher"
import { toast } from "sonner"

interface SessionModalsProps {
  addSessionOpen: boolean
  setAddSessionOpen: (open: boolean) => void
  editSessionOpen: boolean
  setEditSessionOpen: (open: boolean) => void
  selectedItem: any
  classId?: string
  teacherClassAssignmentId?: string
  assignmentRoom?: any
}

export function SessionModals({
  addSessionOpen,
  setAddSessionOpen,
  editSessionOpen,
  setEditSessionOpen,
  selectedItem,
  classId,
  teacherClassAssignmentId,
  assignmentRoom,
}: SessionModalsProps) {
  const queryClient = useQueryClient()
  const [sessionDate, setSessionDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const [notes, setNotes] = useState<string>("")

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Thiếu classId")
      if (!sessionDate || !startTime || !endTime) throw new Error("Vui lòng nhập đầy đủ ngày/giờ")
      if (startTime >= endTime) throw new Error("Giờ bắt đầu phải trước giờ kết thúc")
      return await teacherClassService.createSession({
        classId,
        sessionDate,
        startTime,
        endTime,
        roomId: roomId || assignmentRoom?.id,
        notes: notes?.trim() || undefined,
      } as any)
    },
    onSuccess: async () => {
      toast.success("Tạo buổi học thành công")
      setAddSessionOpen(false)
      // Invalidate danh sách buổi học theo assignmentId nếu có
      if (teacherClassAssignmentId) {
        await queryClient.invalidateQueries({ queryKey: ["class-sessions", teacherClassAssignmentId] })
      }
      // Reset form
      setSessionDate("")
      setStartTime("")
      setEndTime("")
      setRoomId(undefined)
      setNotes("")
    },
    onError: (err: any) => {
      console.log(err);
      toast.error(err?.message || "Không thể tạo buổi học")
    }
  })

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
              <label className="text-sm font-medium">Ngày học</label>
              <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Giờ bắt đầu</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Giờ kết thúc</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            {/* <div>
              <label className="text-sm font-medium">Phòng học (tuỳ chọn)</label>
              <Input type="text" value={assignmentRoom?.name} disabled />
            </div> */}
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea placeholder="Ghi chú (tuỳ chọn)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSessionOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => createSession()} disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Thêm buổi học'}
            </Button>
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
