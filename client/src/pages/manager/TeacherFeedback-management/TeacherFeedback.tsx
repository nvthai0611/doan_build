"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Star, MessageSquare, ChevronDown, ChevronUp, Sparkles, AlertCircle, CheckCircle2, Brain } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { teacherFeedbackService } from "../../../services/center-owner/teacher-feedback/teacherfeedback.service"
import type { TeacherFeedbackItem, ClassAIAnalysis } from "../../../services/center-owner/teacher-feedback/teacherfeedback.types"
import { DataTable, type Column } from "../../../components/common/Table/DataTable"

interface TeacherFeedback {
  id: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  parentName: string
  parentEmail: string
  studentName: string
  classId: string
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

type ClassRow = {
  key: string
  classId: string
  className: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  avgRating: number
  feedbackCount: number
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
  const [aiAnalysisDialog, setAiAnalysisDialog] = useState<{ classId: string; className: string } | null>(null)

  const { data: feedbackResp } = useQuery({
    queryKey: ['teacher-feedback', dateFrom, dateTo],
    queryFn: () => teacherFeedbackService.list({ dateFrom, dateTo }),
    refetchOnWindowFocus: true,
  })

  const classRows = useMemo<ClassRow[]>(() => {
    let source: TeacherFeedbackItem[] = [...((feedbackResp as TeacherFeedbackItem[] | undefined) || [])]
    if (dateFrom) {
      const fromTs = new Date(dateFrom).setHours(0, 0, 0, 0)
      source = source.filter(f => new Date(f.createdAt).getTime() >= fromTs)
    }
    if (dateTo) {
      const toTs = new Date(dateTo).setHours(23, 59, 59, 999)
      source = source.filter(f => new Date(f.createdAt).getTime() <= toTs)
    }

    source = source.filter(f => f.classId)

    const map = new Map<string, ClassRow>()

    for (const f of source as any[]) {
      const classId = f.classId

      if (!map.has(classId)) {
        map.set(classId, {
          key: classId,
          classId: f.classId,
          className: f.className,
          teacherId: f.teacherId,
          teacherName: f.teacherName,
          teacherAvatar: f.teacherAvatar,
          avgRating: 0,
          feedbackCount: 0,
          positiveFeedbacks: 0,
          negativeFeedbacks: 0,
          allFeedbacks: [],
        })
      }

      const classRow = map.get(classId)!
      classRow.feedbackCount += 1
      classRow.allFeedbacks.push(f)

      if (f.rating >= 4) {
        classRow.positiveFeedbacks += 1
      } else if (f.rating <= 2) {
        classRow.negativeFeedbacks += 1
      }
    }

    const classes = Array.from(map.values())
    classes.forEach(c => {
      const totalRating = c.allFeedbacks.reduce((sum, f) => sum + f.rating, 0)
      c.avgRating = +(totalRating / c.feedbackCount).toFixed(1)
    })

    return classes.filter((c) =>
      c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
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
  const paginatedClasses = classRows.slice(startIndex, endIndex)

  const columns: Column<ClassRow>[] = [
    {
      key: 'className',
      header: 'Lớp Học',
      render: (c) => (
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-sm text-foreground">{c.className}</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={c.teacherAvatar || '/placeholder.svg'} />
              <AvatarFallback className="text-xs">{c.teacherName.split(' ').slice(-1)[0].substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{c.teacherName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'avgRating',
      header: 'Đánh Giá TB',
      render: (c) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(c.avgRating)} />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {c.avgRating}/5 • {c.feedbackCount} đánh giá
          </span>
        </div>
      ),
    },
    {
      key: 'positiveFeedbacks',
      header: 'Thống Kê Phản Hồi',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 h-5 border-0">
            👍 {c.positiveFeedbacks}
          </Badge>
          <Badge className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs px-2 py-0.5 h-5 border-0">
            👎 {c.negativeFeedbacks}
          </Badge>
        </div>
      ),
    },
    {
      key: 'aiAnalysis',
      header: 'Phân Tích AI',
      render: (c) => (
        <AIAnalysisCell classId={c.classId} className={c.className} onViewDetails={() => {
          setAiAnalysisDialog({ classId: c.classId, className: c.className })
        }} />
      ),
    },
    {
      key: 'actions',
      header: 'Hành Động',
      align: 'center',
      render: (c) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setDialogRowKey(c.key); setDialogOpen(true); }}
          className="h-7 px-2.5 text-xs font-medium hover:bg-primary/10"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const dialogRow = useMemo(() => classRows.find(r => r.key === dialogRowKey) || null, [dialogRowKey, classRows])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Quản lý Feedback Giáo Viên</h1>
        <p className="text-muted-foreground mt-1">Danh sách các lớp học và feedback từ phụ huynh. Xem phân tích AI và chi tiết feedback của từng lớp.</p>
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
          <CardDescription>Tìm theo tên lớp hoặc giáo viên • Lọc theo ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl items-end">
            <div className="flex flex-col gap-1 relative">
              <label className="text-xs text-muted-foreground">Tìm kiếm</label>
              <Search className="absolute left-3 bottom-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tìm lớp học hoặc giáo viên..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Feedback</CardTitle>
          <CardDescription>Bảng Lớp học • Giáo viên • Đánh giá • Phân tích AI • Hành động</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedClasses}
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(classRows.length / pageSize) || 1,
              totalItems: classRows.length,
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
        dateFrom={dateFrom}
        dateTo={dateTo}
      />

      {/* AI Analysis Dialog */}
      {aiAnalysisDialog && (
        <ClassAIAnalysisDialog
          open={!!aiAnalysisDialog}
          onOpenChange={(open) => {
            if (!open) setAiAnalysisDialog(null)
          }}
          classId={aiAnalysisDialog.classId}
          className={aiAnalysisDialog.className}
        />
      )}
    </div>
  )
}

// Dialog listing feedbacks for a class; each item expandable
function FeedbackListDialog({
  open,
  onOpenChange,
  row,
  openFeedbackIds,
  setOpenFeedbackIds,
  dateFrom,
  dateTo,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  row: ClassRow | null
  openFeedbackIds: Record<string, boolean>
  setOpenFeedbackIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  dateFrom: string
  dateTo: string
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
                Feedback • {row.className}
              </span>
            ) : (
              'Feedback'
            )}
          </DialogTitle>
          {row && (
            <DialogDescription>
              {row.feedbackCount} đánh giá • Trung bình {row.avgRating}/5 • Giáo viên: {row.teacherName}
            </DialogDescription>
          )}
        </DialogHeader>

        {!row ? (
          <div className="text-sm text-muted-foreground">Chưa có dữ liệu.</div>
        ) : row.allFeedbacks.length === 0 ? (
          <div className="text-sm text-muted-foreground">Chưa có feedback cho lớp này.</div>
        ) : (
          <div className="space-y-3">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 border rounded-md">
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

// AI Analysis Cell Component for DataTable
function AIAnalysisCell({
  classId,
  className,
  onViewDetails,
}: {
  classId: string
  className: string
  onViewDetails: () => void
}) {
  const { data: aiAnalysisResp, isLoading } = useQuery({
    queryKey: ['class-ai-analysis', classId],
    queryFn: () => teacherFeedbackService.getClassAnalysis(classId),
    enabled: !!classId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  })

  const aiAnalysis = useMemo(() => {
    return (aiAnalysisResp as any)?.data as ClassAIAnalysis | undefined
  }, [aiAnalysisResp])

  const getSentimentBadge = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return (
          <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 h-5 border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Tích Cực
          </Badge>
        )
      case 'negative':
        return (
          <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 h-5 border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Tiêu Cực
          </Badge>
        )
      case 'neutral':
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 text-xs px-2 py-0.5 h-5 border-0">
            <Brain className="h-3 w-3 mr-1" />
            Trung Lập
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-xs text-muted-foreground">Đang phân tích...</span>
      </div>
    )
  }

  if (!aiAnalysis) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Chưa có phân tích</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {getSentimentBadge(aiAnalysis.sentiment)}
      <Button
        variant="ghost"
        size="sm"
        onClick={onViewDetails}
        className="h-7 px-2 text-xs hover:bg-primary/10"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1" />
        Xem
      </Button>
    </div>
  )
}

// Class AI Analysis Dialog Component with feedbacks list
function ClassAIAnalysisDialog({
  open,
  onOpenChange,
  classId,
  className,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  classId: string
  className: string
}) {
  const { data: aiAnalysisResp, isLoading: isLoadingAnalysis, refetch } = useQuery({
    queryKey: ['class-ai-analysis', classId],
    queryFn: () => teacherFeedbackService.getClassAnalysis(classId),
    enabled: open && !!classId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: feedbacksResp, isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: ['class-feedbacks', classId],
    queryFn: () => teacherFeedbackService.getClassFeedbacks(classId),
    enabled: open && !!classId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const aiAnalysis = useMemo(() => {
    const result = (aiAnalysisResp as any)?.data as ClassAIAnalysis | undefined
    if (result) {
      console.log('AI Analysis data:', result)
      console.log('Strengths:', result.strengths, 'Length:', result.strengths?.length)
      console.log('Weaknesses:', result.weaknesses, 'Length:', result.weaknesses?.length)
      console.log('Recommendations:', result.recommendations, 'Length:', result.recommendations?.length)
      console.log('Key Insights:', result.keyInsights, 'Length:', result.keyInsights?.length)
    }
    return result
  }, [aiAnalysisResp])

  const feedbacks = useMemo(() => {
    return (feedbacksResp as any)?.data as TeacherFeedbackItem[] || []
  }, [feedbacksResp])

  const [openFeedbackIds, setOpenFeedbackIds] = useState<Record<string, boolean>>({})

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900'
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'
      case 'neutral':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  if (isLoadingAnalysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Phân Tích AI • {className}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải phân tích AI...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!aiAnalysis) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Phân Tích AI • {className}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">Không thể tải phân tích AI lúc này.</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Phân Tích AI • {className}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {aiAnalysis.feedbackCount} feedback • Đánh giá TB: {aiAnalysis.avgRating}/5
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <Brain className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overall Analysis */}
          <Card className={`border-2 ${getSentimentColor(aiAnalysis.sentiment)}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Phân Tích Tổng Quan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sentiment */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Cảm xúc tổng quan</p>
                <p className="text-sm">{aiAnalysis.sentimentExplanation}</p>
              </div>

              {/* Overall Analysis */}
              {aiAnalysis.overallAnalysis && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Phân tích chi tiết</p>
                  <p className="text-sm">{aiAnalysis.overallAnalysis}</p>
                </div>
              )}

              {/* Key Insights */}
              {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Điểm quan trọng
                  </p>
                  <ul className="space-y-1">
                    {aiAnalysis.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths */}
          {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Điểm Mạnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {aiAnalysis.weaknesses && aiAnalysis.weaknesses.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Điểm Yếu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiAnalysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Brain className="h-5 w-5" />
                  Khuyến Nghị
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
