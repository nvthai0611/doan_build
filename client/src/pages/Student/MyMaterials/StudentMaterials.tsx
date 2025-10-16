"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
 
import Loading from "../../../components/Loading/LoadingPage"
import { studentMaterialsService } from "../../../services/student/materials/materials.service"
import { GetStudentMaterialsParams, StudentMaterial } from "../../../services/student/materials/materials.types"
import { studentEnrollmentService } from "../../../services/student/enrollment/enrollment.service"

export default function StudentMaterialsPage() {
  const [classFilter, setClassFilter] = useState<string | undefined>(undefined)

  const params: GetStudentMaterialsParams = useMemo(
    () => ({ classId: classFilter, limit: 20 }),
    [classFilter]
  )

  const enrollmentsQuery = useQuery({
    queryKey: ["student", "enrollments"],
    queryFn: () => studentEnrollmentService.getEnrollments(),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["studentMaterials", params],
    queryFn: () => studentMaterialsService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const items: StudentMaterial[] = data?.items || []
  const classOptions: Array<{ id: string; name: string }> = useMemo(() => {
    const list = Array.isArray(enrollmentsQuery.data) ? enrollmentsQuery.data : []
    const seen = new Set<string>()
    const result: Array<{ id: string; name: string }> = []
    list.forEach((enr: any) => {
      const c = enr?.class
      if (c?.id && !seen.has(c.id)) {
        seen.add(c.id)
        result.push({ id: c.id, name: c.name || c.title || c.id })
      }
    })
    return result
  }, [enrollmentsQuery.data])

  const handleDownload = async (item: StudentMaterial) => {
    try {
      if (item.fileUrl) {
        // Mở file ở tab mới để tải hoặc xem, không can thiệp vào tài nguyên gốc
        window.open(item.fileUrl, "_blank", "noopener,noreferrer")
      }
      // Ghi nhận lượt tải sau khi mở file
      await studentMaterialsService.markDownload(item.id)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tài liệu học tập</CardTitle>
            <p className="text-sm text-muted-foreground">Danh sách tài liệu các môn bạn đã đăng ký</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={classFilter ?? 'all'} onValueChange={(v) => setClassFilter(v === 'all' ? undefined : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead>Giáo viên</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title || '-'}</TableCell>
                      <TableCell>{item.className}</TableCell>
                      <TableCell>{item.teacherName}</TableCell>
                      <TableCell>
                        {item.category ? <Badge variant="secondary">{item.category}</Badge> : null}
                      </TableCell>
                      <TableCell>{formatSize(item.fileSize)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleDownload(item)} disabled={!item.fileUrl}>
                          Tải xuống
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatSize(size?: number) {
  if (!size || size <= 0) return "-"
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function getSafeDisplayName(item: StudentMaterial) {
  // Hiển thị tên gốc nếu có, ưu tiên title nếu tiếng Việt hợp lý
  const name = item.fileName || item.title || 'Tài liệu'
  try {
    // Nếu tên bị URL-encoded, giải mã để hiện tiếng Việt đúng
    const decoded = decodeURIComponent(name)
    return decoded
  } catch {
    return name
  }
}

function getSafeFileName(item: StudentMaterial) {
  const name = getSafeDisplayName(item)
  // Loại bỏ ký tự không hợp lệ trong tên file trên nhiều HĐH
  return name.replace(/[\\/:*?"<>|]/g, '_')
}


