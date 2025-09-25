'use client';
import type { ViewType } from '../../CenterSchedulePage';
import { getDateString, getSessionDisplayName } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { ClassSessions } from '../../../Teacher-management/types/session';

interface MonthlyViewProps {
  currentDate: Date;
  viewType: ViewType;
  onSessionClick: (session: ClassSessions) => void;
  onDayClick?: (date: Date, sessions: ClassSessions[]) => void;
  sessions: ClassSessions[];
}

export function MonthlyView({
  currentDate,
  viewType,
  onSessionClick,
  onDayClick,
  sessions : classSessions,
}: MonthlyViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and calculate calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  const days = [];
  const currentCalendarDate = new Date(startDate);

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  const weekDays = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  const getSessionsForDate = (date: Date, classSessions: ClassSessions[]) => {
    const dateStr = getDateString(date);
    return classSessions.filter((session) => session.date === dateStr);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-border">
      {/* Header with weekdays */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const sessions = getSessionsForDate(date, classSessions);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              className={`min-h-32 p-2 border-r border-b border-border last:border-r-0 ${
                !isCurrentMonthDate ? 'bg-muted/30' : ''
              } ${isTodayDate ? 'bg-red-50 border-red-200' : ''}`}
            >
              <div
                className={`text-sm font-medium mb-2 ${
                  !isCurrentMonthDate
                    ? 'text-muted-foreground'
                    : isTodayDate
                    ? 'text-red-600'
                    : 'text-foreground'
                }`}
              >
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick(session)}
                    className="bg-indigo-500 text-white text-xs px-2 py-1 rounded flex items-center justify-between cursor-pointer hover:bg-indigo-600 transition-colors"
                  >
                    <span className="truncate">
                      {getSessionDisplayName(session, viewType)}
                    </span>
                    {session.hasAlert && (
                      <AlertTriangle className="h-3 w-3 text-yellow-300" />
                    )}
                  </div>
                ))}

                {sessions.length > 3 && (
                  <div
                    onClick={() => onDayClick?.(date, sessions)}
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors bg-white-500 border border-white-500 rounded w-fit px-2 py-0.5 rounded-md"
                  >
                    +{sessions.length - 3} lớp
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
