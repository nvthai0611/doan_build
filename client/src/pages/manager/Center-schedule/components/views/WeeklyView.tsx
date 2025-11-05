'use client';
import type { ViewType } from '../../CenterSchedulePage';
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
              const slotSessions = getSessionsForDateTime(day, timeSlot);

              return (
                <div
                  key={dayIndex}
                  className="p-2 min-h-16 border-r border-border last:border-r-0 relative bg-white hover:bg-gray-50 transition-colors"
                >
                  {slotSessions.map((session, si) => (
                    <div
                      key={session.id}
                      className={`absolute inset-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity ${getClassSessionStatusColor(session.status)}`}
                      title={`${session.subjectName} - ${session.name} - ${session.roomName}`}
                      onClick={() => onSessionClick(session)}
                      style={{ top: `${si * 20}px`, height: '58px', fontSize: '10px' }}
                    >
                      <div className="truncate font-medium flex items-center justify-between">
                        <span className="truncate">{session.name} - {session.roomName}</span>
                        {session.hasAlert && (
                          <AlertTriangle className="h-3 w-3 text-yellow-600 ml-1 flex-shrink-0" />
                        )}
                      </div>
                      <div className="truncate opacity-90">{session.startTime}-{session.endTime}</div>
                      {session.status === 'day_off' ? (
                        <span style={{ fontSize: '10px' }}>(Nghỉ)</span>
                      ) : session.status === 'end' ? (
                        <span style={{ fontSize: '10px' }}>(Đã kết thúc)</span>
                      ) : session.status === 'cancelled' ? (
                        <span style={{ fontSize: '10px' }}>(Đã hủy)</span>
                      ) : (
                        <div style={{ fontSize: '10px' }}>(Chưa diễn ra)</div>
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
