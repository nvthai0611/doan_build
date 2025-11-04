import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StatusSectionProps {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export function StatusSection({
  status,
  approvedBy,
  approvedAt,
  notes,
}: StatusSectionProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: 'Đang Chờ Duyệt',
      description: 'Đơn của bạn đang được xem xét bởi quản lý',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-500',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900 dark:text-amber-100',
      descColor: 'text-amber-700 dark:text-amber-300',
    },
    approved: {
      icon: CheckCircle2,
      title: 'Đã Phê Duyệt',
      description: 'Đơn nghỉ phép của bạn đã được chấp thuận',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900 dark:text-green-100',
      descColor: 'text-green-700 dark:text-green-300',
    },
    rejected: {
      icon: XCircle,
      title: 'Đã Từ Chối',
      description: 'Đơn nghỉ phép của bạn không được chấp thuận',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900 dark:text-red-100',
      descColor: 'text-red-700 dark:text-red-300',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
          6
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Trạng Thái Phê Duyệt
        </h2>
      </div>

      <div className="pl-0 md:pl-13">
        <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                className={`h-6 w-6 ${config.iconColor} flex-shrink-0 mt-0.5`}
              />
              <div className="flex-1">
                <p className={`font-semibold ${config.titleColor}`}>
                  {config.title}
                </p>
                <p className={`text-sm ${config.descColor} mt-1`}>
                  {config.description}
                </p>

                {approvedBy && approvedAt && (
                  <div className={`text-xs ${config.descColor} mt-2 space-y-1`}>
                    <p>Người phê duyệt: {approvedBy}</p>
                    <p>
                      Thời gian: {new Date(approvedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}

                {notes && (
                  <div
                    className={`text-sm ${config.descColor} mt-3 p-2 bg-white/50 dark:bg-black/20 rounded`}
                  >
                    <p className="font-medium">Ghi chú:</p>
                    <p className="mt-1">{notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
