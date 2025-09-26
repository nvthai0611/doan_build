"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BookOpen, Calendar, Clock, Edit, ChevronDown, ArrowRight } from "lucide-react"
import { formatDate } from "../../../../../utils/format"

interface ThongTinChungTabProps {
  classData: any
  description: string
  setDescription: (value: string) => void
  onEditClass: () => void
  onEditSchedule: () => void
  allDays: any
}

export function ThongTinChungTab({
  classData,
  description,
  setDescription,
  onEditClass,
  onEditSchedule,
  allDays
}: ThongTinChungTabProps) {
  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Left Column - Class Details */}
      <div className="space-y-6">
        {/* Class Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chi tiết lớp học
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onEditClass}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tên lớp học</label>
                <p className="text-lg font-semibold mt-1">{classData?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Khóa học</label>
                <p className="text-lg font-semibold mt-1">{classData?.subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mã lớp học</label>
                <p className="text-lg font-semibold mt-1">{classData?.subject.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
                <p className="text-lg font-semibold mt-1">{formatDate(classData?.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
                <p className="text-lg font-semibold mt-1">{formatDate(classData?.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phòng học</label>
                <p className="text-lg font-semibold mt-1">{classData?.room.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch học hàng tuần
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onEditSchedule}>
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classData?.recurringSchedule.days.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                >
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {allDays.find((day: any) => day.value === item)?.label} {classData.recurringSchedule.startTime} <ArrowRight className="inline-block" size={14} /> {classData.recurringSchedule.endTime}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expandable Sections */}
        <div className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-accent transition-colors">
              <span className="font-medium">Thiết lập điểm tiêu chí buổi học</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-x border-b rounded-b-lg bg-card">
              <p className="text-muted-foreground">Cấu hình điểm số cho các tiêu chí đánh giá trong buổi học...</p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-accent transition-colors">
              <span className="font-medium">Thiết lập điểm tiêu chí bài tập</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-x border-b rounded-b-lg bg-card">
              <p className="text-muted-foreground">Cấu hình điểm số cho các tiêu chí đánh giá bài tập...</p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border rounded-lg hover:bg-accent transition-colors">
              <span className="font-medium">Thiết lập loại bài tập</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-x border-b rounded-b-lg bg-card">
              <p className="text-muted-foreground">Cấu hình các loại bài tập khác nhau cho lớp học...</p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
