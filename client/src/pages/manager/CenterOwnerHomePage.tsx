import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../../assets/shadcn-ui/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Bell, 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService, Alert } from '../../services/center-owner/alert.service';
import { useToast } from '../../hooks/use-toast';

export const CenterOwnerHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('due');

  // Get all alerts for stats calculation
  const { data: allAlertsData } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => alertService.getAlerts({ limit: 1000 }),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });


  // Calculate stats - All filtering done on frontend from single API
  const allAlerts = allAlertsData?.data || [];
  const totalTasks = allAlerts.length;
  const completedTasks = allAlerts.filter((a: any) => a.processed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Filter pending tasks (unprocessed alerts) - bất kể đã đọc hay chưa
  const pendingTasks = allAlerts.filter((a: any) => !a.processed);
  const pendingCount = pendingTasks.length;
  
  // Get ALL alerts for notifications section (limit to 5 for homepage display)
  const notificationAlerts = allAlerts.slice(0, 5);
  const unreadCount = allAlerts.filter((a: any) => !a.isRead).length;

  // Calculate overdue and due tasks from pending tasks
  const now = new Date();
  const overdueTasks = pendingTasks.filter((task: any) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  });
  const dueTasks = pendingTasks.filter((task: any) => {
    if (!task.dueDate) return true; // Tasks without due date are considered "due"
    return new Date(task.dueDate) >= now;
  });
  
  const overdueCount = overdueTasks.length;
  const dueCount = dueTasks.length;

  // Mutations for alerts
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => alertService.markAsRead(id),
    onSuccess: () => {
      // Refetch all alerts to update filtered data
      queryClient.invalidateQueries({ queryKey: ['all-alerts'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => alertService.markAllAsRead(),
    onSuccess: () => {
      // Refetch all alerts to update filtered data
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
        console.warn('⚠️ No classId found in payload. Cannot navigate to class detail.');
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

  // Get current time period
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Chào buổi sáng';
    if (currentHour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Get avatar based on gender
  const getAvatarUrl = () => {
    if (user?.gender === 'female') {
      return 'https://res.cloudinary.com/dgqkmqkdz/image/upload/v1761731781/character-9_hq69pe.webp';
    }
    return 'https://res.cloudinary.com/dgqkmqkdz/image/upload/v1761731781/character-9_hq69pe.webp';
  };

  // Quick stats với real data
  const stats = [
    {
      title: 'Tiến độ hoàn thành công việc',
      value: `${completionRate}%`,
      icon: Briefcase,
      color: 'text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'Số lượng công việc',
      value: pendingCount.toString(),
      icon: FileText,
      color: 'text-green-600',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Greeting Card */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 shadow-sm">
        <CardContent className="p-8">
          {/* Greeting, Avatar và Thời gian trong cùng 1 hàng */}
          <div className="flex items-center justify-between gap-4">
            {/* Avatar và Greeting */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  <span className="text-pink-600">{getGreeting()}, </span>
                  <span className="text-purple-600">{user?.fullName}</span>
                </h1>
              </div>
            </div>
            
            {/* Thời gian dropdown */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Thời gian</span>
              <select className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/20">
                <option>Tuần</option>
                <option>Tháng</option>
                <option>Quý</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgGradient} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks with Tabs */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Công việc chưa hoàn thành</h3>
              <Button
                variant="link"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate('/center-qn/tasks')}
              >
                Xem tất cả
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="due" className="flex-1">
                  Đến hạn
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
                    {dueCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="overdue" className="flex-1">
                  Quá hạn
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
                    {overdueCount}
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="due" className="mt-4">
                {dueCount === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Không có dữ liệu</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {dueTasks.slice(0, 5).map((task: Alert) => {
                      const style = getAlertStyle(task.severity, task.alertType);
                      const Icon = style.icon;
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleAlertClick(task)}
                          className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                            task.isRead ? 'opacity-70' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${style.bgColor}`}>
                            <Icon className={`w-4 h-4 ${style.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                              <Badge variant={style.badgeVariant} className="text-xs shrink-0">
                                {task.alertType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {task.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(task.triggeredAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="overdue" className="mt-4">
                {overdueCount === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Không có dữ liệu</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {overdueTasks.slice(0, 5).map((task: Alert) => {
                      const style = getAlertStyle(task.severity, task.alertType);
                      const Icon = style.icon;
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleAlertClick(task)}
                          className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                            task.isRead ? 'opacity-70' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${style.bgColor}`}>
                            <Icon className={`w-4 h-4 ${style.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm line-clamp-1">{task.title}</h4>
                              <Badge variant={style.badgeVariant} className="text-xs shrink-0">
                                {task.alertType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {task.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(task.triggeredAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notifications - Show ALL alerts */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                Thông báo chưa đọc
                <span className="ml-2 text-sm text-muted-foreground">
                  ({unreadCount})
                </span>
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
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
                  Xem tất cả
                </Button>
              </div>
            </div>
            
            {notificationAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Không có thông báo</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {notificationAlerts.map((alert: Alert) => {
                  const style = getAlertStyle(alert.severity, alert.alertType);
                  const Icon = style.icon;
                  const isUnread = !alert.isRead; // Chưa đọc = true
                  
                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleAlertClick(alert)}
                      className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                        isUnread ? 'bg-gray-100 dark:bg-gray-800' : ''
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
                            className="text-xs shrink-0"
                          >
                            {alert.alertType}
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
      </div>

      {/* Schedule Today - Full width */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Lịch dạy hôm nay</h3>
            <Button
              variant="link"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => navigate('/center-qn/schedule')}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

