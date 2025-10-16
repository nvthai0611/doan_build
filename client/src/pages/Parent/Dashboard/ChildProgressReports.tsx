"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Child } from "./ListChildren"

interface ChildProgressReportsProps {
  child: Child
}

export function ChildProgressReports({ child }: ChildProgressReportsProps) {
  const progressReports = [
    {
      id: "1",
      period: "Tháng 9/2025",
      date: "30/09/2025",
      subjects: [
        {
          name: "Toán học",
          score: 8.5,
          trend: "up",
          comment: "Tiến bộ vượt bậc, nắm vững kiến thức cơ bản",
        },
        {
          name: "Vật lý",
          score: 7.0,
          trend: "stable",
          comment: "Cần tăng cường thực hành và làm bài tập",
        },
        {
          name: "Hóa học",
          score: 9.0,
          trend: "up",
          comment: "Xuất sắc, có khả năng tư duy logic tốt",
        },
      ],
      overallComment:
        "Học sinh có thái độ học tập tích cực, tham gia đầy đủ các hoạt động lớp. Cần duy trì và phát huy.",
      teacher: "Nguyễn Văn Giáo",
    },
    {
      id: "2",
      period: "Tháng 8/2025",
      date: "31/08/2025",
      subjects: [
        {
          name: "Toán học",
          score: 7.5,
          trend: "stable",
          comment: "Cần chú ý hơn trong giờ học",
        },
        {
          name: "Vật lý",
          score: 7.2,
          trend: "up",
          comment: "Có tiến bộ so với tháng trước",
        },
        {
          name: "Hóa học",
          score: 8.5,
          trend: "stable",
          comment: "Duy trì tốt",
        },
      ],
      overallComment: "Học sinh cần tập trung hơn trong các môn lý thuyết.",
      teacher: "Nguyễn Văn Giáo",
    },
  ]

  return (
    <div className="space-y-6">
      {progressReports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Báo cáo tiến độ - {report.period}</CardTitle>
                <CardDescription>Ngày lập: {report.date}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Tải xuống PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold">Tiến độ theo môn học</h4>
              {report.subjects.map((subject, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h5 className="font-medium">{subject.name}</h5>
                      {subject.trend === "up" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ↑ Tiến bộ
                        </Badge>
                      )}
                      {subject.trend === "stable" && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          → Ổn định
                        </Badge>
                      )}
                      {subject.trend === "down" && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          ↓ Cần cải thiện
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-bold text-primary">{subject.score}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{subject.comment}</p>
                </div>
              ))}
            </div>

            {/* Overall Comment */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">Nhận xét chung</h4>
              <p className="text-sm">{report.overallComment}</p>
              <p className="text-sm text-muted-foreground mt-2">Giáo viên chủ nhiệm: {report.teacher}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
