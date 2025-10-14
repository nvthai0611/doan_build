import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, BookOpen, MapPin, Edit, Calendar as CalendarIcon } from 'lucide-react';
import { formatSchedule } from '../../../../utils/format';
import { getStatusBadge } from '../const/statusBadge';

interface GeneralInfoProps {
  classData: any;
}

export const GeneralInfo = ({ classData }: GeneralInfoProps) => {


  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Thông tin lớp học
            </CardTitle>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin chính */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên lớp</label>
                <p className="text-lg font-semibold">{classData.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Môn học</label>
                <p className="text-base">{classData.subjectName || 'Chưa xác định'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Khối lớp</label>
                <p className="text-base">{classData.grade ? `Khối ${classData.grade}` : 'Chưa xác định'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Năm học</label>
                <p className="text-base">{classData.academicYear || 'Chưa xác định'}</p>
              </div>
            </div>

            {/* Thông tin phụ */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(classData.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phòng học</label>
                <p className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {classData.roomName || 'Chưa phân công'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Sĩ số</label>
                <p className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {classData.currentStudents || 0}/{classData?.room?.capacity || '∞'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Ngày khai giảng dự kiến</label>
                <p className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {classData.expectedStartDate ? new Date(classData.expectedStartDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {classData.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Mô tả</label>
              <p className="text-base mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {classData.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lịch học */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lịch học
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classData.recurringSchedule ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {formatSchedule(classData.recurringSchedule)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Chưa có lịch học</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Học viên</p>
                <p className="text-2xl font-bold">{classData.currentStudents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Buổi học</p>
                <p className="text-2xl font-bold">{classData.totalSessions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bài kiểm tra</p>
                <p className="text-2xl font-bold">{classData.totalAssessments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tài liệu</p>
                <p className="text-2xl font-bold">{classData.totalMaterials || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};