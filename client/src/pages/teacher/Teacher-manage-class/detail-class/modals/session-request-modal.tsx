"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sessionRequestService } from "../../../../../services/teacher/session-request/session-request.service"
import { toast } from "sonner"

interface SessionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  classId?: string
  teacherClassAssignmentId?: string
  assignmentRoom?: any
}

export function SessionRequestModal({
  isOpen,
  onClose,
  classId,
  teacherClassAssignmentId,
  assignmentRoom,
}: SessionRequestModalProps) {
  const queryClient = useQueryClient()
  const [sessionDate, setSessionDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const [reason, setReason] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [requestType, setRequestType] = useState<string>("makeup_session")

  const { mutate: createSessionRequest, isPending } = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Thiếu classId")
      if (!sessionDate || !startTime || !endTime) throw new Error("Vui lòng nhập đầy đủ ngày/giờ")
      if (!reason.trim()) throw new Error("Vui lòng nhập lý do yêu cầu")
      if (startTime >= endTime) throw new Error("Giờ bắt đầu phải trước giờ kết thúc")
      
      return await sessionRequestService.createSessionRequest({
        classId,
        sessionDate,
        startTime,
        endTime,
        roomId: roomId || assignmentRoom?.id,
        reason: reason.trim(),
        notes: notes?.trim() || undefined,
        requestType: requestType as 'makeup_session' | 'extra_session'
      })
    },
    onSuccess: async () => {
      toast.success("Gửi yêu cầu tạo buổi học thành công. Chờ chủ trung tâm duyệt.")
      onClose()
      // Invalidate danh sách buổi học theo assignmentId nếu có
      if (teacherClassAssignmentId) {
        await queryClient.invalidateQueries({ queryKey: ["class-sessions", teacherClassAssignmentId] })
      }
      // Reset form
      setSessionDate("")
      setStartTime("")
      setEndTime("")
      setRoomId(undefined)
      setReason("")
      setNotes("")
      setRequestType("makeup_session")
    },
    onError: (err: any) => {
      console.log(err);
      toast.error(err?.message || "Không thể gửi yêu cầu tạo buổi học")
    }
  })

  const handleSubmit = () => {
    createSessionRequest()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yêu cầu thêm buổi học</DialogTitle>
          <DialogDescription>
            Gửi yêu cầu tạo buổi học mới. Yêu cầu sẽ được gửi đến chủ trung tâm để duyệt.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Loại yêu cầu *</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại yêu cầu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="makeup_session">Bù buổi học</SelectItem>
                <SelectItem value="extra_session">Buổi học bổ sung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ngày học *</Label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giờ bắt đầu *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label>Giờ kết thúc *</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Lý do yêu cầu *</Label>
            <Textarea
              placeholder="Ví dụ: Bù buổi nghỉ dạy ngày 15/10, Buổi học bổ sung cho học viên..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Ghi chú thêm</Label>
            <Textarea
              placeholder="Thông tin bổ sung (không bắt buộc)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
