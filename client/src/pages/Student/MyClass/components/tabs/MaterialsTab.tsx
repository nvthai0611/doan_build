"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, User, FileType, BookOpen, BarChart3, FileDown } from "lucide-react"
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
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-700" />
          </div>
          Tài liệu học tập
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-6">
            {items.length > 0 ? (
              <div className="space-y-4">
                {/* Stats */}
                {data?.stats && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
                    <div className="text-center">
                      <div className="p-2 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="text-xl font-bold text-blue-800">{data.stats.totalSize ? formatSize(data.stats.totalSize) : '0'}</div>
                      <div className="text-sm text-gray-600">Tổng dung lượng</div>
                    </div>
                    <div className="text-center">
                      <div className="p-2 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                        <FileDown className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="text-xl font-bold text-blue-800">{data.stats.recentUploads || 0}</div>
                      <div className="text-sm text-gray-600">Tài liệu mới</div>
                    </div>
                  </div>
                )}
                
                {/* Materials List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-xl p-5 hover:shadow-lg transition-all duration-300 bg-white border-l-4 border-l-blue-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-blue-100 rounded">
                              <FileType className="w-4 h-4 text-blue-700" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                            {item.category && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                                {getCategoryLabel(item.category)}
                              </Badge>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="p-1 bg-blue-100 rounded">
                                <FileText className="w-3 h-3 text-blue-700" />
                              </div>
                              <span>{item.fileName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="p-1 bg-blue-100 rounded">
                                <Download className="w-3 h-3 text-blue-700" />
                              </div>
                              <span>{formatSize(item.fileSize)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="p-1 bg-blue-100 rounded">
                                <Calendar className="w-3 h-3 text-blue-700" />
                              </div>
                              <span>{new Date(item.uploadedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          
                          {item.teacherName && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                              <div className="p-1 bg-blue-100 rounded">
                                <User className="w-3 h-3 text-blue-700" />
                              </div>
                              <span>Giáo viên: {item.teacherName}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(item)} 
                          disabled={!item.fileUrl}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white border-0"
                        >
                            <Download className="w-4 h-4" />
                          Tải xuống
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">Chưa có tài liệu nào</p>
                <p className="text-sm text-gray-500 mt-1">Giáo viên chưa tải lên tài liệu cho lớp học này</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
