import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../../assets/shadcn-ui/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { alertService, Alert } from '../../../services/center-owner/alerts/alert.service';
import { useToast } from '../../../hooks/use-toast';

export const AlertsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');

  // Get all alerts
  const { data: allAlertsData, isLoading } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => alertService.getAlerts({ limit: 1000 }),
    refetchInterval: 30000,
  });

  const allAlerts = allAlertsData?.data || [];
  const unreadAlerts = allAlerts.filter((a: Alert) => !a.isRead);
  const unreadCount = unreadAlerts.length;

  // Mutation to mark as read
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
    if (diffDays < 7) return `${diffDays} ngày`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần`;
    return date.toLocaleDateString('vi-VN');
  };

  // Helper: Get alert icon and color
  const getAlertStyle = (severity: string) => {
    const styles: any = {
      error: { 
        icon: XCircle, 
        color: 'text-red-500', 
        bgColor: 'bg-red-50', 
        badgeVariant: 'destructive' as const
      },
      warning: { 
        icon: AlertTriangle, 
        color: 'text-orange-500', 
        bgColor: 'bg-orange-50', 
        badgeVariant: 'secondary' as const
      },
      info: { 
        icon: Info, 
        color: 'text-blue-500', 
        bgColor: 'bg-blue-50', 
        badgeVariant: 'default' as const
      },
      success: { 
        icon: CheckCircle, 
        color: 'text-green-500', 
        bgColor: 'bg-green-50', 
        badgeVariant: 'default' as const
      },
    };
    
    return styles[severity] || styles.info;
  };

  // Get badge label for alert type
  const getAlertTypeBadge = (alertType: string) => {
    const types: any = {
      'student_class_request': 'Lớp học',
      'leave_request': 'Nghỉ phép',
      'session_request': 'Buổi học',
      'incident_report': 'Sự cố',
      'enrollment': 'Ghi danh',
      'payment': 'Thanh toán',
      'parent_registration': 'Đăng ký',
      'other': 'Khác',
    };
    return types[alertType] || alertType;
  };

  // Handle click on alert
  const handleAlertClick = async (alert: Alert) => {
    console.log('=== Alert Clicked ===');
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
        console.warn('⚠️ No classId found in payload. Cannot navigate to class detail.');
      }
    } else if (alert.alertType.includes('class')) {
      navigate('/center-qn/classes');
    } else if (alert.alertType.includes('permission')) {
      navigate('/center-qn/permissions');
    } else if (alert.alertType.includes('payment')) {
      navigate('/center-qn/payments');
    }
  };

  // Get display name from alert
  const getDisplayName = (alert: Alert) => {
    // Try to get from payload first
    if (alert.payload?.studentName) return alert.payload.studentName;
    if (alert.payload?.parentName) return alert.payload.parentName;
    if (alert.payload?.userName) return alert.payload.userName;
    
    // Fallback to title parsing or system
    return 'Hệ thống';
  };

  const displayAlerts = activeTab === 'all' ? allAlerts : unreadAlerts;

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Thông báo</h1>
            <p className="text-muted-foreground">
              Quản lý tất cả thông báo của bạn
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="unread">
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : displayAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayAlerts.map((alert: Alert) => {
                  const style = getAlertStyle(alert.severity);
                  const Icon = style.icon;
                  const isUnread = !alert.isRead;
                  const displayName = getDisplayName(alert);
                  
                  return (
                    <Card
                      key={alert.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        isUnread ? 'bg-gray-50 dark:bg-gray-900' : ''
                      }`}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar/Icon */}
                          <div className={`p-3 rounded-full ${style.bgColor} flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${style.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <span className="font-medium">{displayName}</span>
                                <span className="text-muted-foreground"> {alert.title}</span>
                              </div>
                              <Badge variant={style.badgeVariant} className="text-xs shrink-0">
                                {getAlertTypeBadge(alert.alertType)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(alert.triggeredAt)}</span>
                              {isUnread && <span className="ml-1 font-bold">•</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">Không có thông báo chưa đọc</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayAlerts.map((alert: Alert) => {
                const style = getAlertStyle(alert.severity);
                const Icon = style.icon;
                const displayName = getDisplayName(alert);
                
                return (
                  <Card
                    key={alert.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar/Icon */}
                        <div className={`p-3 rounded-full ${style.bgColor} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${style.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <span className="font-medium">{displayName}</span>
                              <span className="text-muted-foreground"> {alert.title}</span>
                            </div>
                            <Badge variant={style.badgeVariant} className="text-xs shrink-0">
                              {getAlertTypeBadge(alert.alertType)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(alert.triggeredAt)}</span>
                            <span className="ml-1 font-bold">•</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default AlertsPage;

