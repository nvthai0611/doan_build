"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Trash2, Search, Info, CalendarOff, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useQuery } from "@tanstack/react-query"
import { teacherCommonService } from "../../../../../services/teacher/common/common.service"
import { DataTable, Column } from '../../../../../components/common/Table/DataTable'
import { usePagination } from '../../../../../hooks/usePagination'
import { useDebounce } from '../../../../../hooks/useDebounce'
import { SessionStatus, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '../../../../../lib/constants'
import { format } from 'date-fns'

interface BuoiHocTabProps {
  onAddSession: () => void
  onViewDetailSession: (session: any) => void
  onDeleteSession: (session: any) => void
  teacherClassAssignmentId: any
}

export function BuoiHocTab({ 
  onAddSession, 
  onViewDetailSession, 
  onDeleteSession, 
  teacherClassAssignmentId 
}: BuoiHocTabProps) {
  const [filter, setFilter] = useState<SessionStatus>(SessionStatus.HAPPENING)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0
  })
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Reset search when filter changes
  useEffect(() => {
    setSearchTerm('')
  }, [filter])

  // Reset to page 1 when filters change
  useEffect(() => {
    pagination.setCurrentPage(1)
  }, [filter, debouncedSearchTerm, startDate, endDate])

  // Fetch sessions data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['class-sessions', teacherClassAssignmentId],
    queryFn: async () => {
      return await teacherCommonService.getClassSessions(teacherClassAssignmentId)
    },
    enabled: !!teacherClassAssignmentId,
    refetchOnWindowFocus: false,
    retry: 1
  })

  const allSessions = (data || []).map((s: any, idx: number) => {
    const d = new Date(s.sessionDate)
    const dateStr = isNaN(d.getTime()) ? s.sessionDate : d.toLocaleDateString('vi-VN')
    return {
      id: s.id,
      title: `Buổi ${idx + 1}`,
      name: s.notes || s.topic || `Buổi ${idx + 1}`,
      scheduledDate: s.sessionDate,
      date: dateStr,
      status: s.status === 'scheduled' ? SessionStatus.HAPPENING : 
              s.status === 'completed' ? SessionStatus.END : 
              s.status === 'cancelled' ? SessionStatus.DAY_OFF : SessionStatus.HAS_NOT_HAPPENED,
      attendance: Array.isArray(s.attendances) ? s.attendances.length : 0,
      startTime: s.startTime,
      endTime: s.endTime,
      roomName: s.room?.name,
      teacherName: s.teacher?.name,
      totalStudents: s.totalStudents || 0,
      absentCount: s.absentCount || 0
    }
  })

  // Filter sessions
  const filteredSessions = allSessions.filter((session: any) => {
    // Filter by status
    if (filter !== SessionStatus.HAPPENING && session.status !== filter) {
      return false
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      const name = (session.name || '').toLowerCase()
      const teacherName = (session.teacherName || '').toLowerCase()
      if (!name.includes(searchLower) && !teacherName.includes(searchLower)) {
        return false
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      const sessionDate = new Date(session.scheduledDate)
      if (startDate && sessionDate < new Date(startDate)) {
        return false
      }
      if (endDate && sessionDate > new Date(endDate)) {
        return false
      }
    }

    return true
  })

  // Pagination
  const totalCount = filteredSessions.length
  const totalPages = Math.ceil(totalCount / pagination.itemsPerPage)
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
  const endIndex = startIndex + pagination.itemsPerPage
  const sessions = filteredSessions.slice(startIndex, endIndex)

  // Update pagination total items when data changes
  useEffect(() => {
    if (pagination.currentPage > totalPages && totalPages > 0) {
      pagination.setCurrentPage(totalPages)
    }
  }, [totalCount, totalPages])

  // Calculate stats
  const classSession = {
    total: allSessions.length,
    completed: allSessions.filter((s: any) => s.status === SessionStatus.END).length,
    upcoming: allSessions.filter((s: any) => s.status === SessionStatus.HAPPENING).length,
  }

  const stats = [
    {
      label: 'Tổng buổi học',
      value: classSession.total,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Buổi đã hoàn thành',
      value: classSession.completed,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Buổi sắp tới',
      value: classSession.upcoming,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ]

  // Status filters
  const statusFilters = [
    { 
      key: SessionStatus.HAPPENING, 
      label: SESSION_STATUS_LABELS[SessionStatus.HAPPENING], 
      count: allSessions.filter((s: any) => s.status === SessionStatus.HAPPENING).length 
    },
    { 
      key: SessionStatus.END, 
      label: SESSION_STATUS_LABELS[SessionStatus.END], 
      count: allSessions.filter((s: any) => s.status === SessionStatus.END).length 
    },
    { 
      key: SessionStatus.HAS_NOT_HAPPENED, 
      label: SESSION_STATUS_LABELS[SessionStatus.HAS_NOT_HAPPENED], 
      count: allSessions.filter((s: any) => s.status === SessionStatus.HAS_NOT_HAPPENED).length 
    },
    { 
      key: SessionStatus.DAY_OFF, 
      label: SESSION_STATUS_LABELS[SessionStatus.DAY_OFF], 
      count: allSessions.filter((s: any) => s.status === SessionStatus.DAY_OFF).length 
    }
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string; icon: any }> = {
      [SessionStatus.END]: { 
        variant: 'default', 
        label: SESSION_STATUS_LABELS[SessionStatus.END], 
        className: SESSION_STATUS_COLORS[SessionStatus.END],
        icon: CheckCircle
      },
      [SessionStatus.HAPPENING]: { 
        variant: 'secondary', 
        label: SESSION_STATUS_LABELS[SessionStatus.HAPPENING],
        className: SESSION_STATUS_COLORS[SessionStatus.HAPPENING],
        icon: Clock
      },
      [SessionStatus.HAS_NOT_HAPPENED]: {
        variant: 'destructive', 
        label: SESSION_STATUS_LABELS[SessionStatus.HAS_NOT_HAPPENED],
        className: SESSION_STATUS_COLORS[SessionStatus.HAS_NOT_HAPPENED],
        icon: XCircle
      },
      [SessionStatus.DAY_OFF]: {
        variant: 'outline', 
        label: SESSION_STATUS_LABELS[SessionStatus.DAY_OFF],
        className: SESSION_STATUS_COLORS[SessionStatus.DAY_OFF],
        icon: CalendarOff
      }
    }
    const config = variants[status] || variants[SessionStatus.HAPPENING]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getWeekdayName = (dateInput?: string | Date) => {
    if (!dateInput) return ''
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    const names = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return names[d.getDay()] || ''
  }

  // Define columns
  const columns: Column<any>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '10px',
      align: 'center',
      render: (_: any, index: number) => ((pagination.currentPage - 1) * pagination.itemsPerPage + index + 1),
    },
    {
      key: 'lesson',
      header: 'Buổi học',
      width: '80px',
      render: (session: any) => (
        <div>
          <div className="font-medium text-blue-600 cursor-pointer hover:underline">
            {session.name}
          </div>
          <div className="text-sm text-gray-500">
            {(() => {
              const d = session.scheduledDate
              if (!d) return '-'
              const weekday = getWeekdayName(d)
              const dateText = format(new Date(d), 'dd/MM/yyyy')
              const timeText = session.startTime && session.endTime ? ` ${session.startTime} → ${session.endTime}` : ''
              return `${weekday}: ${dateText}${timeText}`
            })()}
          </div>
          {session.roomName && (
            <div className="text-sm text-gray-500">Phòng: {session.roomName}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '80px',
      render: (session: any) => getStatusBadge(session.status)
    },
    {
      key: 'attendance',
      header: 'Sĩ số',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{session.totalStudents || 0}</span>
        </div>
      )
    },
    {
      key: 'present',
      header: 'Có mặt',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.attendance || 0}</span>
      )
    },
    {
      key: 'absent',
      header: 'Nghỉ học',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.absentCount || 0}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onViewDetailSession(session)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDeleteSession(session)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-3xl font-bold ${stat.color} p-2 rounded`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Session Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={onAddSession}>
          <Plus className="w-4 h-4" />
          Yêu cầu thêm buổi học
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-end gap-4 flex-1">
            {/* Date filters */}
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col flex-1 max-w-md">
              <label className="text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên buổi học"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and DataTable */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="border-b">
          <div className="flex">
            {statusFilters.map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === filterOption.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {filterOption.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{filterOption.count}</span>
              </button>
            ))}
          </div>
        </div>

        <DataTable
          data={sessions}
          columns={columns}
          loading={isLoading}
          error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={refetch}
          emptyMessage="Không có dữ liệu buổi học"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.setCurrentPage,
            onItemsPerPageChange: pagination.setItemsPerPage,
            showItemsPerPage: true,
            showPageInfo: true
          }}
          rowKey="id"
          hoverable={true}
          striped={false}
          enableSearch={false}
          enableSort={false}
        />
      </div>
    </div>
  )
}
