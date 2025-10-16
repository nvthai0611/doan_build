import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {  type TranscriptEntry, type TranscriptFilters } from '../../../services/student/grades/grades.types'
import { studentGradesService } from '../../../services/student/grades/grades.service'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function StudentTranscriptPage() {
  // Thứ tự filter: Năm học -> Kỳ học -> Môn học -> Loại kiểm tra
  const [academicYear, setAcademicYear] = useState<string | undefined>(undefined)
  const [term, setTerm] = useState<string | undefined>(undefined)
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined)
  

  const filters: TranscriptFilters = useMemo(() => ({ academicYear, term, subjectId }), [academicYear, term, subjectId])

  const { data: years } = useQuery({
    queryKey: ['studentTranscriptYears'],
    queryFn: () => studentGradesService.getAvailableYears(),
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const { data: terms } = useQuery({
    queryKey: ['studentTranscriptTerms', academicYear],
    queryFn: () => studentGradesService.getAvailableTerms(academicYear),
    enabled: !!academicYear,
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  const { data: subjects } = useQuery({
    queryKey: ['studentTranscriptSubjects', academicYear, term],
    queryFn: () => studentGradesService.getSubjects(academicYear, term),
    enabled: !!academicYear && !!term,
    staleTime: 300000,
    refetchOnWindowFocus: false
  })

  

  const { data, isLoading } = useQuery({
    queryKey: ['studentTranscript', filters],
    queryFn: () => studentGradesService.getTranscript(filters),
    enabled: !!academicYear && !!term && !!subjectId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  const entries = data?.entries || []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bảng điểm & Kết quả cá nhân</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Năm học</label>
              <Select value={academicYear} onValueChange={(v) => { setAcademicYear(v); setTerm(undefined); setSubjectId(undefined); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm học" />
                </SelectTrigger>
                <SelectContent>
                  {(years || []).map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Học kỳ</label>
              <Select value={term} onValueChange={(v) => { setTerm(v); setSubjectId(undefined); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {(terms || []).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Môn học</label>
              <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {(subjects || []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {(!academicYear || !term || !subjectId) ? (
        <div className="text-sm text-muted-foreground">Chọn Năm học → Học kỳ → Môn học để xem điểm.</div>
      ) : isLoading ? (
        <div className="text-sm text-muted-foreground">Đang tải bảng điểm...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-muted-foreground">Chưa có dữ liệu bảng điểm.</div>
      ) : (
        entries.map((entry: TranscriptEntry, idx: number) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>
                Năm học: {entry.academicYear}{entry.term ? ` • Học kỳ: ${entry.term}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    <TableRow key={subj.subjectId}>
                      <TableCell className="font-medium">{subj.subjectName}</TableCell>
                      <TableCell className="text-right">{subj.average.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {subj.status === 'pass' ? (
                          <Badge className="bg-green-600">Đạt</Badge>
                        ) : subj.status === 'fail' ? (
                          <Badge className="bg-red-600">Chưa đạt</Badge>
                        ) : (
                          <Badge variant="secondary">Đang học</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Chi tiết bài kiểm tra theo từng môn */}
              {entry.subjects.map((subj) => (
                <div key={subj.subjectId} className="mt-4">
                  <div className="text-sm font-semibold mb-2">{subj.subjectName} - Bài kiểm tra</div>
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
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{ass.name}</TableCell>
                          <TableCell>{ass.type || '-'}</TableCell>
                          <TableCell>{ass.date ? new Date(ass.date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-right">{ass.score}{ass.maxScore ? `/${ass.maxScore}` : ''}</TableCell>
                          <TableCell>{ass.comment || '-'}</TableCell>
                        </TableRow>
                      ))}
                      {(!subj.assessments || subj.assessments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-sm text-muted-foreground">Chưa có bài kiểm tra</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}

              <div className="mt-4 text-sm text-muted-foreground">
                Tổng môn: {entry.termResult.totalSubjects} • Đạt: {entry.termResult.passedSubjects} • Chưa đạt: {entry.termResult.failedSubjects}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}



