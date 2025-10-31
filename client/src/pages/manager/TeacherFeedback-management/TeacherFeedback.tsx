"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { teacherFeedbackService } from "../../../services/center-owner/teacher-feedback/teacherfeedback.service"
import type { TeacherFeedbackItem } from "../../../services/center-owner/teacher-feedback/teacherfeedback.types"
import { DataTable, type Column } from "../../../components/common/Table/DataTable"

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

// Small star rating renderer
const StarRating = ({ value }: { value: number }) => (
  <div className="flex gap-1" aria-label={`Đánh giá ${value} trên 5`}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
    ))}
  </div>
)

type TeacherClassRow = {
  key: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  className: string
  avgRating: number
  feedbacks: TeacherFeedback[]
  positiveFeedbacks: number
  negativeFeedbacks: number
}

type TeacherRow = {
  key: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  classes: Array<{
    className: string
    avgRating: number
    feedbackCount: number
  }>
  totalFeedbacks: number
  overallAvgRating: number
  positiveFeedbacks: number
  negativeFeedbacks: number
  allFeedbacks: TeacherFeedback[]
}

export function FeedbackTeacher() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogRowKey, setDialogRowKey] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [openFeedbackIds, setOpenFeedbackIds] = useState<Record<string, boolean>>({})
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  // Build aggregated rows: group by teacher (not teacher+class)
  const { data: feedbackResp } = useQuery({
    queryKey: ['teacher-feedback', dateFrom, dateTo],
    queryFn: () => teacherFeedbackService.list({ dateFrom, dateTo }),
    refetchOnWindowFocus: false,
  })

  const teacherRows = useMemo<TeacherRow[]>(() => {
    // Filter source by date range first (server already filters by date)
    let source: TeacherFeedbackItem[] = [...((feedbackResp as TeacherFeedbackItem[] | undefined) || [])]
    if (dateFrom) {
      const fromTs = new Date(dateFrom).setHours(0, 0, 0, 0)
      source = source.filter(f => new Date(f.createdAt).getTime() >= fromTs)
    }
    if (dateTo) {
      const toTs = new Date(dateTo).setHours(23, 59, 59, 999)
      source = source.filter(f => new Date(f.createdAt).getTime() <= toTs)
    }
    const map = new Map<string, TeacherRow>()

    for (const f of source as any[]) {
      const teacherId = f.teacherId

      if (!map.has(teacherId)) {
        map.set(teacherId, {
          key: teacherId,
          teacherId: f.teacherId,
          teacherName: f.teacherName,
          teacherAvatar: f.teacherAvatar,
          classes: [],
          totalFeedbacks: 0,
          overallAvgRating: 0,
          positiveFeedbacks: 0,
          negativeFeedbacks: 0,
          allFeedbacks: [],
        })
      }

      const teacher = map.get(teacherId)!
      teacher.totalFeedbacks += 1
      teacher.allFeedbacks.push(f)

      // Count positive/negative
      if (f.rating >= 4) {
        teacher.positiveFeedbacks += 1
      } else {
        teacher.negativeFeedbacks += 1
      }

      // Add or update class info
      let classInfo = teacher.classes.find(c => c.className === f.className)
      if (!classInfo) {
        classInfo = {
          className: f.className,
          avgRating: 0,
          feedbackCount: 0,
        }
        teacher.classes.push(classInfo)
      }
      classInfo.feedbackCount += 1
    }

    // Calculate averages
    const teachers = Array.from(map.values())
    teachers.forEach(t => {
      // Overall average
      const totalRating = t.allFeedbacks.reduce((sum, f) => sum + f.rating, 0)
      t.overallAvgRating = +(totalRating / t.totalFeedbacks).toFixed(1)

      // Per-class averages
      t.classes.forEach(c => {
        const classFeedbacks = t.allFeedbacks.filter(f => f.className === c.className)
        const classTotal = classFeedbacks.reduce((sum, f) => sum + f.rating, 0)
        c.avgRating = +(classTotal / classFeedbacks.length).toFixed(1)
      })

      // Sort classes by name
      t.classes.sort((a, b) => a.className.localeCompare(b.className))
    })

    // Filter by search
    return teachers.filter((t) =>
      t.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.classes.some(c => c.className.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm, dateFrom, dateTo, feedbackResp])

  const stats = useMemo(() => {
    const source: TeacherFeedbackItem[] = [...((feedbackResp as TeacherFeedbackItem[] | undefined) || [])]
    const total = source.length
    const avg = total === 0 ? 0 : source.reduce((sum, f) => sum + (f as any).rating, 0) / total
    return {
      total,
      avgRating: avg.toFixed(1),
    }
  }, [feedbackResp])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTeachers = teacherRows.slice(startIndex, endIndex)

  const columns: Column<TeacherRow>[] = [
    {
      key: 'teacherName',
      header: 'Giáo Viên',
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-primary/10">
            <AvatarImage src={t.teacherAvatar || '/placeholder.svg'} />
            <AvatarFallback className="text-xs font-semibold">{t.teacherName.split(' ').slice(-1)[0].substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm text-foreground">{t.teacherName}</p>
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Các Lớp Phụ Trách',
      render: (t) => (
        <div className="flex flex-col gap-2">
          {t.classes.map((cls) => (
            <div key={cls.className} className="grid grid-cols-[84px_max-content_min-content] items-center gap-1.5 w-full">
              <span className="text-xs font-semibold text-foreground">{cls.className}</span>
              <div className="inline-flex items-center justify-center gap-1 bg-yellow-50 dark:bg-yellow-950 px-2 py-0.5 rounded-full w-[56px]">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold tabular-nums text-yellow-700 dark:text-yellow-400">{cls.avgRating}</span>
              </div>
              <Badge variant="secondary" className="whitespace-nowrap text-[11px] px-2 py-0 h-5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-0">
                {cls.feedbackCount} Fb
              </Badge>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'overallAvgRating',
      header: 'Đánh Giá TB',
      render: (t) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(t.overallAvgRating)} />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {t.overallAvgRating}/5 • {t.totalFeedbacks} đánh giá
          </span>
        </div>
      ),
    },
    {
      key: 'positiveFeedbacks',
      header: 'Thống Kê Phản Hồi',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 h-5 border-0">
            👍 {t.positiveFeedbacks}
          </Badge>
          <Badge className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs px-2 py-0.5 h-5 border-0">
            👎 {t.negativeFeedbacks}
          </Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Hành Động',
      align: 'center',
      render: (t) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setDialogRowKey(t.key); setDialogOpen(true); }}
          className="h-7 px-2.5 text-xs font-medium hover:bg-primary/10"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const dialogRow = useMemo(() => teacherRows.find(r => r.key === dialogRowKey) || null, [dialogRowKey, teacherRows])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Quản lý Feedback Giáo Viên</h1>
        <p className="text-muted-foreground mt-1">Danh sách giáo viên và các lớp phụ trách, kèm đánh giá. Chọn giáo viên để xem feedback phụ huynh và bấm vào từng feedback để xem chi tiết.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Feedback</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tất cả đánh giá</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh Giá TB</CardTitle>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Trên 5 sao</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>Tìm theo tên giáo viên hoặc lớp • Lọc theo ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl items-end">
            <div className="flex flex-col gap-1 relative">
              <label className="text-xs text-muted-foreground">Tìm kiếm</label>
              <Search className="absolute left-3 bottom-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm giáo viên hoặc lớp..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Từ ngày</label>
              <input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Đến ngày</label>
              <input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table using common DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Feedback</CardTitle>
          <CardDescription>Bảng Giáo viên • Lớp • Đánh giá • Hành động</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedTeachers}
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(teacherRows.length / pageSize) || 1,
              totalItems: teacherRows.length,
              itemsPerPage: pageSize,
              onPageChange: setPage,
              onItemsPerPageChange: (n) => { setPageSize(n); setPage(1) },
            }}
            loading={false}
            error={null}
            emptyMessage="Chưa có feedback nào"
            enableSearch={false}
          />
        </CardContent>
      </Card>

      {/* Feedback list dialog */}
      <FeedbackListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        row={dialogRow}
        openFeedbackIds={openFeedbackIds}
        setOpenFeedbackIds={setOpenFeedbackIds}
      />
    </div>
  )
}

