import { useQuery } from "@tanstack/react-query"
import TeacherInfo from "../components/TeacherInfo/TeacherInfo"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useParams } from "react-router-dom"
import { centerOwnerTeacherService } from "../../../../services/center-owner/teacher-management/teacher.service"

export default function TeacherQnmsInfo() {
  const params = useParams()
  const teacherId = params.id as string
   // Fetch employee data
   const { data: teacher, isLoading, error } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => centerOwnerTeacherService.getTeacherById(teacherId),
    enabled: !!teacherId, 
  })
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Chi tiết giáo viên {teacher?.name}</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/center-qn" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/center-qn/teachers" className="text-muted-foreground hover:text-foreground">
                    Danh sách giáo viên
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Thông tin giáo viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>
      <TeacherInfo teacher={teacher as any} isLoading={isLoading} error={error as Error} />
    </div>
  )
}
