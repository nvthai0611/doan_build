import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../utils/clientAxios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
  roomId?: string;
  roomName?: string;
}

interface ClassSession {
  id: string;
  name: string;          // class name
  date: string;          // sessionDate
  startTime: string;
  endTime: string;
  roomName: string | null;
  teacherName: string;
  subjectName: string;
  studentCount: number;
  maxStudents: number;
  status: string;
}

interface WeeklySchedulePickerProps {
  selectedSlots: ScheduleSlot[];
  onSlotsChange: (slots: ScheduleSlot[]) => void;
  defaultDuration?: number;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Thứ 2' },
  { value: 'tuesday', label: 'Thứ 3' },
  { value: 'wednesday', label: 'Thứ 4' },
  { value: 'thursday', label: 'Thứ 5' },
  { value: 'friday', label: 'Thứ 6' },
  { value: 'saturday', label: 'Thứ 7' },
  { value: 'sunday', label: 'Chủ nhật' },
];

// Tạo time slots từ 7:00 đến 21:00, mỗi 30 phút
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export const WeeklySchedulePicker = ({
  selectedSlots,
  onSlotsChange,
  defaultDuration = 90,
}: WeeklySchedulePickerProps) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [duration, setDuration] = useState<number>(defaultDuration);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Fetch rooms
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await apiClient.get('/rooms');
      return response;
    },
  });

  const rooms = (roomsData as any)?.data || [];

  // Calculate current week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (currentWeekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  }, [currentWeekOffset]);

  // Fetch weekly schedule
  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['weekly-schedule', weekDates.start.toISOString(), weekDates.end.toISOString()],
    queryFn: async () => {
      const response = await apiClient.get('/admin-center/schedule-management/sessions/week', {
        startDate: weekDates.start.toISOString().split('T')[0],
        endDate: weekDates.end.toISOString().split('T')[0],
      });
      return response;
    },
  });

  const sessions: ClassSession[] = (scheduleData as any)?.data || [];

  // Build occupied slots map by room name: { "monday-08:00-roomName": ClassSession }
  const occupiedSlots = useMemo(() => {
    const map = new Map<string, ClassSession>();
    
    if (!sessions || sessions.length === 0) {
      return map;
    }
    
    sessions.forEach((session) => {
      // Validate session data
      if (!session || !session.date || !session.startTime || !session.endTime) {
        console.warn('Invalid session data:', session);
        return;
      }

      // Skip sessions without room assigned
      if (!session.roomName) {
        return;
      }

      const sessionDate = new Date(session.date);
      
      // Check if date is valid
      if (isNaN(sessionDate.getTime())) {
        console.warn('Invalid session date:', session.date);
        return;
      }

      const dayIndex = sessionDate.getDay(); // 0 (Sunday) to 6 (Saturday)
      
      // Map dayIndex to dayValue safely
      let dayValue: string;
      if (dayIndex === 0) {
        dayValue = 'sunday';
      } else if (dayIndex >= 1 && dayIndex <= 6) {
        const dayObj = DAYS_OF_WEEK[dayIndex - 1];
        if (!dayObj) {
          console.warn('Invalid day index:', dayIndex);
          return;
        }
        dayValue = dayObj.value;
      } else {
        console.warn('Day index out of range:', dayIndex);
        return;
      }
      
      // Get all time slots this session occupies
      const startTime = session.startTime;
      const endTime = session.endTime;
      
      TIME_SLOTS.forEach((timeSlot) => {
        if (timeSlot >= startTime && timeSlot < endTime) {
          const key = `${dayValue}-${timeSlot}-${session.roomName}`;
          map.set(key, session);
        }
      });
    });
    
    return map;
  }, [sessions]);

  const handleSlotClick = (day: string, startTime: string, roomId: string, roomName: string) => {
    // Check if slot is occupied (use roomName as key)
    const key = `${day}-${startTime}-${roomName}`;
    if (occupiedSlots.has(key)) {
      return; // Cannot select occupied slot
    }

    // Check if this slot is already selected
    const existingIndex = selectedSlots.findIndex(
      (slot) => slot.day === day && slot.startTime === startTime && slot.roomId === roomId
    );

    if (existingIndex !== -1) {
      // Remove the slot
      const newSlots = selectedSlots.filter((_, index) => index !== existingIndex);
      onSlotsChange(newSlots);
    } else {
      // Add the slot
      const endTime = calculateEndTime(startTime, duration);
      
      const newSlot: ScheduleSlot = {
        id: Date.now().toString(),
        day,
        startTime,
        endTime,
        duration,
        roomId,
        roomName,
      };
      
      onSlotsChange([...selectedSlots, newSlot]);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const isSlotSelected = (day: string, startTime: string, roomId: string): boolean => {
    return selectedSlots.some(
      (slot) => slot.day === day && slot.startTime === startTime && slot.roomId === roomId
    );
  };

  const removeSlot = (slotId: string) => {
    onSlotsChange(selectedSlots.filter((slot) => slot.id !== slotId));
  };

  const filteredRooms = selectedRoom === 'all' ? rooms : rooms.filter((r: any) => r.id === selectedRoom);

  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return `${weekDates.start.toLocaleDateString('vi-VN', options)} - ${weekDates.end.toLocaleDateString('vi-VN', options)}`;
  };

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="room-filter">Lọc theo phòng</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room-filter" className="mt-1.5">
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {rooms.map((room: any) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Thời lượng (phút)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 90)}
            min={15}
            step={15}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Tuần hiển thị</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center text-sm">
              {formatWeekRange()}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Click vào ô trống để chọn thời gian học. Ô màu đỏ đã có lớp, ô xanh là lịch bạn đã chọn.
        </AlertDescription>
      </Alert>

      {/* Selected Slots Summary */}
      {selectedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lịch đã chọn ({selectedSlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSlots.map((slot) => {
                const dayLabel = DAYS_OF_WEEK.find((d) => d.value === slot.day)?.label;
                return (
                  <Badge
                    key={slot.id}
                    variant="secondary"
                    className="px-3 py-1.5 flex items-center gap-2"
                  >
                    <Clock className="w-3 h-3" />
                    {dayLabel} • {slot.startTime} - {slot.endTime}
                    {slot.roomName && ` • ${slot.roomName}`}
                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {scheduleLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Đang tải lịch...</span>
            </div>
          ) : (
            filteredRooms.map((room: any) => (
              <div key={room.id} className="mb-6 last:mb-0">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-semibold">
                  {room.name} (Sức chứa: {room.capacity})
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-50 dark:bg-gray-900 w-24 sticky left-0 z-10">
                        Giờ
                      </th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th
                          key={day.value}
                          className="border p-2 bg-gray-50 dark:bg-gray-900 text-sm"
                        >
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border p-1 bg-gray-50 dark:bg-gray-900 text-center text-xs font-medium sticky left-0 z-10">
                          {timeSlot}
                        </td>
                        {DAYS_OF_WEEK.map((day) => {
                          const key = `${day.value}-${timeSlot}-${room.name}`;
                          const occupiedSession = occupiedSlots.get(key);
                          const isSelected = isSlotSelected(day.value, timeSlot, room.id);

                          return (
                            <td
                              key={`${day.value}-${timeSlot}`}
                              className={cn(
                                'border p-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                                {
                                  'bg-red-100 dark:bg-red-900/30 cursor-not-allowed hover:bg-red-100':
                                    occupiedSession,
                                  'bg-green-100 dark:bg-green-900/30 hover:bg-green-200':
                                    isSelected,
                                }
                              )}
                              onClick={() =>
                                !occupiedSession && handleSlotClick(day.value, timeSlot, room.id, room.name)
                              }
                              title={
                                occupiedSession
                                  ? `${occupiedSession.name} - ${occupiedSession.teacherName || 'Chưa có GV'}`
                                  : isSelected
                                  ? 'Click để bỏ chọn'
                                  : 'Click để chọn'
                              }
                            >
                              {occupiedSession ? (
                                <div className="text-[10px] leading-tight">
                                  <div className="font-semibold truncate">
                                    {occupiedSession.name}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400 truncate">
                                    {occupiedSession.teacherName || 'N/A'}
                                  </div>
                                </div>
                              ) : isSelected ? (
                                <div className="text-center text-green-700 dark:text-green-300 font-semibold">
                                  ✓
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white dark:bg-gray-800 border"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border"></div>
          <span>Đã có lớp</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border"></div>
          <span>Đã chọn</span>
        </div>
      </div>
    </div>
  );
};

