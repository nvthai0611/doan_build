import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Plus, MoreHorizontal, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusBadge } from '../const/statusBadge';

interface LessonsInfoProps {
  classId: string;
  classData?: any;
}

export const LessonsInfo = ({ classId, classData }: LessonsInfoProps) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming' | 'cancelled'>('all');
  
  // Sử dụng data thật từ props hoặc mock data
  const sessions = classData?.sessions || [
    {
      id: '1',
      scheduledDate: '2024-01-15',
      startTime: '19:45',
      endTime: '21:15',
      status: 'completed',
      attendanceCount: 15,
      totalStudents: 15,
      topic: 'Bài 1: Giới thiệu về lập trình',
      notes: 'Buổi học đầu tiên, học viên rất hào hứng'
    },
    {
      id: '2',
      scheduledDate: '2024-01-17',
      startTime: '19:45',
      endTime: '21:15',
      status: 'completed',
      attendanceCount: 14,
      totalStudents: 15,
      topic: 'Bài 2: Cú pháp cơ bản',
      notes: 'Có 1 học viên vắng mặt'
    },
    {
      id: '3',
      scheduledDate: '2024-01-19',
      startTime: '19:45',
      endTime: '21:15',
      status: 'upcoming',
      attendanceCount: 0,
      totalStudents: 15,
      topic: 'Bài 3: Biến và kiểu dữ liệu',
      notes: ''
    },
    {
      id: '4',
      scheduledDate: '2024-01-21',
      startTime: '19:45',
      endTime: '21:15',
      status: 'cancelled',
      attendanceCount: 0,
      totalStudents: 15,
      topic: 'Bài 4: Câu lệnh điều kiện',
      notes: 'Hủy do nghỉ lễ'
    }
  ];

  const filteredSessions = sessions.filter((session: any) => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string; icon: any }> = {
      completed: { 
        variant: 'default', 
        label: 'Đã hoàn thành', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      upcoming: { 
        variant: 'secondary', 
        label: 'Sắp tới',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock
      },
      cancelled: { 
        variant: 'destructive', 
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      },
      in_progress: { 
        variant: 'outline', 
        label: 'Đang diễn ra',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle
      }
    };
    const config = variants[status] || variants.upcoming;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAttendanceRate = (attendanceCount: number, totalStudents: number) => {
    if (totalStudents === 0) return 0;
    return Math.round((attendanceCount / totalStudents) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Buổi học ({filteredSessions.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'upcoming', label: 'Sắp tới' },
                  { key: 'completed', label: 'Đã hoàn thành' },
                  { key: 'cancelled', label: 'Đã hủy' }
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
                Thêm buổi học
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead>Điểm danh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {format(new Date(session.scheduledDate), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.startTime} - {session.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{session.topic}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {session.attendanceCount}/{session.totalStudents}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({getAttendanceRate(session.attendanceCount, session.totalStudents)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(session.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {session.notes || '-'}
                    </div>
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
                        <DropdownMenuItem>Điểm danh</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Hủy buổi học</DropdownMenuItem>
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
      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'Chưa có buổi học nào' : `Không có buổi học ${filter === 'upcoming' ? 'sắp tới' : filter === 'completed' ? 'đã hoàn thành' : 'đã hủy'}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'Hãy tạo lịch học cho lớp này' : 'Thử thay đổi bộ lọc để xem các buổi học khác'}
            </p>
            {filter === 'all' && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo buổi học đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};