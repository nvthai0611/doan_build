import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column, PaginationConfig } from "../../../../../../components/common/Table/DataTable"

interface StudentAttendanceTabProps {
  student: any
}

export function StudentAttendanceTab({ student }: StudentAttendanceTabProps) {
  const attendances = useMemo(
    () =>
      (student?.attendances || []).slice().sort(
        (a: any, b: any) =>
          new Date(b.session?.sessionDate || 0).getTime() -
          new Date(a.session?.sessionDate || 0).getTime()
      ),
    [student]
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Tính thống kê điểm danh
  const attendanceStats = useMemo(
    () => ({
      total: attendances.length,
      present: attendances.filter((a: any) => a.status === "present").length,
      absent: attendances.filter((a: any) => a.status === "absent").length,
      late: attendances.filter((a: any) => a.status === "late").length,
    }),
    [attendances]
  )

  const attendanceRate =
    attendanceStats.total > 0
      ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)
      : 0

  // Paging
  const totalPages = Math.ceil(attendances.length / itemsPerPage)
  const pagedAttendances = useMemo(
    () =>
      attendances.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [attendances, currentPage, itemsPerPage]
  )

  // DataTable columns
  const columns: Column<any>[] = [
    {
      key: "subject",
      header: "Môn học",
      render: (a) => a.session?.class?.subject?.name || "-",
      width: "160px",
    },
    {
      key: "class",
      header: "Lớp",
      render: (a) => a.session?.class?.name || "-",
      width: "140px",
    },
    {
      key: "sessionDate",
      header: "Ngày học",
      render: (a) =>
        a.session?.sessionDate
          ? new Date(a.session.sessionDate).toLocaleDateString("vi-VN")
          : "-",
      width: "120px",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (a) => (
        <Badge
          variant={
            a.status === "present"
              ? "default"
              : a.status === "late"
              ? "secondary"
              : "destructive"
          }
          className={
            a.status === "present"
              ? "bg-green-100 text-green-700 border-green-200"
              : a.status === "late"
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : ""
          }
        >
          {a.status === "present"
            ? "Có mặt"
            : a.status === "late"
            ? "Muộn"
            : "Vắng mặt"}
        </Badge>
      ),
      width: "110px",
    },
    {
      key: "note",
      header: "Ghi chú",
      render: (a) =>
        a.note ? (
          <span className="text-xs text-muted-foreground">{a.note}</span>
        ) : (
          "-"
        ),
      width: "200px",
    },
  ]

  // Pagination config
  const paginationConfig: PaginationConfig = {
    currentPage,
    totalPages,
    totalItems: attendances.length,
    itemsPerPage,
    onPageChange: (page) => setCurrentPage(page),
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true,
  }

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {attendanceStats.total}
            </p>
            <p className="text-sm text-muted-foreground">Tổng buổi học</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {attendanceStats.present}
            </p>
            <p className="text-sm text-muted-foreground">Có mặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {attendanceStats.absent}
            </p>
            <p className="text-sm text-muted-foreground">Vắng mặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {attendanceRate}%
            </p>
            <p className="text-sm text-muted-foreground">Tỷ lệ tham gia</p>
          </CardContent>
        </Card>
      </div>

      {/* Lịch sử điểm danh */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Lịch sử điểm danh
          </h3>
          <DataTable
            data={pagedAttendances}
            columns={columns}
            emptyMessage="Chưa có dữ liệu điểm danh"
            className="rounded-none border-0"
            enableSearch={false}
            striped
            pagination={paginationConfig}
          />
        </CardContent>
      </Card>
    </div>
  )
}