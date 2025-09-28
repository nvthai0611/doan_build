"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Edit, Trash2 } from "lucide-react"

interface BuoiHocTabProps {
  onAddSession: () => void
  onEditSession: (session: any) => void
  onDeleteSession: (session: any) => void
}

export function BuoiHocTab({ onAddSession, onEditSession, onDeleteSession }: BuoiHocTabProps) {
  const sessions = [
    { id: 1, title: "Buổi 1: Giới thiệu về Hóa học", date: "26/07/2025", status: "Hoàn thành", attendance: 24 },
    { id: 2, title: "Buổi 2: Nguyên tử và phân tử", date: "29/07/2025", status: "Hoàn thành", attendance: 23 },
    { id: 3, title: "Buổi 3: Bảng tuần hoàn", date: "02/08/2025", status: "Sắp tới", attendance: 0 },
  ]

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Danh sách buổi học
          </CardTitle>
          <Button onClick={onAddSession}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm buổi học
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{session.title}</p>
                  <p className="text-sm text-muted-foreground">Ngày: {session.date}</p>
                  {session.attendance > 0 && (
                    <p className="text-sm text-muted-foreground">Có mặt: {session.attendance}/25 học viên</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={session.status === "Hoàn thành" ? "default" : "secondary"}>{session.status}</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditSession(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteSession(session)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
