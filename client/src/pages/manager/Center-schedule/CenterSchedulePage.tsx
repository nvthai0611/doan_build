'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleFilters } from './components/ScheduleFilters';
import { MonthlyView } from './components/views/MonthlyView';
import { DailyView } from './components/views/DailyView';
import { WeeklyView } from './components/views/WeeklyView';
import { ClassView } from './components/views/ClassView';
import { TeacherView } from './components/views/TeacherView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { DaySessionsModal } from './components/DaySessionsModal';
import { useMutation } from '@tanstack/react-query';
import { scheduleService } from '../../../services/scheduleService';
import type { ApiResponse } from '../../../utils/clientAxios';
import type { ClassSessionResponse } from '../../../services/scheduleService';
import { ClassSessions } from '../Teacher-management/types/session';
import Loading from '../../../components/Loading/LoadingPage';

export type ViewType = 'subject' | 'class' | 'room' | 'teacher';
export type CalendarView = 'month' | 'day' | 'week';

export default function CenterSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('subject');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selectedSession, setSelectedSession] = useState<ClassSessions | null>(
    null,
  );
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [daySessionsList, setDaySessionsList] = useState<ClassSessions[]>([]);
  const [selectedDaySessionsList, setSelectedDaySessionsList] = useState<ClassSessions[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

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


  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun ... 6 Sat
    const mondayOffset = day === 0 ? -6 : 1 - day; // về Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  };

  const { mutate: fetchSessions, isPending } = useMutation<ApiResponse<ClassSessionResponse>>({
    mutationFn: async () => {
      if (calendarView === 'day') {
        return scheduleService.getClassSessionsByDay(currentDate);
      }
      if (calendarView === 'week') {
        const { start, end } = getWeekRange(currentDate);
        return scheduleService.getClassSessionsByWeek(start, end);
      }
      return scheduleService.getClassSessionsByMonth(
        currentDate.getMonth() + 1,
        currentDate.getFullYear(),
      );
    },
    onSuccess: (res) => {
      setDaySessionsList((res.data as unknown as ClassSessions[]) || []);
    },
    onError: (error) => {
      console.error('Error fetching sessions:', error);
    },
  });

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarView, currentDate]);

  const handleSessionClick = (classSession: ClassSessions) => {
    setSelectedSession(classSession);
    setIsSessionModalOpen(true);
  };

  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedSession(null);
  };

  const handleDayClick = (date: Date, sessions: ClassSessions[]) => {
    setSelectedDate(date);
    setSelectedDaySessionsList(sessions);
    setIsDayModalOpen(true);
  };

  const handleCloseDayModal = () => {
    setIsDayModalOpen(false);
    setSelectedDate(null);
  };

  const renderView = () => {
    if (calendarView === 'month') {
      return (
        <MonthlyView
          currentDate={currentDate}
          viewType={viewType}
          onSessionClick={handleSessionClick}
          onDayClick={handleDayClick}
          sessions={daySessionsList || []}
        />
      );
    }

    if (calendarView === 'day') {
      return (
        <DailyView
          currentDate={currentDate}
          viewType={viewType}
          onSessionClick={handleSessionClick}
          sessions={daySessionsList}
        />
      );
    }

    if (calendarView === 'week') {
      return (
        <WeeklyView
          currentDate={currentDate}
          viewType={viewType}
          onSessionClick={handleSessionClick}
          sessions={daySessionsList}
        />
      );
    }

    // Additional views based on viewType
    switch (viewType) {
      case 'class':
          return <ClassView currentDate={currentDate} sessions={daySessionsList} />;
      case 'teacher':
        return <TeacherView currentDate={currentDate} sessions={daySessionsList} />;
      default:
        return (
          <MonthlyView
            currentDate={currentDate}
            viewType={viewType}
            onSessionClick={handleSessionClick}
            onDayClick={handleDayClick}
            sessions={daySessionsList}
          />
        );
    }
  };

  return isPending ? (
    <div className="flex justify-center items-center h-screen">
      <Loading />
    </div>
  ) : (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <ScheduleHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
        />

        {/* <ScheduleFilters viewType={viewType} onViewTypeChange={setViewType} /> */}

        <div className="mt-6">{renderView()}</div>

        <SessionDetailModal
          session={selectedSession}
          isOpen={isSessionModalOpen}
          onClose={handleCloseSessionModal}
        />

        <DaySessionsModal
          date={selectedDate}
          sessions={selectedDaySessionsList}
          isOpen={isDayModalOpen}
          onClose={handleCloseDayModal}
          onSessionClick={handleSessionClick}
        />
      </div>

      {/* Legend Sidebar */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out ${
          isLegendOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'
        }`}
      >
        <div className="bg-white border-l border-t border-b border-gray-200 rounded-l-lg shadow-lg flex">
          {/* Toggle Button */}
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-l-lg transition-colors"
            aria-label={isLegendOpen ? 'Ẩn chú thích' : 'Hiện chú thích'}
          >
            {isLegendOpen ? (
              <ChevronRight className="w-5 h-5 text-gray-700" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Legend Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isLegendOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Chú thích trạng thái</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${getClassSessionStatusColor('has_not_happened')}`}></div>
                  <span className="text-sm text-blue-600">Chưa diễn ra</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${getClassSessionStatusColor('happening')}`}></div>
                  <span className="text-sm text-green-600">Đang diễn ra</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${getClassSessionStatusColor('end')}`}></div>
                  <span className="text-sm text-red-600">Đã kết thúc</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${getClassSessionStatusColor('cancelled')}`}></div>
                  <span className="text-sm text-red-600">Đã hủy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${getClassSessionStatusColor('day_off')}`}></div>
                  <span className="text-sm text-orange-600">Nghỉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
