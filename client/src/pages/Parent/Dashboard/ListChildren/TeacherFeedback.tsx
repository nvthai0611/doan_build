"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Send, Check } from "lucide-react"
import type { Child } from "../../../../services/parent/child-management/child.types"
import { parentTeacherFeedbackService } from "../../../../services/parent/teacher-feedback/teacherfeedback.service"
import type { AvailableTeacher, TeacherFeedbackItem } from "../../../../services/parent/teacher-feedback/teacherfeedback.types"

interface ChildTeacherFeedbackProps {
  child: Child
}

// Data from API
// Teachers who currently teach the selected child (active classes only)
// and feedback history items

export function ChildTeacherFeedback({ child }: ChildTeacherFeedbackProps) {
  const [teachers, setTeachers] = useState<AvailableTeacher[]>([])
  const [feedbacks, setFeedbacks] = useState<TeacherFeedbackItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [categories, setCategories] = useState({
    teaching_quality: 5,
    communication: 5,
    punctuality: 5,
    professionalism: 5,
  })
  const [comment, setComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!child?.id) return
      setLoading(true)
      setError(null)
      try {
        const [tRes, fRes] = await Promise.all([
          parentTeacherFeedbackService.getAvailableTeachers(child.id),
          parentTeacherFeedbackService.getFeedbacks(child.id),
        ])
        setTeachers((tRes.data as any) || [])
        setFeedbacks((fRes.data as any) || [])
      } catch (e: any) {
        setError(e?.message || 'Không thể tải dữ liệu phản hồi')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [child?.id])

  const handleSubmit = () => {
    if (selectedTeacher && comment.trim()) {
      setSubmitted(true)
      setComment("")
      setRating(5)
      setCategories({
        teaching_quality: 5,
        communication: 5,
        punctuality: 5,
        professionalism: 5,
      })
      setSelectedTeacher(null)
      setSelectedClass(null)
      setIsAnonymous(false)
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  const selectedTeacherData = teachers.find((t) => t.id === selectedTeacher)

  const availableClasses = selectedTeacherData ? selectedTeacherData.classes : []

  const categoryLabels = {
    teaching_quality: "Chất lượng giảng dạy",
    communication: "Giao tiếp",
    punctuality: "Đúng giờ",
    professionalism: "Chuyên nghiệp",
  }

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Gửi phản hồi về giáo viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teacher Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Chọn giáo viên *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => {
                    setSelectedTeacher(teacher.id)
                    setSelectedClass(null)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTeacher === teacher.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={(teacher as any).avatar || "/placeholder.svg"} />
                      <AvatarFallback>{teacher.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">Dạy {teacher.classes.length} lớp</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Class Selection - Only shown after teacher is selected */}
          {selectedTeacher && (
            <div>
              <label className="text-sm font-medium mb-2 block">Lớp học *</label>
              <select
                value={selectedClass || ""}
                onChange={(e) => setSelectedClass(e.target.value || null)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">-- Chọn lớp --</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="text-sm font-medium mb-3 block">Đánh giá chung *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">{rating}/5 sao</span>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <label className="text-sm font-medium block">Đánh giá chi tiết</label>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground">{categories[key as keyof typeof categories]}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setCategories({
                          ...categories,
                          [key]: star,
                        })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= categories[key as keyof typeof categories]
                            ? "fill-blue-400 text-blue-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nhận xét chi tiết *</label>
            <Textarea
              placeholder="Chia sẻ ý kiến của bạn về giáo viên, phương pháp dạy, và cách giáo viên hỗ trợ con em..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground mt-2">{comment.length}/500 ký tự</p>
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
              Gửi phản hồi ẩn danh
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={async () => {
              if (!selectedTeacher || !selectedClass || !comment.trim()) return
              try {
                setLoading(true)
                await parentTeacherFeedbackService.createFeedback(child.id, {
                  teacherId: selectedTeacher,
                  classId: selectedClass,
                  rating,
                  comment,
                  categories,
                  isAnonymous,
                })
                setSubmitted(true)
                setComment("")
                setRating(5)
                setCategories({ teaching_quality: 5, communication: 5, punctuality: 5, professionalism: 5 })
                setSelectedTeacher(null)
                setSelectedClass(null)
                setIsAnonymous(false)
                const fRes = await parentTeacherFeedbackService.getFeedbacks(child.id)
                setFeedbacks((fRes.data as any) || [])
                setTimeout(() => setSubmitted(false), 3000)
              } catch (e) {
                // ignore for now; could show toast
              } finally {
                setLoading(false)
              }
            }}
            disabled={!selectedTeacher || !selectedClass || !comment.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Gửi phản hồi
          </Button>

          {submitted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Phản hồi của bạn đã được gửi thành công. Cảm ơn bạn!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử phản hồi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => {
              return (
                <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback>{(feedback.teacherName || 'G').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{feedback.isAnonymous ? "Ẩn danh" : feedback.teacherName}</p>
                        <p className="text-xs text-muted-foreground">{feedback.className || ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{feedback.rating}/5</span>
                  </div>

                  <p className="text-sm text-foreground">{feedback.comment}</p>

                  <p className="text-xs text-muted-foreground">{new Date(feedback.date).toLocaleDateString("vi-VN")}</p>
                </div>
              )
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">Chưa có phản hồi nào</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
