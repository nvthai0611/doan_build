"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, User } from "lucide-react"
import { useState } from "react"
import type { Child } from "./ListChildren"

interface ChildExamResultsProps {
  child: Child
}

export function ChildExamResults({ child }: ChildExamResultsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const mockExamResults = [
    {
      id: "1",
      subject: "Toán học",
      examName: "Kiểm tra giữa kỳ",
      date: "15/09/2025",
      score: 8.5,
      maxScore: 10,
      status: "excellent",
      teacher: "Nguyễn Văn Giáo",
      feedback: "Em làm bài rất tốt, cần chú ý thêm phần hình học không gian",
    },
    {
      id: "2",
      subject: "Vật lý",
      examName: "Kiểm tra 15 phút",
      date: "18/09/2025",
      score: 7.0,
      maxScore: 10,
      status: "good",
      teacher: "Lê Thị Hoa",
      feedback: "Cần ôn lại phần điện học",
    },
    {
      id: "3",
      subject: "Hóa học",
      examName: "Kiểm tra thực hành",
      date: "20/09/2025",
      score: 9.0,
      maxScore: 10,
      status: "excellent",
      teacher: "Phạm Văn Nam",
      feedback: "Thực hành tốt, kỹ năng quan sát chính xác",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "average":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const filteredResults = selectedSubject
    ? mockExamResults.filter((result) => result.subject === selectedSubject)
    : mockExamResults

  const subjects = Array.from(new Set(mockExamResults.map((r) => r.subject)))

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedSubject === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubject(null)}
            >
              Tất cả môn
            </Button>
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exam Results List */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <Card key={result.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{result.score}</div>
                    <div className="text-xs text-muted-foreground">/{result.maxScore}</div>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{result.subject}</h3>
                      <p className="text-sm text-muted-foreground">{result.examName}</p>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === "excellent" ? "Xuất sắc" : result.status === "good" ? "Khá" : "Trung bình"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{result.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>GV: {result.teacher}</span>
                    </div>
                  </div>

                  {result.feedback && (
                    <div className="bg-muted p-3 rounded-md border border-border">
                      <p className="text-sm">
                        <span className="font-medium">Nhận xét:</span> {result.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