// Dialog listing feedbacks for a teacher; each item expandable
function FeedbackListDialog({
  open,
  onOpenChange,
  row,
  openFeedbackIds,
  setOpenFeedbackIds,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  row: TeacherRow | null
  openFeedbackIds: Record<string, boolean>
  setOpenFeedbackIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const [filterClass, setFilterClass] = React.useState<string>("")
  const [minRating, setMinRating] = React.useState<number>(0)
  const [onlyAnonymous, setOnlyAnonymous] = React.useState<boolean>(false)
  const [sortNewestFirst, setSortNewestFirst] = React.useState<boolean>(true)


  const filteredFeedbacks = React.useMemo(() => {
    if (!row) return [] as TeacherFeedback[]
    let list = [...row.allFeedbacks]
    if (filterClass) {
      list = list.filter((f) => f.className === filterClass)
    }
    if (minRating > 0) {
      list = list.filter((f) => f.rating === minRating)
    }
    if (onlyAnonymous) {
      list = list.filter((f) => f.isAnonymous)
    }

    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortNewestFirst ? db - da : da - db
    })
    return list
  }, [row, filterClass, minRating, onlyAnonymous, sortNewestFirst])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {row ? (
              <span>
                Feedback • {row.teacherName}
              </span>
            ) : (
              'Feedback'
            )}
          </DialogTitle>
          {row && (
            <DialogDescription>
              {row.totalFeedbacks} đánh giá • Trung bình {row.overallAvgRating}/5 • {row.classes.length} lớp
            </DialogDescription>
          )}
        </DialogHeader>

        {!row ? (
          <div className="text-sm text-muted-foreground">Chưa có dữ liệu.</div>
        ) : row.allFeedbacks.length === 0 ? (
          <div className="text-sm text-muted-foreground">Chưa có feedback cho giáo viên này.</div>
        ) : (
          <div className="space-y-3">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 border rounded-md">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Lọc theo lớp</label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {row.classes.map((c) => (
                    <option key={c.className} value={c.className}>{c.className}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Số sao</label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value={0}>Tất cả</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Sắp xếp</label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={sortNewestFirst ? 'new' : 'old'}
                  onChange={(e) => setSortNewestFirst(e.target.value === 'new')}
                >
                  <option value="new">Mới nhất</option>
                  <option value="old">Cũ nhất</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id="onlyAnonymous"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={onlyAnonymous}
                  onChange={(e) => setOnlyAnonymous(e.target.checked)}
                />
                <label htmlFor="onlyAnonymous" className="text-sm select-none">Chỉ ẩn danh</label>
              </div>
            </div>

            {filteredFeedbacks.map((f) => {
              const openItem = !!openFeedbackIds[f.id]
              const toggle = () => setOpenFeedbackIds((s) => ({ ...s, [f.id]: !openItem }))
              return (
                <div key={f.id} className="border rounded-md">
                  <button onClick={toggle} className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors text-left">
                    <div className="flex-1">
                      <div className="font-medium">
                        {f.isAnonymous ? 'Ẩn danh' : f.parentName} <span className="text-muted-foreground">• {f.isAnonymous ? 'Học sinh ẩn danh' : f.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{f.className}</Badge>
                        <span className="text-xs text-muted-foreground">Ngày: {f.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={f.rating} />
                      {openItem ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>
                  {openItem && (
                    <div className="px-4 pb-4 pt-2 space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium">Giáo Viên</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={row.teacherAvatar || '/placeholder.svg'} />
                              <AvatarFallback>{row.teacherName.split(' ').slice(-1)[0].substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-foreground">{row.teacherName}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Học Sinh</p>
                          <p className="font-semibold text-foreground mt-2">{f.isAnonymous ? 'Ẩn danh' : f.studentName}</p>
                        </div>
                        <div>
                          <p className="font-medium">Phụ Huynh</p>
                          <p className="font-semibold text-foreground mt-2">{f.isAnonymous ? 'Ẩn danh' : f.parentName}</p>
                          {!f.isAnonymous && <p className="text-xs">{f.parentEmail}</p>}
                        </div>
                        <div>
                          <p className="font-medium">Lớp</p>
                          <p className="font-semibold text-foreground mt-2">{f.className}</p>
                        </div>
                      </div>

                      {/* Overall Rating */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Đánh Giá Chung</p>
                        <StarRating value={f.rating} />
                      </div>

                      {/* Category Breakdown */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Đánh Giá Chi Tiết</p>
                        <div className="space-y-3">
                          {Object.entries(f.categories).map(([key, value]) => (
                            <div key={key}>
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-medium">
                                  {categoryLabels[key as keyof typeof categoryLabels]}
                                </p>
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
                        <p className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">{f.comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
