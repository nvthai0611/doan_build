import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface StudentsInfoProps {
  classId: string;
  classData?: any;
}

export const StudentsInfo = ({ classId, classData }: StudentsInfoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sử dụng data thật từ props hoặc mock data
  const students = classData?.students || [
    {
      enrollmentId: '1',
      studentId: '1',
      id: '1',
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      phone: '0123456789',
      avatar: 'https://picsum.photos/200/300',
      enrolledAt: '2024-01-15',
      status: 'active'
    },
    {
      enrollmentId: '2',
      studentId: '2',
      id: '2',
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      phone: '0987654321',
      avatar: 'https://picsum.photos/200/300',
      enrolledAt: '2024-01-20',
      status: 'active'
    },
    {
      enrollmentId: '3',
      studentId: '3',
      id: '3',
      fullName: 'Lê Văn Cường',
      email: 'cuong.le@email.com',
      phone: '0369852147',
      avatar: 'https://picsum.photos/200/300',
      enrolledAt: '2024-02-01',
      status: 'paused'
    }
  ];

  const filteredStudents = students.filter((student: any) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      active: { variant: 'default', label: 'Đang học', className: 'bg-green-100 text-green-800 border-green-200' },
      paused: { variant: 'secondary', label: 'Tạm nghỉ' },
      completed: { variant: 'outline', label: 'Hoàn thành' },
      dropped: { variant: 'destructive', label: 'Bỏ học' }
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Danh sách học viên ({filteredStudents.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm học viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm học viên
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ngày ghi danh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student: any) => (
                <TableRow key={student.enrollmentId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.fullName} />
                        <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{student.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{format(new Date(student.enrolledAt), 'dd/MM/yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(student.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Điểm danh</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Xóa khỏi lớp</DropdownMenuItem>
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
      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy thêm học viên vào lớp học này'}
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm học viên đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};