'use client';
import type { ViewType } from '../../CenterSchedulePage';
import { getSessionDisplayName } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { ClassSessions } from '../../../Teacher-management/types/session';

interface DailyViewProps {
  currentDate: Date;
  viewType: ViewType;
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
  const classSessions = sessions.filter((session) => session.date === dateStr);

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
    <div className="bg-white rounded-lg border border-border">
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
                            {getSessionDisplayName(session, viewType)}
                          </div>
                          <div className="text-sm opacity-90">
                            {session.startTime} - {session.endTime}
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
