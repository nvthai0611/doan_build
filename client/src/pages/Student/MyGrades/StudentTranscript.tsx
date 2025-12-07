import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {  type TranscriptEntry, type TranscriptFilters } from '../../../services/student/grades/grades.types'
import { studentGradesService } from '../../../services/student/grades/grades.service'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  BarChart3,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function StudentTranscriptPage() {
  // Lọc theo Lớp (bắt buộc) + Loại kiểm tra (tuỳ chọn)
  const [classId, setClassId] = useState<string | undefined>(undefined)
  const [testType, setTestType] = useState<string | undefined>(undefined)
  
  const filters: TranscriptFilters = useMemo(() => ({ classId, testType }), [classId, testType])

  const { data: classes } = useQuery({
    queryKey: ['studentTranscriptClasses'],
    queryFn: () => studentGradesService.getAvailableClasses(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const { data: testTypes } = useQuery({
    queryKey: ['studentTranscriptTestTypes', classId],
    queryFn: () => studentGradesService.getTestTypes(classId),
    enabled: !!classId,
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

  const { data: overview } = useQuery({
    queryKey: ['studentTranscriptOverview'],
    queryFn: () => studentGradesService.getOverview(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const entries = data?.entries || []

  const clearFilters = () => {
    setClassId(undefined)
    setTestType(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-700 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              Bảng điểm & Kết quả học tập
            </h1>
            <p className="text-sm text-muted-foreground">Theo dõi tiến độ học tập và điểm số</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-blue-200 hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Điểm TB tổng</p>
                  <p className="text-2xl font-bold text-blue-800">{overview.cumulativeGpa?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng môn học</p>
                  <p className="text-2xl font-bold text-blue-800">{overview.totalSubjects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng bài kiểm tra</p>
                  <p className="text-2xl font-bold text-blue-800">{overview.totalAssessments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tỷ lệ đạt</p>
                  <p className="text-2xl font-bold text-blue-800">{overview.passRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-700" />
            Bộ lọc dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-700" />
                Lớp học
              </label>
              <Select 
                value={classId} 
                onValueChange={(v) => { 
                  setClassId(v); 
                  setTestType(undefined);
                }}
              >
                <SelectTrigger className="border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>
                <SelectContent>
                  {(classes || []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.academicYear ? ` • ${c.academicYear}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-700" />
                Loại kiểm tra
              </label>
              <Select 
                value={testType} 
                onValueChange={setTestType}
                disabled={!classId}
              >
                <SelectTrigger className="border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Chọn loại kiểm tra" />
                </SelectTrigger>
                <SelectContent>
                  {(testTypes || []).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(!classId) ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Filter className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Chọn lớp để xem bảng điểm</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vui lòng chọn Lớp học để xem dữ liệu điểm số
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Đang tải bảng điểm...</p>
            </div>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Chưa có dữ liệu bảng điểm</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Không tìm thấy dữ liệu điểm số cho bộ lọc đã chọn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        entries.map((entry: TranscriptEntry, idx: number) => (
          <Card key={idx} className="border-0 shadow-lg">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    Năm học: {entry.academicYear}
                  </div>
                  {entry.term && (
                    <div className="text-sm text-muted-foreground">
                      Học kỳ: {entry.term}
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Summary Table */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-700" />
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
                            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit ml-auto">
                              <CheckCircle2 className="h-3 w-3" />
                              Đạt
                            </Badge>
                        ) : subj.status === 'fail' ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 w-fit ml-auto">
                              <XCircle className="h-3 w-3" />
                              Chưa đạt
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit ml-auto">
                              <AlertCircle className="h-3 w-3" />
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
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-blue-700" />
                    <h4 className="text-md font-semibold">{subj.subjectName} - Chi tiết bài kiểm tra</h4>
                  </div>
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
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="h-6 w-6" />
                              Chưa có bài kiểm tra
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}

              {/* Term Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-700" />
                    <span className="text-sm font-medium">Tổng kết học kỳ</span>
                  </div>
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



