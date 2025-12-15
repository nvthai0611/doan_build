'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassSessions } from '../../Teacher-management/types/session';
import { classService } from '@/services/center-owner/class-management/class.service';
import { useState } from 'react';
import { centerOwnerTeacherService } from '../../../../services/center-owner/teacher-management/teacher.service';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

interface SessionDetailModalProps {
  session: ClassSessions | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
}: SessionDetailModalProps) {
  if (!session) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'has_not_happened':
        return 'Chưa diễn ra';
      case 'happening':
        return 'Đang diễn ra';
      case 'end':
        return 'Đã kết thúc';
      case 'cancelled':
        return 'Đã hủy';
      case 'day_off':
        return 'Nghỉ';
      default:
        return 'Không xác định';
    }
  };

  const getStatusVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'has_not_happened':
        return 'default';
      case 'happening':
        return 'secondary';
      case 'end':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      case 'day_off':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '--';
    return time.slice(0, 5); // Remove seconds
  };

  const [studentList, setStudentList] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<any | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  const loadStudents = async () => {
    setStudentError(null);
    setStudentLoading(true);
    try {
      const response = await classService.getClassById(session.classId);
      const enrollments = (response.data as any)?.enrollments || [];
      setStudentList(enrollments);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể lấy danh sách học sinh.';
      setStudentError(message);
    } finally {
      setStudentLoading(false);
    }
  };

  const loadTeacherInfo = async () => {
    setTeacherError(null);
    setTeacherLoading(true);
    try {
      const response = await centerOwnerTeacherService.getTeacherById(session.teacherId);
      // Giả định API trả về teacher hoặc teachers
      setTeacherInfo(response);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể lấy thông tin giáo viên.';
      setTeacherError(message);
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              Chi tiết {session.name || 'Chưa phân lớp'}
              {session.hasAlert && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="info"
            className="mt-4"
            onValueChange={async (value) => {
              if (
                value === 'students' &&
                !studentList.length &&
                !studentLoading
              ) {
                await loadStudents();
              }
              if (value === 'teacher' && !teacherInfo && !teacherLoading) {
                await loadTeacherInfo();
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="teacher">Giáo viên</TabsTrigger>
              <TabsTrigger value="students">Học sinh</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 pt-4">
              {/* Status and Basic Info */}
              <div className="flex items-center justify-between">
                <Badge variant={getStatusVariant(session.status)}>
                  {getStatusText(session.status)}
                </Badge>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Ngày học</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(session.date)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Thời gian</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(session.startTime)} -{' '}
                      {formatTime(session.endTime)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location and Teacher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-chart-2" />
                  <div>
                    <div className="font-medium">Phòng học</div>
                    <div className="text-sm text-muted-foreground">
                      {session.roomName || 'Chưa phân phòng'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-chart-2" />
                    <div>
                      <div className="font-medium">Giáo viên chính</div>
                      <div className="text-sm text-muted-foreground">
                        {session.teacherName || 'Chưa phân giáo viên'}
                      </div>
                    </div>
                  </div>
                  {session.substituteTeacher &&
                    session.status !== 'cancelled' &&
                    session.status !== 'day_off' && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium">Giáo viên thay thế</div>
                          <div className="text-sm text-muted-foreground">
                            {session.substituteTeacher ||
                              'Chưa phân giáo viên thay thế'}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <Separator />

              {/* Subject and Students */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-chart-4" />
                  <div>
                    <div className="font-medium">Môn học</div>
                    <div className="text-sm text-muted-foreground">
                      {session.subjectName || 'Chưa phân môn học'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-chart-4" />
                  <div>
                    <div className="font-medium">Học sinh</div>
                    <div className="text-sm text-muted-foreground">
                      {session.studentCount} học sinh
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Information */}
              {/* {session.hasAlert && (
                <>
                  <Separator />
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Cảnh báo
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      {session.studentCount < 5
                        ? 'Số lượng học sinh ít, cần xem xét việc ghép lớp hoặc hủy buổi học.'
                        : 'Buổi học cần được chú ý đặc biệt.'}
                    </div>
                  </div>
                </>
              )} */}

              {/* Additional Information */}
              <Separator />
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Thời lượng:</span>{' '}
                    {(() => {
                      const start = new Date(`2000-01-01T${session.startTime}`);
                      const end = new Date(`2000-01-01T${session.endTime}`);
                      const diff =
                        (end.getTime() - start.getTime()) / (1000 * 60);
                      return `${diff} phút`;
                    })()}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teacher" className="pt-4 h-[50vh] overflow-y-auto">
              {teacherLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải thông tin giáo viên...</span>
                </div>
              ) : teacherError ? (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
                  {teacherError}
                </div>
              ) : !teacherInfo ? (
                <div className="text-sm text-muted-foreground">
                  Chưa có thông tin giáo viên.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={teacherInfo.avatar} />
                      <AvatarFallback>
                        {teacherInfo.name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {teacherInfo.name || '---'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Email: {teacherInfo?.email || '---'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        SĐT: {teacherInfo?.phone || '---'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="students" className="pt-4 h-[50vh] overflow-y-auto">
              {studentLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải danh sách học sinh...</span>
                </div>
              ) : studentError ? (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
                  {studentError}
                </div>
              ) : studentList.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Chưa có học sinh trong lớp.
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  <p className="text-sm text-muted-foreground">
                    Danh sách học sinh ({studentList.length})
                  </p>
                  {studentList.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student?.student?.user?.avatar || ''} />
                          <AvatarFallback>
                            {student?.student?.user?.fullName
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {student?.student?.user?.fullName || '---'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Email: {student?.student?.user?.email || '---'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Phụ huynh:{' '}
                            {student?.student?.parent?.user?.fullName || '---'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            SĐT phụ huynh: {student?.student?.parent?.user?.phone || '---'}
                          </div>
                        </div>
                      </div>
                      {/* <Badge variant="secondary">
                        {student?.status || '---'}
                      </Badge> */}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
