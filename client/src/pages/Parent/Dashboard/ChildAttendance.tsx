"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Child } from "../../../services/parent/child-management/child.types"

interface ChildAttendanceProps {
  child: Child
}

export function ChildAttendance({ child }: ChildAttendanceProps) {
  const attendanceRecords = [
    {
      date: "23/09/2025",
      day: "Thứ 2",
      status: "present",
      sessions: [
        { time: "Sáng", status: "present" },
        { time: "Chiều", status: "present" },
      ],
    },
    {
      date: "24/09/2025",
      day: "Thứ 3",
      status: "present",
      sessions: [
        { time: "Sáng", status: "present" },
        { time: "Chiều", status: "present" },
      ],
    },
    {
      date: "25/09/2025",
      day: "Thứ 4",
      status: "late",
      sessions: [
        { time: "Sáng", status: "late" },
        { time: "Chiều", status: "present" },
      ],
      note: "Đến muộn 15 phút do kẹt xe",
    },
    {
      date: "26/09/2025",
      day: "Thứ 5",
      status: "present",
      sessions: [
        { time: "Sáng", status: "present" },
        { time: "Chiều", status: "present" },
      ],
    },
    {
      date: "27/09/2025",
      day: "Thứ 6",
      status: "absent",
      sessions: [
        { time: "Sáng", status: "absent" },
        { time: "Chiều", status: "absent" },
      ],
      note: "Nghỉ ốm có phép",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✓ Có mặt
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ✗ Vắng
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            ⚠ Muộn
          </Badge>
        )
      default:
        return null
    }
  }

  const stats = {
    present: attendanceRecords.filter((r) => r.status === "present").length,
    absent: attendanceRecords.filter((r) => r.status === "absent").length,
    late: attendanceRecords.filter((r) => r.status === "late").length,
    total: attendanceRecords.length,
  }

  return (
    <div className="space-y-6">
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground mt-1">Tổng số ngày</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-muted-foreground mt-1">Có mặt</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-muted-foreground mt-1">Vắng</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
              <div className="text-sm text-muted-foreground mt-1">Đi muộn</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điểm danh</CardTitle>
          <CardDescription>Tháng 9/2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {attendanceRecords.map((record, index) => (
            <div key={index} className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">
                    {record.day} - {record.date}
                  </h4>
                </div>
                {getStatusBadge(record.status)}
              </div>

              <div className="flex gap-4 text-sm">
                {record.sessions.map((session, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-muted-foreground">{session.time}:</span>
                    {getStatusBadge(session.status)}
                  </div>
                ))}
              </div>

              {record.note && (
                <div className="mt-3 p-2 bg-background rounded text-sm">
                  <span className="font-medium">Ghi chú:</span> {record.note}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
