import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClipboardList, Plus, MoreHorizontal, Users, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AssignmentStatus, ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS } from '../../../../lib/constants';

interface AssignmentsInfoProps {
  classId: string;
  classData?: any;
}

export const AssignmentsInfo = ({ classId, classData }: AssignmentsInfoProps) => {
  const [filter, setFilter] = useState<AssignmentStatus>(AssignmentStatus.ALL);
  
  // Sử dụng data thật từ props hoặc mock data
  const assignments = classData?.assessments || [
    {
      id: '1',
      title: 'Bài tập về nhà - Tuần 1',
      description: 'Làm bài tập về cú pháp cơ bản trong Python',
      dueDate: '2024-01-20',
      status: 'active',
      gradeCount: 12,
      totalStudents: 15,
      maxScore: 100,
      createdAt: '2024-01-15',
      type: 'homework'
    },
    {
      id: '2',
      title: 'Kiểm tra giữa kỳ',
      description: 'Kiểm tra kiến thức từ bài 1-5',
      dueDate: '2024-02-15',
      status: 'upcoming',
      gradeCount: 0,
      totalStudents: 15,
      maxScore: 100,
      createdAt: '2024-01-20',
      type: 'exam'
    },
    {
      id: '3',
      title: 'Dự án cuối khóa',
      description: 'Tạo một ứng dụng web đơn giản',
      dueDate: '2024-03-30',
      status: 'upcoming',
      gradeCount: 0,
      totalStudents: 15,
      maxScore: 200,
      createdAt: '2024-02-01',
      type: 'project'
    },
    {
      id: '4',
      title: 'Bài tập về nhà - Tuần 2',
      description: 'Làm bài tập về biến và kiểu dữ liệu',
      dueDate: '2024-01-25',
      status: 'completed',
      gradeCount: 15,
      totalStudents: 15,
      maxScore: 100,
      createdAt: '2024-01-18',
      type: 'homework'
    }
  ];

  const filteredAssignments = assignments.filter((assignment: any) => {
    if (filter === AssignmentStatus.ALL) return true;
    if (filter === AssignmentStatus.ACTIVE) return assignment.status === AssignmentStatus.ACTIVE;
    if (filter === AssignmentStatus.COMPLETED) return assignment.status === AssignmentStatus.COMPLETED;
    if (filter === AssignmentStatus.OVERDUE) {
      return assignment.status === AssignmentStatus.ACTIVE && new Date(assignment.dueDate) < new Date();
    }
    return true;
  });

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === AssignmentStatus.ACTIVE && new Date(dueDate) < new Date();
    
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      [AssignmentStatus.ACTIVE]: { 
        variant: isOverdue ? 'destructive' : 'default', 
        label: isOverdue ? ASSIGNMENT_STATUS_LABELS[AssignmentStatus.OVERDUE] : ASSIGNMENT_STATUS_LABELS[AssignmentStatus.ACTIVE],
        className: isOverdue ? ASSIGNMENT_STATUS_COLORS[AssignmentStatus.OVERDUE] : ASSIGNMENT_STATUS_COLORS[AssignmentStatus.ACTIVE]
      },
      [AssignmentStatus.UPCOMING]: { 
        variant: 'secondary', 
        label: ASSIGNMENT_STATUS_LABELS[AssignmentStatus.UPCOMING],
        className: ASSIGNMENT_STATUS_COLORS[AssignmentStatus.UPCOMING]
      },
      [AssignmentStatus.COMPLETED]: { 
        variant: 'outline', 
        label: ASSIGNMENT_STATUS_LABELS[AssignmentStatus.COMPLETED],
        className: ASSIGNMENT_STATUS_COLORS[AssignmentStatus.COMPLETED]
      }
    };
    const config = variants[status] || variants[AssignmentStatus.ACTIVE];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      homework: { variant: 'secondary', label: 'Bài tập' },
      exam: { variant: 'destructive', label: 'Kiểm tra' },
      project: { variant: 'outline', label: 'Dự án' },
      quiz: { variant: 'default', label: 'Quiz' }
    };
    const config = variants[type] || variants.homework;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubmissionRate = (gradeCount: number, totalStudents: number) => {
    if (totalStudents === 0) return 0;
    return Math.round((gradeCount / totalStudents) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Bài tập & Kiểm tra ({filteredAssignments.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'active', label: 'Đang mở' },
                  { key: 'completed', label: 'Đã hoàn thành' },
                  { key: 'overdue', label: 'Quá hạn' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.key}
                    variant={filter === filterOption.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterOption.key as any)}
                    className="text-xs"
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo bài tập
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bài tập</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead>Nộp bài</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment: any) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {assignment.description}
                      </div>
                      <div className="text-xs text-gray-400">
                        Tạo: {format(new Date(assignment.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(assignment.type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">
                        {format(new Date(assignment.dueDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {assignment.gradeCount}/{assignment.totalStudents}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({getSubmissionRate(assignment.gradeCount, assignment.totalStudents)}%)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Tối đa: {assignment.maxScore} điểm
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(assignment.status, assignment.dueDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Chấm điểm</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Xem bài nộp</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'Chưa có bài tập nào' : `Không có bài tập ${filter === 'active' ? 'đang mở' : filter === 'completed' ? 'đã hoàn thành' : 'quá hạn'}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'Hãy tạo bài tập cho lớp học này' : 'Thử thay đổi bộ lọc để xem các bài tập khác'}
            </p>
            {filter === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo bài tập đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};