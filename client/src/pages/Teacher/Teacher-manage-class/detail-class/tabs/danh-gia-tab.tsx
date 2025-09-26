"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, Plus, Edit, Trash2 } from "lucide-react"

interface DanhGiaTabProps {
  onAddAssessment: () => void
  onEditAssessment: (assessment: any) => void
  onDeleteAssessment: (assessment: any) => void
}

export function DanhGiaTab({ onAddAssessment, onEditAssessment, onDeleteAssessment }: DanhGiaTabProps) {
  const assessments = [
    { id: 1, title: "Kiểm tra giữa kỳ", type: "Bài kiểm tra", date: "15/08/2025", completed: 20, total: 25 },
    { id: 2, title: "Bài tập về nhà tuần 1", type: "Bài tập", date: "30/07/2025", completed: 25, total: 25 },
    { id: 3, title: "Thực hành thí nghiệm", type: "Thực hành", date: "05/08/2025", completed: 18, total: 25 },
  ]

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Danh sách đánh giá
          </CardTitle>
          <Button onClick={onAddAssessment}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm đánh giá
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{assessment.title}</p>
                  <p className="text-sm text-muted-foreground">Ngày: {assessment.date}</p>
                  <p className="text-sm text-muted-foreground">
                    Hoàn thành: {assessment.completed}/{assessment.total} học viên
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{assessment.type}</Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {Math.round((assessment.completed / assessment.total) * 100)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditAssessment(assessment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteAssessment(assessment)}>
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
