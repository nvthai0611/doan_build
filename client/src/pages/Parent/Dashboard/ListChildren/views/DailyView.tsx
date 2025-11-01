'use client';
// Utility function
const getSessionDisplayName = (session: any): string => {
  if (!session) return 'N/A'
  
  if (session.class?.subject?.name) {
    return `${session.class.subject.name} - ${session.class.name || 'Lớp học'}`
  }
  
  if (session.subject?.name) {
    return session.subject.name
  }
  
  if (session.class?.name) {
    return session.class.name
  }
  
  return session.name || session.id || 'Buổi học'
}
import { AlertTriangle } from 'lucide-react';
import { ClassSessions } from '../../../manager/Teacher-management/types/session';

export type CalendarViewType = 'daily' | 'weekly' | 'monthly';

interface DailyViewProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onSessionClick: (session: ClassSessions) => void;
  sessions: ClassSessions[];
}

export function DailyView({
  currentDate,
  viewType,
  onSessionClick,
  sessions,
}: DailyViewProps) {
  const dateStr = currentDate.toISOString().split('T')[0];
  const classSessions = sessions.filter((session: any) => {
    // Backend trả về sessionDate, cần convert sang date string
    const sessionDateStr = session.sessionDate ? session.sessionDate.split('T')[0] : session.date;
    return sessionDateStr === dateStr;
  });

  // Generate time slots from 8:00 to 20:00
  const timeSlots: string[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')} giờ`);
  }

  const getSessionsForTime = (timeSlot: string, classSessions: ClassSessions[]) => {
    const hour = Number.parseInt(timeSlot.split(' ')[0]);
    return classSessions.filter((session) => {
      const sessionHour = Number.parseInt(session.startTime.split(':')[0]);
      return sessionHour === hour;
    });
  };

  const weekDays = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  const dayName = weekDays[currentDate.getDay()];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{dayName}</h2>
        <div className="text-sm text-muted-foreground mt-1">Cả ngày</div>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-border">
        {timeSlots.map((timeSlot) => {
          const timeSlotSessions = getSessionsForTime(timeSlot, classSessions);

          return (
            <div key={timeSlot} className="flex">
              <div className="w-20 p-3 text-sm text-muted-foreground border-r border-border">
                {timeSlot}
              </div>
              <div className="flex-1 p-3 min-h-16">
                {timeSlotSessions.length > 0 ? (
                  <div className="space-y-2">
                    {timeSlotSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => onSessionClick(session)}
                        className="bg-indigo-500 text-white p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-indigo-600 transition-colors"
                      >
                        <div>
                          <div className="font-medium">
                            {getSessionDisplayName(session)}
                          </div>
                      <div className="text-sm opacity-90">
                        {session.startTime} - {session.endTime} • {session.roomName || 'Phòng ?'}
                      </div>
                        </div>
                        {session.hasAlert && (
                          <AlertTriangle className="h-4 w-4 text-yellow-300" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
