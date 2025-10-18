import { Badge } from '@/components/ui/badge';
import { ClassStatus, CLASS_STATUS_LABELS, CLASS_STATUS_COLORS } from '../../../../lib/constants';

export const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
    [ClassStatus.DRAFT]: { variant: 'secondary', label: CLASS_STATUS_LABELS[ClassStatus.DRAFT] },
    [ClassStatus.READY]: { variant: 'outline', label: CLASS_STATUS_LABELS[ClassStatus.READY], className: CLASS_STATUS_COLORS[ClassStatus.READY] },
    [ClassStatus.ACTIVE]: { variant: 'default', label: CLASS_STATUS_LABELS[ClassStatus.ACTIVE], className: CLASS_STATUS_COLORS[ClassStatus.ACTIVE] },
    [ClassStatus.COMPLETED]: { variant: 'destructive', label: CLASS_STATUS_LABELS[ClassStatus.COMPLETED], className: CLASS_STATUS_COLORS[ClassStatus.COMPLETED] },
    [ClassStatus.SUSPENDED]: { variant: 'outline', label: CLASS_STATUS_LABELS[ClassStatus.SUSPENDED], className: CLASS_STATUS_COLORS[ClassStatus.SUSPENDED] },
    [ClassStatus.CANCELLED]: { variant: 'destructive', label: CLASS_STATUS_LABELS[ClassStatus.CANCELLED], className: CLASS_STATUS_COLORS[ClassStatus.CANCELLED] }
  };
  const config = variants[status] || variants[ClassStatus.DRAFT];
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
};
