'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable, Column } from '../../../../components/common/Table/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { usePagination } from '../../../../hooks/usePagination'
import { centerOwnerStudentService } from '../../../../services/center-owner/student-management/student.service'
import { scholarshipService } from '../../../../services/center-owner/scholarship-management/scholarship.service'
import { apiClient } from '../../../../utils/clientAxios'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'

interface StudentWithScholarship {
  id: string
  studentCode: string | null
  fullName: string
  scholarship: {
    id: string
    name: string
    percent: number
  } | null
}

export function AssignScholarshipTab() {
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0,
  })

  const queryClient = useQueryClient()
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(
    null,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [scholarshipStatusFilter, setScholarshipStatusFilter] = useState<
    'all' | 'has' | 'none'
  >('all')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithScholarship | null>(null)
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<
    string | null
  >(null)
  const [validationError, setValidationError] = useState<string>('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
      if (searchTerm !== debouncedSearchTerm) {
        pagination.setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Build query params - include scholarshipStatus filter
  const queryParams = useMemo(() => {
    const params: any = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    }

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm
    }

    if (scholarshipStatusFilter !== 'all') {
      params.scholarshipStatus = scholarshipStatusFilter
    }

    return params
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    debouncedSearchTerm,
    scholarshipStatusFilter,
  ])

  // Fetch students
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', queryParams],
    queryFn: async () => {
      const response = await centerOwnerStudentService.getStudents(queryParams)
      return response
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Fetch scholarships
  const { data: scholarshipsData, isLoading: isLoadingScholarships } = useQuery(
    {
      queryKey: ['scholarships', 'all'],
      queryFn: async () => {
        const response = await scholarshipService.getScholarships({
          limit: 1000,
        })
        return response
      },
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  )

  // Extract data from response
  const studentsRaw = (studentsData as any)?.students || []
  const paginationData = (studentsData as any)?.pagination || {
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 0,
  }
  const scholarships = (scholarshipsData as any)?.data || []

  // Map students to include scholarship info
  const students: StudentWithScholarship[] = useMemo(
    () =>
      studentsRaw.map((student: any) => ({
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.user?.fullName || '',
        scholarship: student.scholarship
          ? {
              id: student.scholarship.id,
              name: student.scholarship.name,
              percent: student.scholarship.percent,
            }
          : null,
      })),
    [studentsRaw],
  )

  // Update pagination total items from API
  useEffect(() => {
    if (paginationData.totalCount !== undefined) {
      pagination.setTotalItems(paginationData.totalCount)
    }
  }, [paginationData.totalCount])

  const handleOpenAssignDialog = useCallback((student: StudentWithScholarship) => {
    setSelectedStudent(student)
    setSelectedScholarshipId(student.scholarship?.id || null)
    setValidationError('')
    setAssignDialogOpen(true)
  }, [])

  const validateScholarshipSelection = useCallback((): boolean => {
    setValidationError('')
    
    if (!selectedScholarshipId) {
      setValidationError('Vui lòng chọn học bổng')
      return false
    }

    // Nếu đã có học bổng, phải chọn học bổng khác để cập nhật
    if (selectedStudent?.scholarship?.id === selectedScholarshipId) {
      setValidationError('Vui lòng chọn học bổng khác để cập nhật')
      return false
    }

    return true
  }, [selectedScholarshipId, selectedStudent])

  const handleAssignScholarship = useCallback(async (
    studentId: string,
    scholarshipId: string | null,
  ) => {
    // Validate trước khi submit
    if (!validateScholarshipSelection()) {
      return
    }

    setUpdatingStudentId(studentId)
    try {
      await apiClient.patch(`/admin-center/scholarships/assign/${studentId}`, {
        scholarshipId,
      })
      toast.success(
        scholarshipId
          ? 'Cấp học bổng cho học sinh thành công'
          : 'Thu hồi học bổng khỏi học sinh thành công',
      )
      await queryClient.invalidateQueries({ queryKey: ['students'] })
      setAssignDialogOpen(false)
      setSelectedStudent(null)
      setSelectedScholarshipId(null)
      setValidationError('')
    } catch (error: any) {
      console.error('Error assigning scholarship:', error)
      toast.error(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi thực hiện thao tác',
      )
    } finally {
      setUpdatingStudentId(null)
    }
  }, [queryClient, validateScholarshipSelection])

  const handleRevokeScholarship = useCallback(async (studentId: string) => {
    await handleAssignScholarship(studentId, null)
  }, [handleAssignScholarship])

  const activeScholarships = scholarships.filter((s: any) => s.isActive)

  // Define columns
  const columns: Column<StudentWithScholarship>[] = useMemo(
    () => [
      {
        key: 'studentCode',
        header: 'Mã học sinh',
        render: (item) => (
          <div className="font-medium">{item.studentCode || '-'}</div>
        ),
      },
      {
        key: 'fullName',
        header: 'Họ và tên',
        render: (item) => <div className="font-medium">{item.fullName}</div>,
      },
      {
        key: 'scholarship',
        header: 'Học bổng hiện tại',
        render: (item) => {
          if (item.scholarship) {
            return (
              <Badge variant="default" className="gap-1">
                {item.scholarship.name} ({item.scholarship.percent}%)
              </Badge>
            )
          }
          return (
            <span className="text-muted-foreground flex items-center gap-1">
              Không có
            </span>
          )
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        align: 'right',
        render: (item) => {
          return (
            <div className="flex items-center justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAssignDialog(item)}
                disabled={updatingStudentId === item.id}
              >
                Cập nhật
              </Button>
            </div>
          )
        },
      },
    ],
    [activeScholarships, updatingStudentId, handleOpenAssignDialog, handleRevokeScholarship],
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Cấp học bổng cho học sinh</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tên, mã học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Scholarship Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={scholarshipStatusFilter}
                onValueChange={(value: 'all' | 'has' | 'none') => {
                  setScholarshipStatusFilter(value);
                  pagination.setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="has">Có học bổng</SelectItem>
                  <SelectItem value="none">Không học bổng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable
        data={students}
        columns={columns}
        loading={isLoadingStudents || isLoadingScholarships}
        error={null}
        emptyMessage="Không tìm thấy học sinh nào"
        rowKey="id"
        hoverable={true}
        striped={false}
        enableSearch={false}
        enableSort={false}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: paginationData.totalPages || 1,
          totalItems: paginationData.totalCount || 0,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: (page) => {
            pagination.setCurrentPage(page);
          },
          onItemsPerPageChange: (newSize) => {
            pagination.setItemsPerPage(newSize);
            pagination.setCurrentPage(1);
          },
          showItemsPerPage: true,
          showPageInfo: true,
        }}
      />

      {/* Assign Scholarship Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.scholarship
                ? 'Cập nhật học bổng cho học sinh'
                : 'Cấp học bổng cho học sinh'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && (
                <>
                  Học sinh: <strong>{selectedStudent.fullName}</strong>
                  {selectedStudent.studentCode && (
                    <> ({selectedStudent.studentCode})</>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedStudent?.scholarship && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Học bổng hiện tại:
                </p>
                <Badge variant="default" className="gap-1">
                  {selectedStudent.scholarship.name} (
                  {selectedStudent.scholarship.percent}%)
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Chọn học bổng <span className="text-destructive">*</span>
              </label>
              <Select
                value={selectedScholarshipId || ''}
                onValueChange={(value) => {
                  setSelectedScholarshipId(value || null);
                  setValidationError(''); // Clear error when user changes selection
                }}
                disabled={updatingStudentId === selectedStudent?.id}
              >
                <SelectTrigger className={validationError ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Chọn học bổng" />
                </SelectTrigger>
                <SelectContent>
                  {activeScholarships.map((scholarship: any) => (
                    <SelectItem key={scholarship.id} value={scholarship.id}>
                      <div className="flex items-center gap-2">
                        <span>
                          {scholarship.name} ({scholarship.percent}%)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationError && (
                <p className="text-sm text-destructive mt-1">{validationError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (selectedStudent && selectedScholarshipId) {
                    handleAssignScholarship(
                      selectedStudent.id,
                      selectedScholarshipId,
                    );
                  }
                }}
                disabled={
                  updatingStudentId === selectedStudent?.id ||
                  !selectedScholarshipId
                }
              >
                {selectedStudent?.scholarship ? 'Cập nhật' : 'Cấp học bổng'}
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedStudent) {
                      handleRevokeScholarship(selectedStudent.id);
                    }
                  }}
                  disabled={
                    updatingStudentId === selectedStudent?.id ||
                    !selectedStudent?.scholarship
                  }
                  className="text-destructive hover:text-destructive"
                >
                  Thu hồi học bổng
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
