"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Plus, Edit, Trash2 } from "lucide-react"

interface CongViecTabProps {
  onAddTask: () => void
  onEditTask: (task: any) => void
  onDeleteTask: (task: any) => void
}

export function CongViecTab({ onAddTask, onEditTask, onDeleteTask }: CongViecTabProps) {
  const tasks = [
    { id: 1, title: "Chuẩn bị tài liệu buổi học 3", dueDate: "01/08/2025", status: "Đang thực hiện", priority: "Cao" },
    {
      id: 2,
      title: "Chấm bài kiểm tra giữa kỳ",
      dueDate: "05/08/2025",
      status: "Chưa bắt đầu",
      priority: "Trung bình",
    },
    { id: 3, title: "Họp phụ huynh", dueDate: "10/08/2025", status: "Hoàn thành", priority: "Thấp" },
  ]

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Danh sách công việc
          </CardTitle>
          <Button onClick={onAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm công việc
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">Hạn: {task.dueDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      task.priority === "Cao" ? "destructive" : task.priority === "Trung bình" ? "default" : "secondary"
                    }
                  >
                    {task.priority}
                  </Badge>
                  <Badge variant={task.status === "Hoàn thành" ? "default" : "outline"}>{task.status}</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditTask(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteTask(task)}>
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
