"use client"

// import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, School as SchoolIcon, Building2, Users, GraduationCap } from "lucide-react"
import { useSchools, School } from "../../../hooks/use-schools"
import { SchoolDialog } from "./components/SchoolDialog"
import { SchoolsList } from "./components/SchoolList"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export default function SchoolsPage() {
  const { schools, stats, addSchool, updateSchool, deleteSchool, isLoading } = useSchools()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<School> | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockedIds, setLockedIds] = useState<string[]>([])

  // Lock delete for schools with students or teachers
  useEffect(() => {
    const ids = (Array.isArray(schools) ? schools : [])
      .filter((s: any) => (s?.studentCount ?? 0) > 0 || (s?.teacherCount ?? 0) > 0 || s?.isInUse)
      .map((s) => s.id)
    setLockedIds(ids)
  }, [schools])

  const handleAddClick = () => {
    setEditingId(null)
    setEditingData(null)
    setDialogOpen(true)
  }

  const handleEditClick = (school: School) => {
    setEditingId(school.id)
    setEditingData(school)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async (data: {
    name: string
    address?: string
    phone?: string
  }) => {
    setIsSubmitting(true)
    try {
      // Clean data: chỉ gửi các field có giá trị
      const cleanData: any = { name: data.name }
      if (data.address && data.address.trim()) cleanData.address = data.address.trim()
      if (data.phone && data.phone.trim()) cleanData.phone = data.phone.trim()
      
      if (editingId) {
        console.log('Updating school:', { id: editingId, data: cleanData })
        await updateSchool(editingId, cleanData)
        toast.success("Cập nhật trường học thành công")
      } else {
        console.log('Creating school:', cleanData)
        await addSchool(cleanData)
        toast.success("Thêm trường học thành công")
      }
      setDialogOpen(false)
      setEditingId(null)
      setEditingData(null)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa trường học này?")) return
    
    setDeletingId(id)
    try {
      await deleteSchool(id)
      toast.success("Xóa trường học thành công")
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra"
      toast.error(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  const schoolsArray = Array.isArray(schools) ? schools : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SchoolIcon className="w-8 h-8" />
            Quản lý trường học
          </h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách các trường học trong hệ thống</p>
        </div>
        <Button onClick={handleAddClick} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm trường học
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng chi nhánh */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tổng chi nhánh</p>
                <p className="text-3xl font-bold">{stats?.totalSchools ?? schoolsArray.length}</p>
                <p className="text-xs text-muted-foreground">Chi nhánh và cơ sở</p>
              </div>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tổng học sinh */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tổng học sinh</p>
                <p className="text-3xl font-bold">{stats?.totalStudents?.toLocaleString() ?? 0}</p>
                <p className="text-xs text-muted-foreground">Trên tất cả chi nhánh</p>
              </div>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tổng giáo viên */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Tổng giáo viên</p>
                <p className="text-3xl font-bold">{stats?.totalTeachers ?? 0}</p>
                <p className="text-xs text-muted-foreground">Đang giảng dạy</p>
              </div>
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      ) : (
        <SchoolsList
          schools={schoolsArray}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isDeleting={deletingId}
          lockedIds={lockedIds}
        />
      )}

      {/* Dialog */}
      <SchoolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        initialData={
          editingData
            ? {
                name: editingData.name || "",
                address: editingData.address || "",
                phone: editingData.phone || "",
              }
            : undefined
        }
        title={editingId ? "Cập nhật trường học" : "Thêm trường học mới"}
        description={editingId ? "Cập nhật thông tin trường học" : "Tạo một trường học mới"}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
