import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type TranscriptEntry, type TranscriptFilters } from '../../../services/student/grades/grades.types'
import { studentGradesService } from '../../../services/student/grades/grades.service'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function StudentTranscriptPage() {
  // Lọc theo Lớp (bắt buộc)
  const [classId, setClassId] = useState<string | undefined>(undefined)
  
  const filters: TranscriptFilters = useMemo(() => ({ classId }), [classId])

  const { data: classes } = useQuery({
    queryKey: ['studentTranscriptClasses'],
    queryFn: () => studentGradesService.getAvailableClasses(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const { data, isLoading } = useQuery({
    queryKey: ['studentTranscript', filters],
    queryFn: () => studentGradesService.getTranscript(filters),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  // Overview tổng (tất cả môn, tất cả lớp) dùng cho trạng thái chưa filter
  const { data: overview } = useQuery({
    queryKey: ['studentTranscriptOverviewAll'],
    queryFn: () => studentGradesService.getOverview(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const entries = data?.entries || []

  const clearFilters = () => {
    setClassId(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bảng điểm & Kết quả học tập
          </h1>
          <p className="text-sm text-gray-600">
            Theo dõi tiến độ học tập và điểm số.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Overview tổng (chỉ hiển thị khi chưa chọn lớp) */}
      {!classId && overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border rounded">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Điểm TB tổng</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overview.cumulativeGpa?.toFixed
                  ? overview.cumulativeGpa.toFixed(2)
                  : (overview.cumulativeGpa ?? 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border rounded">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Bộ lọc dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Lớp học
              </label>
              <Select 
                value={classId} 
                onValueChange={(v) => setClassId(v)}
              >
                <SelectTrigger className="border-gray-300 hover:border-gray-400">
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  {(classes || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(!classId) ? (
        <Card className="border rounded">
          <CardContent className="p-6 text-center text-sm text-gray-700">
            Vui lòng chọn lớp học để xem bảng điểm.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border rounded">
          <CardContent className="p-6 text-center text-sm text-gray-700">
            Đang tải bảng điểm...
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="border rounded">
          <CardContent className="p-6 text-center text-sm text-gray-700">
            Chưa có dữ liệu bảng điểm cho bộ lọc đã chọn.
          </CardContent>
        </Card>
      ) : (
        entries.map((entry: TranscriptEntry, idx: number) => (
          <Card key={idx} className="border rounded">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Năm học: {entry.academicYear}
                {entry.term && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    (Học kỳ: {entry.term})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Summary Table */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3">
                  Tổng kết môn học
                </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Môn học</TableHead>
                    <TableHead className="text-right">Điểm TB</TableHead>
                    <TableHead className="text-right">Kết quả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.subjects.map((subj) => (
                      <TableRow key={subj.subjectId} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{subj.subjectName}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {subj.average.toFixed(2)}
                        </TableCell>
                      <TableCell className="text-right">
                        {subj.status === 'pass' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 w-fit ml-auto text-xs">
                            Đạt
                          </Badge>
                        ) : subj.status === 'fail' ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200 w-fit ml-auto text-xs">
                            Chưa đạt
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit ml-auto text-xs">
                            Đang học
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Detailed Assessments */}
              {entry.subjects.map((subj) => (
                <div key={subj.subjectId} className="mb-6">
                  <h4 className="text-md font-semibold mb-3">
                    {subj.subjectName} - Chi tiết bài kiểm tra
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên bài</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Ngày kiểm tra</TableHead>
                        <TableHead className="text-right">Điểm</TableHead>
                        <TableHead>Nhận xét</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subj.assessments || []).map((ass, idx) => (
                        <TableRow key={idx} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{ass.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {ass.type || 'Không xác định'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ass.date ? new Date(ass.date).toLocaleDateString('vi-VN') : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            <span className={ass.score >= 5 ? 'text-green-600' : 'text-red-600'}>
                              {ass.score}
                              {ass.maxScore ? `/${ass.maxScore}` : ''}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ass.comment || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!subj.assessments || subj.assessments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Chưa có bài kiểm tra
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}

              {/* Term Summary */}
              <div className="mt-6 p-4 border rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tổng kết học kỳ</span>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Tổng môn: <span className="font-semibold">{entry.termResult.totalSubjects}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Đạt: <span className="font-semibold text-green-600">{entry.termResult.passedSubjects}</span> • 
                      Chưa đạt: <span className="font-semibold text-red-600">{entry.termResult.failedSubjects}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}



