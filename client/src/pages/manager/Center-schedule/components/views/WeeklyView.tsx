'use client';
import type { ViewType } from '../../CenterSchedulePage';
import { getSessionDisplayName } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { ClassSessions } from '../../../Teacher-management/types/session';

interface WeeklyViewProps {
  currentDate: Date;
  viewType: ViewType;
  onSessionClick: (session: ClassSessions) => void;
  sessions: ClassSessions[];
}

export function WeeklyView({
  currentDate,
  viewType,
  onSessionClick,
  sessions,
}: WeeklyViewProps) {
  // Get start of week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Generate week days
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const dayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  // Generate time slots
  const timeSlots: string[] = [];
  for (let hour = 6; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')} giờ`);
  }

  const getSessionsForDateTime = (date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const hour = Number.parseInt(timeSlot.split(' ')[0]);

    return sessions.filter((session) => {
      if (session.date !== dateStr) return false;
      const sessionHour = Number.parseInt(session.startTime.split(':')[0]);
      return sessionHour === hour;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-border overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-3 border-r border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Cả ngày
          </div>
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="p-3 text-center border-r border-border last:border-r-0"
          >
            <div className="text-sm font-medium text-foreground">
              {dayNames[day.getDay()]}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="divide-y divide-border">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-8">
            <div className="p-3 text-sm text-muted-foreground border-r border-border">
              {timeSlot}
            </div>
            {weekDays.map((day, dayIndex) => {
              const sessions = getSessionsForDateTime(day, timeSlot);

              return (
                <div
                  key={dayIndex}
                  className="p-2 min-h-16 border-r border-border last:border-r-0"
                >
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className="bg-blue-500 text-white text-xs p-2 rounded mb-1 flex items-center justify-between cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <span className="truncate">
                        {getSessionDisplayName(session, viewType)}
                      </span>
                      {session.hasAlert && (
                        <AlertTriangle className="h-3 w-3 text-yellow-300 ml-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
