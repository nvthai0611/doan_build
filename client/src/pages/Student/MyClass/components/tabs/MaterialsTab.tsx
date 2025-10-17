"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentMaterialsService } from "../../../../../services/student/materials/materials.service"
import { StudentMaterial } from "../../../../../services/student/materials/materials.types"

interface MaterialsTabProps {
  classId: string
}

export function MaterialsTab({ classId }: MaterialsTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["studentMaterials", { classId }],
    queryFn: () => studentMaterialsService.list({ classId, limit: 50 }),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const items: StudentMaterial[] = data?.items || []

  const handleDownload = async (item: StudentMaterial) => {
    try {
      if (item.fileUrl) {
        window.open(item.fileUrl, "_blank", "noopener,noreferrer")
      }
      await studentMaterialsService.markDownload(item.id)
    } catch (e) {
      // ignore
    }
  }

  const formatSize = (size?: number) => {
    if (!size || size <= 0) return "-"
    const kb = size / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tài liệu học tập
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title || '-'}</TableCell>
                      <TableCell>
                        {item.category ? <Badge variant="secondary">{item.category}</Badge> : null}
                      </TableCell>
                      <TableCell>{formatSize(item.fileSize)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(item)} 
                          disabled={!item.fileUrl}
                        >
                          Tải xuống
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có tài liệu nào cho lớp học này
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
