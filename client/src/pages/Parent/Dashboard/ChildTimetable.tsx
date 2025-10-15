"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import type { Child } from "./ListChildren"

interface ChildTimetableProps {
  child: Child
}

export function ChildTimetable({ child }: ChildTimetableProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week")

  const weeklySchedule = [
    {
      day: "Thứ 2",
      date: "23/09",
      classes: [
        { time: "7:00 - 8:30", subject: "Toán học", room: "Phòng 101", teacher: "Nguyễn Văn A" },
        { time: "9:00 - 10:30", subject: "Văn học", room: "Phòng 102", teacher: "Trần Thị B" },
        { time: "14:00 - 15:30", subject: "Tiếng Anh", room: "Phòng 201", teacher: "Lê Văn C" },
      ],
    },
    {
      day: "Thứ 3",
      date: "24/09",
      classes: [
        { time: "7:00 - 8:30", subject: "Vật lý", room: "Phòng 203", teacher: "Phạm Văn D" },
        { time: "9:00 - 10:30", subject: "Hóa học", room: "Lab 1", teacher: "Hoàng Thị E" },
      ],
    },
    {
      day: "Thứ 4",
      date: "25/09",
      classes: [
        { time: "7:00 - 8:30", subject: "Sinh học", room: "Phòng 105", teacher: "Đỗ Văn F" },
        { time: "9:00 - 10:30", subject: "Lịch sử", room: "Phòng 106", teacher: "Vũ Thị G" },
        { time: "14:00 - 15:30", subject: "Địa lý", room: "Phòng 107", teacher: "Bùi Văn H" },
      ],
    },
    {
      day: "Thứ 5",
      date: "26/09",
      classes: [
        { time: "7:00 - 8:30", subject: "Toán học", room: "Phòng 101", teacher: "Nguyễn Văn A" },
        { time: "9:00 - 10:30", subject: "Tiếng Anh", room: "Phòng 201", teacher: "Lê Văn C" },
      ],
    },
    {
      day: "Thứ 6",
      date: "27/09",
      classes: [
        { time: "7:00 - 8:30", subject: "Thể dục", room: "Sân vận động", teacher: "Ngô Văn I" },
        { time: "9:00 - 10:30", subject: "Âm nhạc", room: "Phòng 301", teacher: "Mai Thị K" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Lịch học của {child.name}</h3>
              <p className="text-sm text-muted-foreground">{child.class}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("week")}
              >
                Tuần
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Tháng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      {viewMode === "week" && (
        <div className="space-y-4">
          {weeklySchedule.map((day) => (
            <Card key={day.day}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {day.day} - {day.date}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.classes.map((classItem, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg border border-border">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-primary">{classItem.time}</div>
                    <div className="flex-1">
                      <p className="font-medium">{classItem.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.room} • GV: {classItem.teacher}
                      </p>
                    </div>
                    <Badge variant="outline">Sắp tới</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Monthly Calendar View */}
      {viewMode === "month" && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch tháng 9/2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-12">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Chế độ xem theo tháng đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
