"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubjectDialog } from "./components/SubjectDialog"
import { SubjectsList } from "./components/SubjectList"
import { useSubjects } from "@/hooks/use-subjects"
import { useToast } from "@/hooks/use-toast"
import { Plus, BookOpen } from "lucide-react"

export default function SubjectsPage() {
  const { subjects, isLoading, addSubject, updateSubject, deleteSubject } = useSubjects()
  const [open, setOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<(typeof subjects)[0] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const [lockedIds, setLockedIds] = useState<string[]>([])

  // Lock delete for subjects that are in use
  useEffect(() => {
    const ids = (Array.isArray(subjects) ? subjects : [])
      .filter((s: any) => s?.isInUse)
      .map((s) => s.id)
    setLockedIds(ids)
  }, [subjects])

  // Đảm bảo subjects luôn là mảng
  const subjectsArray = Array.isArray(subjects) ? subjects : []

  const handleAddSubject = async (data: Parameters<typeof addSubject>[0]) => {
    setIsSubmitting(true)
    try {
      await addSubject(data)
      setOpen(false)
      setEditingSubject(null)
    } catch (error) {
      toast({ title: "Lỗi khi thêm môn học", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubject = async (data: Parameters<typeof updateSubject>[1]) => {
    if (!editingSubject) return
    setIsSubmitting(true)
    try {
      await updateSubject(editingSubject.id, data)
      setOpen(false)
      setEditingSubject(null)
    } catch (error) {
      toast({ title: "Lỗi khi cập nhật môn học", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return
    setIsDeleting(id)
    try {
      await deleteSubject(id)
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Lỗi khi xóa môn học"
      toast({ title: message, variant: "destructive" })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleOpenDialog = (subject?: (typeof subjects)[0]) => {
    setEditingSubject(subject || null)
    setOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Quản lý môn học
          </h1>
          <p className="text-muted-foreground mt-1">Tạo và quản lý danh sách môn học</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm môn học
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Tổng môn học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subjectsArray.length}</div>
          <p className="text-xs text-muted-foreground">Môn học đã được tạo</p>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      ) : (
        <SubjectsList
          subjects={subjectsArray}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteSubject}
          isDeleting={isDeleting}
          lockedIds={lockedIds}
        />
      )}

      {/* Dialog */}
      <SubjectDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject}
        initialData={
          editingSubject
            ? {
                code: editingSubject.code,
                name: editingSubject.name,
                description: editingSubject.description || undefined,
              }
            : undefined
        }
        title={editingSubject ? "Cập nhật môn học" : "Thêm môn học mới"}
        description={editingSubject ? "Cập nhật thông tin môn học" : "Tạo một môn học mới"}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
