import { useQuery } from '@tanstack/react-query';
import { scheduleConflictService } from '@/services/center-owner/schedule-conflict.service';

export const useRoomConflicts = (params?: {
  startDate?: string;
  endDate?: string;
  roomId?: string;
}) => {
  return useQuery({
    queryKey: ['room-conflicts', params],
    queryFn: () => scheduleConflictService.getRoomConflicts(params),
    staleTime: 30000,
  });
};

export const useTeacherAvailableSlots = (
  teacherId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  },
) => {
  return useQuery({
    queryKey: ['teacher-available-slots', teacherId, params],
    queryFn: () =>
      scheduleConflictService.getTeacherAvailableSlots(teacherId, params),
    enabled: !!teacherId,
    staleTime: 30000,
  });
};
