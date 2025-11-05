"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubjectDialog } from "./components/SubjectDialog"
import { SubjectsList } from "./components/SubjectList"
import { useSubjects } from "@/hooks/use-subjects"
import { Plus, BookOpen } from "lucide-react"

export default function SubjectsPage() {
  const { subjects, isLoading, addSubject, updateSubject, deleteSubject } = useSubjects()
  const [open, setOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<(typeof subjects)[0] | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleAddSubject = async (data: Parameters<typeof addSubject>[0]) => {
    setIsSubmitting(true)
    try {
      await addSubject(data)
      setOpen(false)
      setEditingSubject(null)
    } catch (error) {
      alert("Lỗi khi thêm môn học")
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
      alert("Lỗi khi cập nhật môn học")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return
    setIsDeleting(id)
    try {
      await deleteSubject(id)
    } catch (error) {
      alert("Lỗi khi xóa môn học")
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
          <div className="text-2xl font-bold">{subjects.length}</div>
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
          subjects={subjects}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteSubject}
          isDeleting={isDeleting}
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
                description: editingSubject.description,
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
