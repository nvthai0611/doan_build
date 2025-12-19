import { useState } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { classService } from '../../../services/center-owner/class-management/class.service';
import { useRooms } from '@/hooks/use-rooms';
import { scheduleConflictService } from '../../../services/center-owner/schedule-conflict.service';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { dayOptions } from '../../../utils/commonData';
import { WeeklySchedulePicker } from '../../../components/common/WeeklySchedulePicker';

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
  roomId?: string;
  roomName?: string;
}

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddSessionDialog = ({ open, onOpenChange, onSuccess }: AddSessionDialogProps) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<ScheduleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<string>(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  // Helper function to convert day-of-week to actual date
  const getDayDate = (dayOfWeek: string): string => {
    const dayMap: Record<string, number> = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };
    const weekStart = parseISO(weekStartDate);
    const dayIndex = dayMap[dayOfWeek.toLowerCase()] || 0;
    return format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
  };

  // Queries
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses({ page: 1, limit: 999 }),
  });

  console.log(classesData);
  

  const selectedClass = (classesData as any)?.data.find((c: any) => c.id === selectedClassId);

  const handleRemoveSlot = (id: string) => {
    setSelectedSlots(selectedSlots.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!selectedClassId || selectedSlots.length === 0) {
        toast.error('Vui lòng chọn lớp học và ít nhất một slot thời gian');
        return;
      }

      // Submit từng schedule
      for (const slot of selectedSlots) {
        const actualDate = getDayDate(slot.day);
        await scheduleConflictService.addSession({
          classId: selectedClassId,
          sessionDate: actualDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          roomId: slot.roomId,
          notes: notes || undefined,
        });
      }

      toast.success('Thêm buổi học thành công');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error adding session:', error);
      toast.error((error as { message?: string })?.message || 'Có lỗi xảy ra khi thêm buổi học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedClassId('');
    setSelectedSlots([]);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm buổi học mới</DialogTitle>
          <DialogDescription>Chọn lớp học và chọn các slot thời gian cần thêm</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Week Selection */}
          <div className="space-y-2">
            <Label htmlFor="weekStart">Tuần học (bắt đầu từ thứ Hai)</Label>
            <Input
              id="weekStart"
              type="date"
              value={weekStartDate}
              onChange={(e) => {
                const selectedDate = parseISO(e.target.value);
                const mondayOfWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
                setWeekStartDate(format(mondayOfWeek, 'yyyy-MM-dd'));
              }}
            />
            <p className="text-xs text-gray-500">
              Tuần: {format(parseISO(weekStartDate), 'dd/MM/yyyy', { locale: vi })} -{' '}
              {format(addDays(parseISO(weekStartDate), 6), 'dd/MM/yyyy', { locale: vi })}
            </p>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class">Lớp học</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent>
                {(classesData as any)?.data?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId && selectedClass && (
            <>
              {/* Class Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Giáo viên:</strong> {selectedClass.teacher?.name || 'Chưa phân công'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Phòng:</strong> {selectedClass.room?.name || 'Chưa phân công'}
                </p>
              </div>

              {/* Weekly Schedule Picker */}
              <div>
                <Label>Chọn thời gian</Label>
                <WeeklySchedulePicker
                  selectedSlots={selectedSlots}
                  onSlotsChange={setSelectedSlots}
                  teacherId={selectedClass.teacher?.id}
                  excludeClassId={selectedClassId}
                />
              </div>

              {/* Selected Schedules */}
              {selectedSlots.length > 0 && (
                <div className="space-y-2">
                  <Label>Các buổi học đã chọn ({selectedSlots.length})</Label>
                  <div className="space-y-2">
                    {selectedSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {dayOptions.find((d) => d.value === slot.day)?.label} ({format(parseISO(getDayDate(slot.day)), 'dd/MM/yyyy')}) -{' '}
                            {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phòng: {slot.roomName || 'Chưa chọn'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveSlot(slot.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về buổi học..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedClassId || selectedSlots.length === 0 || isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm buổi học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
