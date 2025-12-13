'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useScholarships, Scholarship } from '../../../../hooks/use-scholarships'
import { ScholarshipDialog } from './ScholarshipDialog'
import { DataTable, Column } from '../../../../components/common/Table/DataTable'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { usePagination } from '../../../../hooks/usePagination'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ScholarshipManageTab() {
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0,
  })

  const {
    scholarships,
    meta,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    isSubmitting,
    isLoading,
  } = useScholarships({
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Scholarship> | null>(
    null,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Update pagination total items
  useEffect(() => {
    if (meta.total !== undefined && meta.total !== pagination.totalItems) {
      pagination.setTotalItems(meta.total)
    }
  }, [meta.total])

  const handleAddClick = () => {
    setEditingId(null)
    setEditingData(null)
    setDialogOpen(true)
  }

  const handleEditClick = (scholarship: Scholarship) => {
    setEditingId(scholarship.id)
    setEditingData(scholarship)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async (data: {
    name: string
    description: string | null
    percent: number
    criteria: any | null
    isActive: boolean
  }) => {
    try {
      if (editingId) {
        await updateScholarship(editingId, data)
        toast.success('Cập nhật học bổng thành công')
      } else {
        await addScholarship(data)
        toast.success('Thêm học bổng thành công')
      }
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Error submitting scholarship:', error)
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi lưu học bổng',
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn chắc chắn muốn xóa học bổng này?')) {
      setDeletingId(id)
      try {
        await deleteScholarship(id)
        toast.success('Xóa học bổng thành công')
      } catch (error: any) {
        console.error('Error deleting scholarship:', error)
        toast.error(
          error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học bổng',
        )
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Define columns - use useMemo to prevent recreation on every render
  const columns: Column<Scholarship>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Tên học bổng',
        render: (item) => <div className="font-medium">{item.name}</div>,
      },
      {
        key: 'description',
        header: 'Mô tả',
        render: (item) => (
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
            {item.description || '-'}
          </div>
        ),
      },
      {
        key: 'percent',
        header: 'Phần trăm giảm',
        align: 'center',
        render: (item) => (
          <div className="font-semibold text-primary">{item.percent}%</div>
        ),
      },
      {
        key: 'isActive',
        header: 'Trạng thái',
        align: 'center',
        render: (item) => (
          <Badge variant={item.isActive ? 'default' : 'secondary'}>
            {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày tạo',
        render: (item) => (
          <div className="text-sm text-muted-foreground">
            {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi })}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        align: 'right',
        render: (item) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditClick(item)}
              disabled={isSubmitting}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id)}
              disabled={isSubmitting || deletingId === item.id}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button> */}
          </div>
        ),
      },
    ],
    [isSubmitting, deletingId],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Danh sách học bổng</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các chương trình học bổng
          </p>
        </div>
        <Button onClick={handleAddClick} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm học bổng
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        data={scholarships}
        columns={columns}
        loading={isLoading}
        error={null}
        emptyMessage="Chưa có học bổng nào"
        rowKey="id"
        hoverable={true}
        striped={false}
        enableSearch={false}
        enableSort={false}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: meta.totalPages || 1,
          totalItems: meta.total || 0,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: (page) => {
            pagination.setCurrentPage(page)
          },
          onItemsPerPageChange: (newSize) => {
            pagination.setItemsPerPage(newSize)
            pagination.setCurrentPage(1)
          },
          showItemsPerPage: true,
          showPageInfo: true,
        }}
      />

      {/* Dialog */}
      <ScholarshipDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        initialData={
          editingData
            ? {
                name: editingData.name || '',
                description: editingData.description || null,
                percent: editingData.percent || 0,
                criteria: editingData.criteria || null,
                isActive: editingData.isActive !== false,
              }
            : undefined
        }
        title={editingId ? 'Cập nhật học bổng' : 'Thêm học bổng mới'}
        description={
          editingId
            ? 'Chỉnh sửa thông tin học bổng'
            : 'Nhập thông tin học bổng mới'
        }
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

