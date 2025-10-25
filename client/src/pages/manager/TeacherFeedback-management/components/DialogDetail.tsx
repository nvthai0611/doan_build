"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface TeacherFeedback {
  id: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  parentName: string
  parentEmail: string
  studentName: string
  className: string
  rating: number
  categories: {
    teaching_quality: number
    communication: number
    punctuality: number
    professionalism: number
  }
  comment: string
  isAnonymous: boolean
  status: "pending" | "approved" | "rejected" | "archived"
  createdAt: string
}

const categoryLabels = {
  teaching_quality: "Chất lượng giảng dạy",
  communication: "Giao tiếp",
  punctuality: "Đúng giờ",
  professionalism: "Chuyên nghiệp",
}

interface FeedbackDetailDialogProps {
  feedback: TeacherFeedback | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (feedbackId: string, status: "approved" | "rejected" | "archived") => void
}

export function FeedbackDetailDialog({ feedback, open, onOpenChange, onStatusChange }: FeedbackDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!feedback) return null

  const handleStatusChange = async (newStatus: "approved" | "rejected" | "archived") => {
    setIsUpdating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onStatusChange?.(feedback.id, newStatus)
    setIsUpdating(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Đánh Giá</DialogTitle>
          <DialogDescription>ID: {feedback.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Giáo Viên</p>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={feedback.teacherAvatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {feedback.teacherName.split(" ").slice(-1)[0].substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{feedback.teacherName}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Học Sinh</p>
              <p className="font-semibold mt-2">{feedback.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phụ Huynh</p>
              <p className="font-semibold mt-2">{feedback.isAnonymous ? "Ẩn danh" : feedback.parentName}</p>
              {!feedback.isAnonymous && <p className="text-xs text-muted-foreground">{feedback.parentEmail}</p>}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lớp</p>
              <p className="font-semibold mt-2">{feedback.className}</p>
            </div>
          </div>

          {/* Overall Rating */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Đánh Giá Chung</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Đánh Giá Chi Tiết</p>
            <div className="space-y-3">
              {Object.entries(feedback.categories).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{categoryLabels[key as keyof typeof categoryLabels]}</p>
                    <span className="text-sm font-semibold">{value}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Nhận Xét</p>
            <p className="p-3 bg-muted rounded-lg text-sm">{feedback.comment}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
