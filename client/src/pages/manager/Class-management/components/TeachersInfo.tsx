import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GraduationCap, Plus, MoreHorizontal, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TeachersInfoProps {
  classId: string;
  classData?: any;
}

export const TeachersInfo = ({ classId, classData }: TeachersInfoProps) => {
  // Sử dụng data thật từ props hoặc mock data
  const teachers = classData?.teachers || [
    {
      teacherId: '1',
      assignmentId: '1',
      id: '1',
      fullName: 'Nguyễn Thị Lan',
      email: 'lan.nguyen@email.com',
      phone: '0123456789',
      avatar: 'https://picsum.photos/200/300',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      semester: '1',
      academicYear: '2024-2025',
      recurringSchedule: {
        schedules: [
          { day: 'tuesday', startTime: '19:45', endTime: '21:15' },
          { day: 'thursday', startTime: '19:45', endTime: '21:15' }
        ]
      }
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatScheduleDisplay = (recurringSchedule: any) => {
    if (!recurringSchedule || !recurringSchedule.schedules) return 'Chưa có lịch';
    
    return recurringSchedule.schedules.map((schedule: any) => {
      const dayNames: { [key: string]: string } = {
        'monday': 'Thứ 2',
        'tuesday': 'Thứ 3', 
        'wednesday': 'Thứ 4',
        'thursday': 'Thứ 5',
        'friday': 'Thứ 6',
        'saturday': 'Thứ 7',
        'sunday': 'CN'
      };
      const dayName = dayNames[schedule.day] || schedule.day;
      return `${dayName}: ${schedule.startTime}-${schedule.endTime}`;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Giáo viên phụ trách ({teachers.length})
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm giáo viên
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Teachers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher: any ) => (
          <Card key={teacher.assignmentId}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.avatar} alt={teacher.fullName} />
                    <AvatarFallback>{getInitials(teacher.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{teacher.fullName}</h3>
                    <Badge variant="outline" className="text-xs">
                      Giáo viên chính
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem>Xem lịch dạy</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Gỡ khỏi lớp</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span>
                    {format(new Date(teacher.startDate), 'dd/MM/yyyy')} - {format(new Date(teacher.endDate), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Học kỳ {teacher.semester} - {teacher.academicYear}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>Lịch dạy</span>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {formatScheduleDisplay(teacher.recurringSchedule)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {teachers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chưa có giáo viên nào
            </h3>
            <p className="text-gray-500 mb-4">
              Hãy phân công giáo viên cho lớp học này
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm giáo viên đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};