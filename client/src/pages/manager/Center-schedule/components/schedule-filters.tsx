'use client';

import { Button } from '@/components/ui/button';
import type { ViewType } from '../CenterSchedulePage';

interface ScheduleFiltersProps {
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}

export function ScheduleFilters({
  viewType,
  onViewTypeChange,
}: ScheduleFiltersProps) {
  const filters = [
    { key: 'subject', label: 'Lịch theo Môn', active: true },
    { key: 'class', label: 'Lịch theo Lớp' },
    { key: 'room', label: 'Lịch theo Phòng' },
    { key: 'teacher', label: 'Lịch theo Giáo viên' },
  ] as const;

  return (
    <div className="flex gap-2 border-b border-border pb-4">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={viewType === filter.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewTypeChange(filter.key as ViewType)}
          className={
            viewType === filter.key ? 'bg-primary text-primary-foreground' : ''
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
