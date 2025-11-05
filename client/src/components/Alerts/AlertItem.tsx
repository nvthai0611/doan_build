import { Alert } from '../../services/center-owner/alerts/alert.service';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'p-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border-b border-gray-100 dark:border-gray-800',
              !isRead && 'bg-blue-50 dark:bg-blue-950/30',
              isRead && 'opacity-60'
            )}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn('font-medium text-xs truncate', !isRead && 'font-semibold')}>
                    {alert.title}
                  </h4>
                  {!isRead && (
                    <Badge className={cn('text-xs px-1.5 py-0', severityColors[severity] || severityColors[1])}>
                      {getAlertTypeLabel()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(alert.triggeredAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {isRead ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
                {alert.payload?.classId && (
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{alert.title}</div>
            <div className="text-sm whitespace-pre-line">{alert.message}</div>
            {alert.payload?.daysRemaining && (
              <Badge variant="outline" className="text-xs">
                Còn {alert.payload.daysRemaining} ngày
              </Badge>
            )}
            <div className="text-xs text-gray-500">
              {formatDate(alert.triggeredAt)}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

