import { Badge } from '@/components/ui/badge';


export default function PayrollStatusBadge({ status }: any) {
  const statusConfig = {
    pending: {
      label: 'Chờ xử lý',
      variant: 'secondary' as const,
    },
    waiting_teacher_approval: {
      label: 'Chờ xác nhận',
      variant: 'default' as const,
    },
    rejected_by_teacher: {
      label: 'Đã từ chối',
      variant: 'destructive' as const,
    },
    approved_by_teacher: {
      label: 'Đã duyệt',
      variant: 'outline' as const,
    },
    paid: {
      label: 'Đã thanh toán',
      variant: 'outline' as const,
    },
    cancelled: {
      label: 'Đã hủy',
      variant: 'secondary' as const,
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig]   || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
      {config.label}
    </Badge>
  );
}
