import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BackPayDetailModalProps {
  data: any
  open: boolean
  onClose: () => void
}

export default function BackPayDetailModal({ data, open, onClose }: BackPayDetailModalProps) {
  const fmt = (n?: number) => Number(n || 0).toLocaleString("vi-VN")

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const getSessionStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      end: { label: "Đã kết thúc", variant: "default" },
      cancelled: { label: "Đã hủy", variant: "destructive" },
      scheduled: { label: "Đã lên lịch", variant: "secondary" },
      day_off: { label: "Nghỉ", variant: "outline" },
    }

    const config = statusConfig[status || ""] || { label: status || "-", variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const InfoSection = ({ title, icon, color, children }: any) => (
    <section className={`border rounded-lg p-5 ${color}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-3">
        <div className={`w-1.5 h-6 rounded-full ${icon}`} />
        <span>{title}</span>
      </h3>
      {children}
    </section>
  )

  const InfoRow = ({ label, value, className = "" }: any) => (
    <div className={className}>
      <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  )

  const CurrencyValue = ({ value }: any) => (
    <span className="text-lg font-bold text-emerald-600">{fmt(value)} đ</span>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Chi tiết buổi học truy lĩnh
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            ID Buổi: <span className="font-mono">{data.backPayInfo.sessionId}</span>
          </p>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Back Pay Info */}
          <InfoSection
            title="Thông tin truy lĩnh"
            icon="bg-amber-500"
            color="bg-amber-50/50 border-amber-200"
          >
            <div className="space-y-4">
              <InfoRow
                label="Mô tả"
                value={data.backPayInfo.description || "-"}
              />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="ID Hóa đơn"
                  value={
                    <span className="font-mono text-sm text-gray-600">
                      {data.backPayInfo.feeRecordId || "-"}
                    </span>
                  }
                />
                <InfoRow
                  label="Doanh thu buổi"
                  value={<span className="text-blue-600 font-bold">{fmt(data.backPayInfo.revenuePerSession)} đ</span>}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="Tỷ lệ chi trả"
                  value={
                    <Badge className="w-fit bg-purple-100 text-purple-800">
                      {(data.backPayInfo.payoutRate * 100).toFixed(0)}%
                    </Badge>
                  }
                />
                <InfoRow
                  label="Số tiền truy lĩnh"
                  value={<CurrencyValue value={data.backPayInfo.payoutAmount} />}
                />
              </div>
            </div>
          </InfoSection>

          {/* Student Info */}
          {data.studentInfo && (
            <InfoSection
              title="Thông tin học sinh"
              icon="bg-blue-500"
              color="bg-blue-50/50 border-blue-200"
            >
              <div className="space-y-3">
                <InfoRow
                  label="Tên học sinh"
                  value={data.studentInfo.fullName || "-"}
                />
                <InfoRow
                  label="Email"
                  value={data.studentInfo.email || "-"}
                />
                <InfoRow
                  label="Tổng phí đăng ký"
                  value={<span className="text-orange-600 font-bold">{fmt(data.studentInfo.feeAmount)} đ</span>}
                />
              </div>
            </InfoSection>
          )}

          {/* Session Info */}
          <InfoSection
            title="Thông tin buổi học"
            icon="bg-indigo-500"
            color="bg-indigo-50/50 border-indigo-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow
                label="Ngày buổi"
                value={formatDate(data.sessionInfo.sessionDate)}
              />
              <InfoRow
                label="Giờ học"
                value={`${data.sessionInfo.startTime} - ${data.sessionInfo.endTime}`}
              />
              <InfoRow
                label="Thời lượng"
                value={`${data.sessionInfo.duration} phút`}
              />
              <InfoRow
                label="Trạng thái"
                value={getSessionStatusBadge(data.sessionInfo.status)}
              />
              {data.sessionInfo.notes && (
                <InfoRow
                  label="Ghi chú"
                  value={data.sessionInfo.notes}
                  className="md:col-span-2"
                />
              )}
            </div>
          </InfoSection>

          {/* Class Info */}
          <InfoSection
            title="Thông tin lớp học"
            icon="bg-purple-500"
            color="bg-purple-50/50 border-purple-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow
                label="Tên lớp"
                value={data.classInfo.name || "-"}
              />
              <InfoRow
                label="Mã lớp"
                value={
                  <span className="font-mono text-gray-700">
                    {data.classInfo.classCode || "-"}
                  </span>
                }
              />
              <InfoRow
                label="ID Lớp"
                value={
                  <span className="font-mono text-xs text-gray-600">
                    {data.classInfo.id || "-"}
                  </span>
                }
              />
            </div>
          </InfoSection>

          {/* Teachers Info */}
          <InfoSection
            title="Thông tin giáo viên"
            icon="bg-emerald-500"
            color="bg-emerald-50/50 border-emerald-200"
          >
            <div className="space-y-4">
              {/* Primary Teacher */}
              <div className="bg-white border rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Giáo viên chính
                </p>
                <p className="font-semibold text-gray-900">
                  {data.primaryTeacherInfo.fullName || "-"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {data.primaryTeacherInfo.email || "-"}
                </p>
              </div>

              {/* Substitute Teacher */}
              {data.substituteTeacherInfo ? (
                <div className="bg-white border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-yellow-600 uppercase mb-2">
                    ⚠️ Giáo viên thay thế
                  </p>
                  <p className="font-semibold text-gray-900">
                    {data.substituteTeacherInfo.fullName || "-"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.substituteTeacherInfo.email || "-"}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Không có giáo viên thay thế</p>
                </div>
              )}
            </div>
          </InfoSection>

          {/* Payout Details */}
          <InfoSection
            title="Thông tin thanh toán"
            icon="bg-rose-500"
            color="bg-rose-50/50 border-rose-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoRow
                label="Số học sinh"
                value={`${data.payoutDetails.studentCount || 0} HS`}
              />
              <InfoRow
                label="Phí/học sinh"
                value={
                  <span className="text-blue-600 font-semibold">
                    {fmt(data.payoutDetails.sessionFeePerStudent)} đ
                  </span>
                }
              />
              <InfoRow
                label="Tổng doanh thu"
                value={
                  <span className="text-purple-600 font-semibold">
                    {fmt(data.payoutDetails.totalSessionRevenue)} đ
                  </span>
                }
              />
              <InfoRow
                label="GV nhận"
                value={
                  <span className="text-green-600 font-semibold">
                    {fmt(data.payoutDetails.teacherEarned)} đ
                  </span>
                }
              />
            </div>

            <Separator className="my-4" />

            <InfoRow
              label="Trạng thái thanh toán"
              value={
                <Badge variant="outline" className="capitalize">
                  {data.payoutDetails.payoutStatus || "unknown"}
                </Badge>
              }
            />
          </InfoSection>
        </div>
      </DialogContent>
    </Dialog>
  )
}