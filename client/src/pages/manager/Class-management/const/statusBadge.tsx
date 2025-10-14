import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
    draft: { variant: 'secondary', label: 'Chưa cập nhật' },
    active: { variant: 'default', label: 'Đang diễn ra', className: 'bg-green-100 text-green-800 border-green-200' },
    completed: { variant: 'destructive', label: 'Đã kết thúc' },
    deleted: { variant: 'destructive', label: 'Đã hủy' }
  };
  const config = variants[status] || variants.draft;
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
};
