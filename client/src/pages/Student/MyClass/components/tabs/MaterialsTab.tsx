"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentMaterialsService } from "../../../../../services/student/materials/materials.service"
import { StudentMaterial } from "../../../../../services/student/materials/materials.types"

interface MaterialsTabProps {
  classId: string
}

export function MaterialsTab({ classId }: MaterialsTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["studentMaterials", { classId }],
    queryFn: () => {
      return studentMaterialsService.list({ classId, limit: 50 });
    },
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

  const getCategoryLabel = (category?: string) => {
    if (!category) return ""
    const categoryMap: Record<string, string> = {
      'Lecture': 'Bài giảng',
      'Exercise': 'Bài tập', 
      'Reference': 'Tài liệu tham khảo',
      'reference': 'Tài liệu tham khảo',
      'Exam': 'Đề thi',
      'Other': 'Khác'
    }
    return categoryMap[category] || category
  }

  return (
    <Card className="border rounded">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Tài liệu học tập
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {items.length > 0 ? (
              <div className="space-y-4">
                {data?.stats && (
                  <div className="text-sm text-gray-700">
                    <div>Tổng dung lượng:{" "}
                      <span className="font-medium">
                        {data.stats.totalSize ? formatSize(data.stats.totalSize) : "0"}
                      </span>
                    </div>
                    <div>Tài liệu mới:{" "}
                      <span className="font-medium">
                        {data.stats.recentUploads || 0}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Materials List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base text-gray-800">
                              {item.title}
                            </h3>
                            {item.category && (
                              <Badge
                                variant="secondary"
                                className="bg-gray-100 text-gray-800 border border-gray-300 text-xs"
                              >
                                {getCategoryLabel(item.category)}
                              </Badge>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mt-2">
                            <div>{item.fileName}</div>
                            <div>{formatSize(item.fileSize)}</div>
                            <div>{new Date(item.uploadedAt).toLocaleDateString("vi-VN")}</div>
                          </div>
                          
                          {item.teacherName && (
                            <div className="mt-2 text-sm text-gray-600">
                              Giáo viên: {item.teacherName}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(item)} 
                          disabled={!item.fileUrl}
                          variant="outline"
                        >
                          Tải xuống
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-600">
                <p className="text-base font-medium">Chưa có tài liệu nào</p>
                <p className="mt-1 text-gray-500">
                  Giáo viên chưa tải lên tài liệu cho lớp học này.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
