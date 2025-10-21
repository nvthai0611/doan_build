"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, User, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../services/parent/child-management/child.service"
import type { Child, ChildGrade } from "../../../services/parent/child-management/child.types"


interface ChildExamResultsProps {
  child: Child
}

export function ChildExamResults({ child }: ChildExamResultsProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  const { 
    data: gradesData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['childGrades', child.id],
    queryFn: () => parentChildService.getChildGrades(child.id),
    enabled: !!child.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  const allExamResults: ChildGrade[] = gradesData || []

  const examResults = selectedClassId
    ? allExamResults.filter(r => r.classId === selectedClassId)
    : allExamResults

  const classes = Array.from(
    new Set(allExamResults.map(r => JSON.stringify({ id: r.classId, name: r.className })))
  ).map(s => JSON.parse(s))

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải điểm số...</span>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Có lỗi xảy ra khi tải điểm số</p>
        <Button onClick={() => refetch()} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons by Class */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedClassId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClassId(null)}
            >
              Tất cả lớp
            </Button>
            {classes.map((cls: { id?: string; name: string }) => (
              <Button
                key={cls.id || cls.name}
                variant={selectedClassId === (cls.id || null) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClassId(cls.id || null)}
              >
                {cls.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exam Results List */}
      <div className="space-y-4">
        {examResults.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Chưa có điểm số nào</p>
            </CardContent>
          </Card>
        ) : (
          examResults.map((result) => (
          <Card key={result.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.score !== null ? result.score : 'N/A'}
                    </div>
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
                      <span>{new Date(result.date).toLocaleDateString('vi-VN')}</span>
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
          ))
        )}
      </div>
    </div>
  )
}
