"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

interface JobDetailModalProps {
  job: any
  isOpen: boolean
  onClose: () => void
}

const jobTypeLabels: Record<string, string> = {
  "bill_generation": "Tạo hóa đơn",
  "bill_publishing": "Công bố hóa đơn",
  "change-status-session": "Thay đổi trạng thái buổi học",
  "daily_teacher_payout": "Chi trả giáo viên hàng ngày",
  "fee_reminder_due": "Nhắc nhở học phí đến hạn",
  "fee_reminder_early": "Nhắc nhở học phí sớm",
  "payroll_notification": "Thông báo bảng lương",
  "teacher_payroll_generation": "Tạo bảng lương giáo viên"
}

const statusLabels: Record<string, string> = {
  completed: "Hoàn thành",
  success: "Thành công",
  failed: "Thất bại",
  running: "Đang chạy"
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  const statusColors = {
    completed: "bg-green-500/10 text-green-400 border-green-500/30",
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    failed: "bg-red-500/10 text-red-400 border-red-500/30",
    running: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleString('vi-VN')
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}giờ ${minutes % 60}phút ${seconds % 60}giây`
    if (minutes > 0) return `${minutes}phút ${seconds % 60}giây`
    return `${seconds}giây`
  }

  const successRate = job.totalItems > 0 ? Math.round((job.successCount / job.totalItems) * 100) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/80 backdrop-blur-sm border-border/50">
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex items-center gap-2 text-lg">
                {jobTypeLabels[job.jobType] || job.jobType}
                <Badge className={`${statusColors[job.status as keyof typeof statusColors]} border`}>
                  {statusLabels[job.status] || job.status}
                </Badge>
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Mã nhiệm vụ: {job.id}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 border-b border-border/40">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
            {job.errorDetails && <TabsTrigger value="errors">Lỗi ({job.errorDetails.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm">Trạng thái thực thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Bắt đầu lúc</p>
                    <p className="font-medium text-sm mt-1">{formatDate(job.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Hoàn thành lúc</p>
                    <p className="font-medium text-sm mt-1">{formatDate(job.completedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Thời gian</p>
                    <p className="font-medium text-sm mt-1 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDuration(job.durationMs)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tỷ lệ thành công</p>
                    <p className="font-medium text-sm mt-1 text-green-400">{successRate}%</p>
                  </div>
                </div>

                {job.errorMessage && (
                  <div className="mt-4 rounded-lg bg-red-500/10 p-4 border border-red-500/30">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-200 text-sm">Lỗi</p>
                        <p className="text-xs text-red-300/80 mt-1">{job.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm">Tổng kết xử lý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium uppercase tracking-wider">Tổng số mục</span>
                  <span className="font-bold">{job.totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" /> Xử lý thành công
                  </span>
                  <span className="font-bold text-green-400">{job.successCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" /> Xử lý thất bại
                  </span>
                  <span className="font-bold text-red-400">{job.failedCount}</span>
                </div>
                <div className="mt-4 w-full h-2 rounded-full bg-muted/50 overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm">Metadata nhiệm vụ</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {job.metadata ? (
                  <div className="bg-muted/40 p-4 rounded-lg overflow-x-auto border border-border/40">
                    <pre className="text-xs font-mono text-foreground/80">{JSON.stringify(job.metadata, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Không có metadata</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {job.errorDetails && (
            <TabsContent value="errors" className="space-y-4 mt-4">
              <Card className="border-border/40 bg-card/50">
                <CardHeader className="border-b border-border/40">
                  <CardTitle className="text-sm">Mục xử lý thất bại ({job.errorDetails.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {job.errorDetails.map((error: any, idx: number) => (
                      <div key={idx} className="border border-red-500/30 rounded-lg p-3 bg-red-500/10">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-red-200 text-xs">{error.itemName}</p>
                            <p className="text-xs text-red-300/80 mt-0.5">ID: {error.itemId}</p>
                            <p className="text-xs text-red-300 mt-1 font-mono">{error.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
