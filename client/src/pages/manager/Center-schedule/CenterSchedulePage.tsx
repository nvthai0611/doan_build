'use client';

import { useEffect, useState } from 'react';
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
    </div>
  );
}
