'use client';
import type { ViewType } from '../../CenterSchedulePage';
import { getDateString } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { ClassSessions } from '../../../Teacher-management/types/session';
import { useState, useMemo } from 'react';

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
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const toggleDateExpand = (dateKey: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey); else next.add(dateKey);
      return next;
    });
  };
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

  const getClassSessionStatusColor = (status: string) => {
    switch (status) {
      case 'day_off':
        return 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 text-orange-800 shadow-sm';
      case 'happening':
        return 'bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-300 text-green-800 shadow-sm';
      case 'end':
        return 'bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 text-red-800 shadow-sm';
      case 'has_not_happened':
        return 'bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 text-blue-800 shadow-sm';
      case 'cancelled':
        return 'bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 text-red-800 shadow-sm';
      default:
        return 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-400 text-yellow-900 shadow-sm';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-border">
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
          const dateKey = getDateString(date);
          const isExpanded = expandedDates.has(dateKey);

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

              <div className={`space-y-1 ${isExpanded ? 'max-h-none' : 'max-h-22 overflow-y-auto'}`}>
                {(isExpanded ? sessions : sessions.slice(0, 1)).map((session) => (
                  <div
                    key={session.id}
                    className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getClassSessionStatusColor(session.status)}`}
                    title={`${session.subjectName} - ${session.name} - ${session.roomName}`}
                    onClick={() => onSessionClick(session)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{session.name} - {session.roomName}</span>
                        </div>
                        <div className="text-xs opacity-90 truncate">{session.startTime}-{session.endTime}</div>
                        {session.status === 'day_off' ? (
                          <span style={{ fontSize: '10px' }}>(Nghỉ)</span>
                        ) : session.status === 'end' ? (
                          <span style={{ fontSize: '10px' }}>(Đã kết thúc)</span>
                        ) : session.status === 'cancelled' ? (
                          <span style={{ fontSize: '10px' }}>(Đã hủy)</span>
                        ) : (
                          <div style={{ fontSize: '10px' }}>(Chưa diễn ra)</div>
                        )}
                      </span>
                      {session.hasAlert && (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}

                {sessions.length > 1 && !isExpanded && (
                  <button
                    type="button"
                    className="text-xs text-purple-600 text-center py-1 w-full hover:text-purple-800"
                    onClick={() => toggleDateExpand(dateKey)}
                  >
                    +{sessions.length - 1} buổi khác
                  </button>
                )}
                {sessions.length > 1 && isExpanded && (
                  <button
                    type="button"
                    className="text-xs text-purple-600 text-center py-1 w-full hover:text-purple-800"
                    onClick={() => toggleDateExpand(dateKey)}
                  >
                    Thu gọn
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
