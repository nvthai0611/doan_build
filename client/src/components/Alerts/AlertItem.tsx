import { Alert } from '../../services/center-owner/alerts/alert.service';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface AlertItemProps {
  alert: Alert;
  onMarkAsRead: (alertId: string) => void;
}

export const AlertItem = ({ alert, onMarkAsRead }: AlertItemProps) => {
  const navigate = useNavigate();
  const isRead = alert.isRead;
  const severity = typeof alert.severity === 'number' ? alert.severity : parseInt(alert.severity) || 1;

  // Get severity color
  const severityColors: any = {
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    3: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Get alert type label
  const getAlertTypeLabel = () => {
    if (alert.alertType === 'class_starting_soon') {
      return 'Lớp sắp bắt đầu';
    }
    if (alert.alertType === 'class_ending_soon') {
      return 'Lớp sắp kết thúc';
    }
    return 'Thông báo';
  };

  // Handle click
  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(alert.id);
    }

    // Navigate to class if payload has classId
    if (alert.payload?.classId) {
      navigate(`/center-qn/classes/${alert.payload.classId}`);
    }
  };

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md',
        !isRead && 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        isRead && 'opacity-75'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={cn('font-semibold text-sm', !isRead && 'font-bold')}>
              {alert.title}
            </h4>
            {!isRead && (
              <Badge className={severityColors[severity] || severityColors[1]}>
                {getAlertTypeLabel()}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-line">
            {alert.message}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(alert.triggeredAt)}</span>
            </div>
            {alert.payload?.daysRemaining && (
              <Badge variant="outline" className="text-xs">
                Còn {alert.payload.daysRemaining} ngày
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRead ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          )}
          {alert.payload?.classId && (
            <ExternalLink className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
    </Card>
  );
};

