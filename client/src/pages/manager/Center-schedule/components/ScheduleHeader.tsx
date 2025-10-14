'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalendarView } from '../CenterSchedulePage';

interface ScheduleHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  calendarView: CalendarView;
  onCalendarViewChange: (view: CalendarView) => void;
}

export function ScheduleHeader({
  currentDate,
  onDateChange,
  calendarView,
  onCalendarViewChange,
}: ScheduleHeaderProps) {
  const formatDate = () => {
    if (calendarView === 'month') {
      return `Tháng ${
        currentDate.getMonth() + 1
      }, ${currentDate.getFullYear()}`;
    }
    if (calendarView === 'day') {
      return `${currentDate.getDate()} tháng ${
        currentDate.getMonth() + 1
      }, ${currentDate.getFullYear()}`;
    }
    if (calendarView === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} thg ${
        endOfWeek.getMonth() + 1
      }, ${endOfWeek.getFullYear()}`;
    }
    return '';
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (calendarView === 'month') {
      newDate.setMonth(
        currentDate.getMonth() + (direction === 'next' ? 1 : -1),
      );
    } else if (calendarView === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }

    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{formatDate()}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hôm nay
        </Button>

        <Select
          value={calendarView}
          onValueChange={(value: CalendarView) => onCalendarViewChange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Tháng</SelectItem>
            <SelectItem value="week">Tuần</SelectItem>
            <SelectItem value="day">Ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
