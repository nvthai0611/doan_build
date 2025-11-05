import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../../services/center-owner/alerts/alert.service';
import { AlertItem } from './AlertItem';
import { Button } from '../../assets/shadcn-ui/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../assets/shadcn-ui/components/ui/select';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth';

interface AlertListProps {
  onUpdate?: () => void;
}

export const AlertList = ({ onUpdate }: AlertListProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('unread');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Chỉ các role center_owner, admin, teacher mới có quyền xem alerts
  const hasAlertAccess = user?.role === 'center_owner' || user?.role === 'admin' || user?.role === 'teacher';

  // Fetch tất cả alerts (không filter ở backend)
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: async () => {
      try {
        const response = await alertService.getAlerts({ page: 1, limit: 1000 });
        return response;
      } catch (error) {
        // Không báo lỗi, chỉ return empty data
        return { data: [], meta: { unreadCount: 0 } };
      }
    },
    enabled: hasAlertAccess, // Chỉ gọi API khi có quyền
    refetchInterval: hasAlertAccess ? 5000 : false, // Refetch every 5 seconds nếu có quyền
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => alertService.markAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] });
      if (onUpdate) onUpdate();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => alertService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] });
      toast.success('Đã đánh dấu tất cả đã đọc');
      if (onUpdate) onUpdate();
    },
  });

  // Parse response data
  let allAlerts: any[] = [];
  let totalUnreadCount = 0;

  if (alertsData) {
    if (alertsData.data && Array.isArray(alertsData.data)) {
      allAlerts = alertsData.data;
      totalUnreadCount = alertsData.meta?.unreadCount || 0;
    } else if (Array.isArray(alertsData)) {
      allAlerts = alertsData;
    }
  }

  // Filter ở frontend
  let alerts = allAlerts;

  // Filter theo loại alertType
  if (filterType !== 'all') {
    alerts = alerts.filter((alert: any) => alert.alertType === filterType);
  }

  // Filter theo trạng thái đọc (isRead) ở frontend
  if (filterRead === 'unread') {
    alerts = alerts.filter((alert: any) => !alert.isRead);
  } else if (filterRead === 'read') {
    alerts = alerts.filter((alert: any) => alert.isRead);
  }
  // Nếu filterRead === 'all', không filter (giữ nguyên)

  // Tính unreadCount sau khi filter
  const filteredUnreadCount = alerts.filter((alert: any) => !alert.isRead).length;
  const unreadCount = filteredUnreadCount; // Hiển thị số lượng sau khi filter

  const handleMarkAsRead = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-sm text-gray-500">
                ({unreadCount} chưa đọc)
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="class_starting_soon">Lớp sắp bắt đầu</SelectItem>
              <SelectItem value="class_ending_soon">Lớp sắp kết thúc</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unread">Chưa đọc</SelectItem>
              <SelectItem value="read">Đã đọc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              Đang tải...
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            alerts.map((alert: any) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

