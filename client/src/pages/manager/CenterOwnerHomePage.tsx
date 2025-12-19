import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../assets/shadcn-ui/components/ui/badge';
import {
  Bell,
  Clock,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Calendar,
  MapPin,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  alertService,
  Alert,
} from '../../services/center-owner/alerts/alert.service';
import { centerOwnerScheduleService } from '../../services/center-owner/center-schedule/schedule.service';
import { classService } from '../../services/center-owner/class-management/class.service';
import { useToast } from '../../hooks/use-toast';

interface TeacherInSession {
  id: string;
  teacher: {
    id: string;
    fullName: string;
    teacherCode?: string;
  };
  session: {
    id: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    sessionNumber?: string;
  };
  class: {
    id: string;
    name: string;
    classCode?: string;
    subject?: string;
    room?: {
      name?: string;
    };
  };
  enrollmentCount?: number;
  attendanceStatus?: string;
}

export const CenterOwnerHomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Get all alerts for stats calculation
  const { data: allAlertsData } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => alertService.getAlerts({ limit: 1000 }),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const allAlerts = allAlertsData?.data || [];
  const unreadAlerts = allAlerts.filter((a: any) => !a.isRead);
  const unreadCount = unreadAlerts.length;
  const displayedAlerts = unreadAlerts;

  const {
    data: teacherSessionsData,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useQuery({
    queryKey: ['center-owner', 'sessions', 'today', todayDate],
    queryFn: () =>
      centerOwnerScheduleService.getTeachersInSessionsToday({
        startDate: todayDate,
        endDate: todayDate,
        page: 1,
        limit: 20,
      }),
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });

  const teacherSessions: TeacherInSession[] = teacherSessionsData?.data || [];

  // Get classes with students without contract
  const {
    data: classesWithoutContractData,
    isLoading: isClassesLoading,
  } = useQuery({
    queryKey: ['classes-without-contract'],
    queryFn: () => classService.getClassesWithoutContract(100),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  console.log(classesWithoutContractData);
  
  const classesWithoutContract: any[] = Array.isArray(classesWithoutContractData?.data) 
    ? classesWithoutContractData.data 
    : [];

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => alertService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => alertService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
      toast({
        title: 'Thành công',
        description: 'Đã đánh dấu tất cả thông báo là đã đọc',
      });
    },
  });

  // Helper: Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Helper: Get alert icon and color based on severity
  const getAlertStyle = (severity: string, alertType: string) => {
    const styles: any = {
      error: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        badgeVariant: 'destructive' as const,
      },
      warning: {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        badgeVariant: 'secondary' as const,
      },
      info: {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        badgeVariant: 'default' as const,
      },
      success: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        badgeVariant: 'default' as const,
      },
    };

    return styles[severity] || styles.info;
  };

  // Handle click on alert
  const handleAlertClick = async (alert: Alert) => {
    console.log('=== Alert Clicked (Dashboard) ===');
    console.log('Alert Type:', alert.alertType);
    console.log('Alert Payload:', alert.payload);
    console.log('Class ID:', alert.payload?.classId);

    if (!alert.isRead) {
      await markAsReadMutation.mutateAsync(alert.id);
    }

    // Navigate based on alert type
    if (alert.alertType === 'student_class_request') {
      // Navigate đến trang chi tiết lớp và mở ShareClassSheet
      if (alert.payload?.classId) {
        const url = `/center-qn/classes/${alert.payload.classId}?openShare=true`;
        console.log('Navigating to:', url);
        navigate(url);
      } else {
        console.warn(
          '⚠️ No classId found in payload. Cannot navigate to class detail.',
        );
      }
    } else if (alert.alertType.includes('class')) {
      navigate('/center-qn/classes');
    } else if (alert.alertType.includes('permission')) {
      navigate('/center-qn/permissions');
    } else if (alert.alertType.includes('payment')) {
      navigate('/center-qn/payments');
    } else {
      navigate('/center-qn/alerts');
    }
  };

  const getSessionStatusLabel = (status?: string): string => {
    const statusLabels: Record<string, string> = {
      has_not_happened: 'Chưa diễn ra',
      happening: 'Đang diễn ra',
      end: 'Đã hoàn thành',
      cancelled: 'Đã hủy',
      day_off: 'Nghỉ',
      default: 'Chưa rõ',
    };
    return statusLabels[status || 'default'] || statusLabels.default;
  };

  const formatSessionTime = (session?: { startTime?: string; endTime?: string }) => {
    if (!session) return '--:--';
    const start = session.startTime?.slice(0, 5) || '--:--';
    const end = session.endTime?.slice(0, 5) || '--:--';
    return `${start} - ${end}`;
  };



  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Trung tâm cập nhật thông báo tự động mỗi 5 giây
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600">
              Tổng: {allAlerts.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600">
              Chưa đọc: {unreadCount}
            </span>
          </div>
        </div>

        {/* Alerts and Classes without contract - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bảng thông báo */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div> 
                  <h3 className="font-semibold flex items-center gap-2">
                    Bảng thông báo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Chỉ hiển thị thông báo chưa đọc
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                    >
                      Đánh dấu tất cả đã đọc
                    </Button>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => navigate('/center-qn/alerts')}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>

              {displayedAlerts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    Không có thông báo chưa đọc
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-3 max-h-[520px] overflow-y-auto">
                  {displayedAlerts.map((alert: Alert) => {
                    const style = getAlertStyle(alert.severity, alert.alertType);
                    const Icon = style.icon;
                    const isUnread = !alert.isRead;

                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                          isUnread ? 'bg-gray-50 dark:bg-gray-900/40' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${style.bgColor}`}>
                          <Icon className={`w-4 h-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {alert.title}
                            </h4>
                            <Badge
                              variant={style.badgeVariant}
                              className="text-xs shrink-0 capitalize"
                            >
                              {alert.alertType.replace(/_/g, ' ')}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(alert.triggeredAt)}</span>
                            {isUnread && <span className="ml-1 font-bold">•</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classes with students without contract */}
          {classesWithoutContract.length > 0 ? (
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      Lớp có học sinh chưa có cam kết
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cần xử lý ngay để đảm bảo chất lượng
                    </p>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => navigate('/center-qn/classes')}
                  >
                    Xem tất cả
                  </Button>
                </div>

                {isClassesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-20 rounded-lg bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {classesWithoutContract.map((classItem: any) => (
                      <div
                        key={classItem.id}
                        onClick={() =>
                          navigate(`/center-qn/classes/${classItem.id}#students`)
                        }
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {classItem.name}
                            </h4>
                            {classItem.classCode && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {classItem.classCode}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {classItem.subject && (
                              <span>{classItem.subject}</span>
                            )}
                            <span>•</span>
                            <span>
                              {classItem.totalStudents} học sinh
                            </span>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">
                              {classItem.studentsWithoutContract} chưa có cam kết
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div></div>
          )}
        </div>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Lịch dạy hôm nay
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(todayDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate('/center-qn/lich-day-hom-nay')}
              >
                Xem tất cả
              </Button>
            </div>

            {isSessionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : isSessionsError ? (
              <div className="border rounded-lg p-4 text-sm text-red-600 bg-red-50">
                Không thể tải danh sách buổi học hôm nay. Vui lòng thử lại sau.
              </div>
            ) : teacherSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Hôm nay chưa có buổi học nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teacherSessions.slice(0, 6).map((item) => {
                  const statusLabel = getSessionStatusLabel(item.session.status);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-1 py-1 rounded-xl hover:bg-muted/50 transition-colors hover:pointer"
                      onClick={() => navigate('/center-qn/lich-day-hom-nay')}
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                        <span className="font-medium text-foreground">
                          {item.session.startTime?.slice(0, 5) || '--:--'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div
                          className="rounded-2xl px-4 py-3 border bg-card"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {item.class?.name || 'Chưa cập nhật'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.class?.subject || 'Môn học chưa rõ'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Giáo viên: {item.teacher.fullName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {item.session.sessionNumber && (
                                <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium text-foreground">
                                  Buổi {item.session.sessionNumber}
                                </span>
                              )}
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              <span>{item.enrollmentCount ?? '--'} HV</span>
                            </div>
                            {item.class?.room?.name && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />
                                <span>{item.class.room.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>{formatSessionTime(item.session)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {teacherSessions.length > 6 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Và {teacherSessions.length - 6} buổi khác...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};