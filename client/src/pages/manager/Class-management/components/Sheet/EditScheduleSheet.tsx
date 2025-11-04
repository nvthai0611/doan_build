import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Check, Plus, Clock, Trash2, User, Calendar, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { dayOptions } from '../../../../../utils/commonData';
import { ClassStatus } from '../../../../../lib/constants';
import { WeeklySchedulePicker } from '../../../../../components/common/WeeklySchedulePicker';
import { formatDateForInput } from '../../../../../utils/format';

interface ScheduleItem {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    duration: number;
    roomId?: string;
    roomName?: string;
}

interface EditScheduleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classData: any;
    onSubmit: (schedules: ScheduleItem[]) => void;
    isLoading?: boolean;
    expectedStartDate?: string; // Ngày khai giảng dự kiến hiện tại (có thể từ editData)
}

export const EditScheduleSheet = ({ 
    open, 
    onOpenChange, 
    classData, 
    onSubmit, 
    isLoading = false,
    expectedStartDate: propExpectedStartDate
}: EditScheduleSheetProps) => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [useCalendarPicker, setUseCalendarPicker] = useState(true); // Mặc định dùng calendar picker
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    // Load schedules from classData when component opens
    useEffect(() => {
        
        if (open && classData) {
            let scheduleData = null;
            
            // Try to get schedule from class level first
            if (classData.recurringSchedule?.schedules) {
                scheduleData = classData.recurringSchedule.schedules;
            }
            // If not available, try from teacher assignment
            else if (classData.teachers?.[0]?.recurringSchedule?.schedules) {
                scheduleData = classData.teachers[0].recurringSchedule.schedules;
            }
            
            if (scheduleData && Array.isArray(scheduleData)) {
                const loadedSchedules: ScheduleItem[] = scheduleData.map((schedule: any, index: number) => ({
                    id: Date.now().toString() + index,
                    day: schedule.day || '',
                    startTime: schedule.startTime || '08:00',
                    endTime: schedule.endTime || '09:30',
                    duration: calculateDuration(schedule.startTime || '08:00', schedule.endTime || '09:30'),
                    roomId: schedule.roomId,
                    roomName: schedule.roomName
                }));
                setSchedules(loadedSchedules);
            } else {
                // Default empty schedule if no data
                setSchedules([]);
            }
        }
    }, [open, classData]);

    // Helper function to calculate duration in minutes
    const calculateDuration = (startTime: string, endTime: string): number => {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        return endTotalMinutes - startTotalMinutes;
    };

    // Helper function to calculate end time from start time and duration
    const calculateEndTime = (startTime: string, duration: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    };
    

    const handleAddSchedule = () => {
        // Tìm thứ tiếp theo chưa được sử dụng theo thứ tự logic
        const usedDays = schedules.map(s => s.day);
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const nextAvailableDay = dayOrder.find(day => !usedDays.includes(day)) || 'monday';
        const newSchedule: ScheduleItem = {
            id: Date.now().toString(),
            day: nextAvailableDay,
            startTime: '08:00',
            endTime: '09:30',
            duration: 90
        };
        setSchedules([...schedules, newSchedule]);
        // Clear error khi thêm mới
        setErrors({});
    };

    const handleRemoveSchedule = (id: string) => {
        setSchedules(schedules.filter(s => s.id !== id));
    };

    const handleScheduleChange = (id: string, field: keyof ScheduleItem, value: string | number) => {
        let updatedSchedule = schedules.find(s => s.id === id);
        if (!updatedSchedule) return;

        if (field === 'startTime' || field === 'duration') {
            // Recalculate endTime when startTime or duration changes
            const newStartTime = field === 'startTime' ? value as string : updatedSchedule.startTime;
            const newDuration = field === 'duration' ? value as number : updatedSchedule.duration;
            const newEndTime = calculateEndTime(newStartTime, newDuration);
            
            setSchedules(schedules.map(s => 
                s.id === id ? { ...s, [field]: value, endTime: newEndTime } : s
            ));
        } else {
            setSchedules(schedules.map(s => 
                s.id === id ? { ...s, [field]: value } : s
            ));
        }

        // Clear error for this field when user changes it
        if (errors[`${id}-${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${id}-${field}`];
                return newErrors;
            });
        }
    };

    // Validation function
    const validateSchedules = (): boolean => {
        const newErrors: Record<string, string> = {};

        schedules.forEach((schedule, index) => {
            // Validate day selection
            if (!schedule.day || schedule.day === '') {
                newErrors[`${schedule.id}-day`] = 'Vui lòng chọn thứ';
            }

            // Validate start time
            if (!schedule.startTime) {
                newErrors[`${schedule.id}-startTime`] = 'Vui lòng nhập giờ bắt đầu';
            }

            // Validate duration
            if (!schedule.duration || schedule.duration <= 0) {
                newErrors[`${schedule.id}-duration`] = 'Thời lượng phải lớn hơn 0';
            }

            // Check for time conflicts on same day
            if (schedule.day) {
                const sameDaySchedules = schedules.filter(s => s.day === schedule.day);
                
                if (sameDaySchedules.length > 1) {
                    // Convert time to minutes for easier comparison
                    const toMinutes = (time: string) => {
                        const [h, m] = time.split(':').map(Number);
                        return h * 60 + m;
                    };

                    const currentStart = toMinutes(schedule.startTime);
                    const currentEnd = toMinutes(schedule.endTime);

                    sameDaySchedules.forEach(otherSchedule => {
                        if (otherSchedule.id !== schedule.id) {
                            const otherStart = toMinutes(otherSchedule.startTime);
                            const otherEnd = toMinutes(otherSchedule.endTime);

                            // Check if time ranges overlap
                            const isOverlapping = (
                                (currentStart >= otherStart && currentStart < otherEnd) ||
                                (currentEnd > otherStart && currentEnd <= otherEnd) ||
                                (currentStart <= otherStart && currentEnd >= otherEnd)
                            );

                            if (isOverlapping) {
                                newErrors[`${schedule.id}-time`] = `Trùng giờ với ca học khác cùng ngày (${otherSchedule.startTime} - ${otherSchedule.endTime})`;
                            }
                        }
                    });
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        // Validate before submit
        if (!validateSchedules()) {
            return;
        }
        
        // Filter out schedules without valid data
        const validSchedules = schedules.filter(s => s.day && s.startTime && s.duration > 0);
        onSubmit(validSchedules);
    };

    const getDayLabel = (day: string) => {
        return dayOptions.find(opt => opt.value === day)?.label || day;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-semibold">Cập nhật lịch học</SheetTitle>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 p-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button 
                                size="sm"
                                onClick={handleSubmit}
                                // disabled={isLoading || classData?.status === ClassStatus.ACTIVE}
                                className="h-8 w-8 p-0 "
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Class Information */}
                    {classData && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">{classData.name}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {classData.status === ClassStatus.ACTIVE ? 'Đang hoạt động' : 'Chưa hoạt động'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                            <Calendar className="h-4 w-4" />
                                            <span>{classData.subjectName} - {classData.gradeName || classData.grade?.name || 'Chưa xác định'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                            <User className="h-4 w-4" />
                                            <span>{classData.teacher?.fullName || 'Chưa phân công'}</span>
                                        </div>
                                    </div>
                                    {classData.roomName && (
                                        <div className="text-xs text-blue-700 dark:text-blue-300">
                                            Phòng: {classData.roomName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Banner */}
                    <Alert className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800">
                        <AlertDescription className="text-sm text-cyan-800 dark:text-cyan-200">
                            Bạn nhớ kiểm tra lại lịch phân công giảng dạy của giáo viên trong lớp sau khi cập nhật lịch học nhé.
                        </AlertDescription>
                    </Alert>

                    {/* Status Warning */}
                    {classData?.status === ClassStatus.ACTIVE && (
                        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                                ⚠️ Lớp học đang ở trạng thái hoạt động. Vui lòng chắc chắn rằng bạn muốn đổi lịch học này
                            </AlertDescription>
                        </Alert>
                    )}
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Lịch học hàng tuần */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-base font-semibold">
                                Lịch học hàng tuần
                            </Label>
                            <div className="flex items-center gap-2">
                                {useCalendarPicker ? (
                                    <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Chọn từ lịch
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Chọn thời gian học từ lịch hệ thống</DialogTitle>
                                            </DialogHeader>
                                            <WeeklySchedulePicker
                                                selectedSlots={schedules}
                                                onSlotsChange={setSchedules}
                                                defaultDuration={90}
                                                expectedStartDate={
                                                    propExpectedStartDate 
                                                        ? formatDateForInput(propExpectedStartDate)
                                                        : classData?.expectedStartDate 
                                                            ? formatDateForInput(classData.expectedStartDate) 
                                                            : undefined
                                                }
                                            />
                                            <div className="flex justify-end gap-2 pt-4 border-t">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsScheduleModalOpen(false)}
                                                >
                                                    Đóng
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsScheduleModalOpen(false)}
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Xong
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddSchedule}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm lịch học
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant={useCalendarPicker ? "ghost" : "default"}
                                    size="sm"
                                    onClick={() => setUseCalendarPicker(!useCalendarPicker)}
                                >
                                    {useCalendarPicker ? 'Nhập thủ công' : 'Chọn từ lịch'}
                                </Button>
                            </div>
                        </div>

                        {/* Hiển thị lịch đã chọn */}
                        <div className="space-y-3">
                            {schedules.length > 0 ? (
                                schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">
                                                    {dayOptions.find(d => d.value === schedule.day)?.label || schedule.day}
                                                </span>
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                ({schedule.duration} phút)
                                            </div>
                                            {schedule.roomName && (
                                                <div className="text-blue-600 dark:text-blue-400">
                                                    {schedule.roomName}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSchedule(schedule.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm border border-dashed rounded-lg">
                                    Chưa có lịch học. Click "{useCalendarPicker ? 'Chọn từ lịch' : 'Thêm lịch học'}" để thêm.
                                </div>
                            )}

                            {/* Form nhập thủ công khi không dùng calendar */}
                            {!useCalendarPicker && schedules.length > 0 && (
                                <div className="space-y-3 pt-3 border-t">
                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="p-3 border rounded-lg bg-white dark:bg-gray-900"
                                        >
                                            <div className="flex items-end gap-3">
                                                {/* Thứ */}
                                                <div className="flex-1">
                                                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                                                        Thứ
                                                    </Label>
                                                    <Select
                                                        value={schedule.day}
                                                        onValueChange={(value: string) =>
                                                            handleScheduleChange(schedule.id, 'day', value)
                                                        }
                                                    >
                                                        <SelectTrigger className="mt-1 h-9">
                                                            <SelectValue placeholder="Chọn" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dayOptions.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Bắt đầu */}
                                                <div className="flex-1">
                                                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                                                        Bắt đầu <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative mt-1">
                                                        <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                        <Input
                                                            type="time"
                                                            value={schedule.startTime}
                                                            onChange={(e: any) =>
                                                                handleScheduleChange(
                                                                    schedule.id,
                                                                    'startTime',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="pl-9 h-9"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Thời lượng */}
                                                <div className="flex-1">
                                                    <Label className="text-xs text-gray-600 dark:text-gray-400">
                                                        Thời lượng (phút){' '}
                                                        <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={schedule.duration}
                                                        onChange={(e: any) =>
                                                            handleScheduleChange(
                                                                schedule.id,
                                                                'duration',
                                                                parseInt(e.target.value) || 0,
                                                            )
                                                        }
                                                        min={0}
                                                        step={15}
                                                        className="mt-1 h-9"
                                                    />
                                                </div>

                                                {/* Delete button */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveSchedule(schedule.id)}
                                                    className="text-red-600 hover:text-red-700 h-9 w-9 p-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
};

