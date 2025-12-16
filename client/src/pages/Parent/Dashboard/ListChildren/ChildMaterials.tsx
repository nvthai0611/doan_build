"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Loading from "../../../../components/Loading/LoadingPage"
import { parentMaterialsService } from "../../../../services/parent/materials/materials.service"
import type { ParentMaterial } from "../../../../services/parent/materials/materials.types"
import { parentChildClassesService } from "../../../../services/parent/child-classes/child-classes.service"
import type { ChildClass } from "../../../../services/parent/child-classes/child-classes.types"

interface ChildMaterialsProps {
  childId: string
  classId?: string
}

export function ChildMaterials({ childId, classId }: ChildMaterialsProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(classId)

  // Lấy danh sách lớp mà học sinh này đang theo học (để filter tài liệu theo lớp)
  const { data: childClassesData } = useQuery({
    queryKey: ["parent-child-classes-materials", childId],
    queryFn: () => parentChildClassesService.getChildClasses(childId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!childId,
  })

  const enrolledClasses: ChildClass[] = useMemo(() => {
    if (!childClassesData) return []
    const topLevelData = (childClassesData as any)?.data ?? childClassesData

    // Trường hợp BE trả về trực tiếp mảng classes
    if (Array.isArray(topLevelData)) {
      return topLevelData as ChildClass[]
    }

    // Trường hợp cũ: { data: { enrolledClasses: Class[] } }
    const nested = (topLevelData as any)?.enrolledClasses
    return Array.isArray(nested) ? nested as ChildClass[] : []
  }, [childClassesData])

  // Mặc định chọn lớp đầu tiên nếu chưa có classId
  if (!selectedClassId && enrolledClasses.length > 0) {
    setSelectedClassId(enrolledClasses[0].id)
  }

  const effectiveClassId = selectedClassId

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["parentMaterials", { childId, classId: effectiveClassId }],
    queryFn: () => {
      return parentMaterialsService.list({ childId, classId: effectiveClassId, limit: 50 });
    },
    enabled: !!childId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const items: ParentMaterial[] = (data as any)?.items || []

  if (!childId) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Tài liệu học tập của con
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Tài liệu học tập của con
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">
            Lỗi tải dữ liệu: {(error as any)?.message || "Không xác định"}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleDownload = async (item: ParentMaterial) => {
    try {
      if ((item as any).fileUrl) {
        window.open((item as any).fileUrl as string, "_blank", "noopener,noreferrer")
      }
      await parentMaterialsService.markDownload((item as any).id)
    } catch (_) {
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

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'lesson': 'Bài học',
      'exercise': 'Bài tập', 
      'exam': 'Đề thi',
      'material': 'Tài liệu',
      'reference': 'Tham khảo',
      'other': 'Khác'
    }
    return categoryMap[category] || category
  }

  return (
    <Card className="border">
      <CardHeader>
        <div className="space-y-3">
          <CardTitle className="text-base font-semibold">
            Tài liệu học tập của con
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Lọc theo lớp:</span>
            <select
              className="border rounded-md px-3 py-1 text-sm bg-white"
              value={selectedClassId || (enrolledClasses[0]?.id || "")}
              onChange={(e) => setSelectedClassId(e.target.value as any)}
            >
              {enrolledClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                  {cls.subject?.name ? ` - ${cls.subject.name}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {items.length > 0 ? (
              <div className="space-y-4">
                {(data as any)?.stats && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded bg-gray-50 text-sm text-gray-800">
                    <div className="text-center">
                      <div className="text-base font-semibold">
                        {(data as any).stats.totalSize
                          ? formatSize((data as any).stats.totalSize)
                          : "0"}
                      </div>
                      <div>Tổng dung lượng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-semibold">
                        {(data as any).stats.recentUploads || 0}
                      </div>
                      <div>Tài liệu mới</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={(item as any).id}
                      className="border rounded p-4 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {(item as any).title}
                            </h3>
                            {(item as any).category && (
                              <Badge variant="outline" className="text-xs">
                                {getCategoryDisplayName((item as any).category)}
                              </Badge>
                            )}
                          </div>

                          {(item as any).description && (
                            <p className="text-sm text-gray-700">
                              {(item as any).description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <span>{(item as any).fileName}</span>
                            <span>{formatSize((item as any).fileSize)}</span>
                            <span>
                              {new Date(
                                (item as any).uploadedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>

                          {(item as any).teacherName && (
                            <p className="text-sm text-gray-600">
                              Giáo viên: {(item as any).teacherName}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(item)}
                          disabled={!(item as any).fileUrl}
                        >
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium text-gray-600">
                  Chưa có tài liệu nào
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Chưa có tài liệu được tải lên cho lớp học của con
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ChildMaterials


