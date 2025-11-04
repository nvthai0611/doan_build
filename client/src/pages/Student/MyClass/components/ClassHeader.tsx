import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface ClassHeaderProps {
  className: string
}

export function ClassHeader({ className }: ClassHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground mb-5">Lớp: {className}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="cursor-pointer" onClick={() => navigate("/student/my-classes")}>
            Danh sách lớp học
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Chi tiết lớp học</span>
        </div>
      </div>
    </div>
  )
}
