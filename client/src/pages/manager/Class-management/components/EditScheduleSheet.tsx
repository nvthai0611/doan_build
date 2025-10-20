import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Plus, Clock, Trash2, User, Calendar, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { dayOptions } from '../../../../utils/commonData';

interface ScheduleItem {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface EditScheduleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classData: any;
    onSubmit: (schedules: ScheduleItem[]) => void;
    isLoading?: boolean;
}

export const EditScheduleSheet = ({ 
    open, 
    onOpenChange, 
    classData, 
    onSubmit, 
    isLoading = false 
}: EditScheduleSheetProps) => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    
    // Load schedules from classData when component opens
    useEffect(() => {
        console.log(classData);
        
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
                    id: `schedule-${index}`,
                    day: schedule.day || 'monday',
                    startTime: schedule.startTime || '08:00',
                    endTime: schedule.endTime || '09:30',
                    duration: calculateDuration(schedule.startTime || '08:00', schedule.endTime || '09:30')
                }));
                setSchedules(loadedSchedules);
            } else {
                // Default empty schedule if no data
                setSchedules([{
                    id: '1',
                    day: 'monday',
                    startTime: '08:00',
                    endTime: '09:30',
                    duration: 90
                }]);
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
    };

    const handleSubmit = () => {
        onSubmit(schedules);
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
                                disabled={isLoading || classData?.status === 'active'}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
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
                                            {classData.status === 'active' ? 'Đang hoạt động' : 'Chưa hoạt động'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                            <Calendar className="h-4 w-4" />
                                            <span>{classData.subjectName} - {classData.gradeName || classData.grade?.name || 'Chưa xác định'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                            <User className="h-4 w-4" />
                                            <span>{classData.teachers?.[0]?.name || 'Chưa phân công'}</span>
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
                    {classData?.status === 'active' && (
                        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            <AlertDescription className="text-sm text-red-800 dark:text-red-200">
                                ⚠️ Lớp học đang ở trạng thái hoạt động. Không thể cập nhật lịch học. Vui lòng chuyển lớp sang trạng thái khác trước.
                            </AlertDescription>
                        </Alert>
                    )}
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Lịch học hàng tuần */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Lịch học hàng tuần</h3>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleAddSchedule}
                                className="text-blue-600 hover:text-blue-700"
                                disabled={classData?.status === 'active'}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Lịch học
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {schedules.map((schedule, index) => (
                                <div key={schedule.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                    <div className="grid grid-cols-12 gap-3 items-end">
                                        {/* Thứ */}
                                        <div className="col-span-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Thứ</label>
                                            <Select 
                                                value={schedule.day} 
                                                onValueChange={(value: string) => handleScheduleChange(schedule.id, 'day', value)}
                                                disabled={classData?.status === 'active'}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Chọn thứ" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dayOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Bắt đầu */}
                                        <div className="col-span-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Bắt đầu <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="time"
                                                    value={schedule.startTime}
                                                    onChange={(e: any) => handleScheduleChange(schedule.id, 'startTime', e.target.value)}
                                                    className="pl-10 h-10"
                                                    disabled={classData?.status === 'active'}
                                                />
                                            </div>
                                        </div>

                                        {/* Kết thúc */}
                                        <div className="col-span-3">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Kết thúc <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="time"
                                                    value={schedule.endTime}
                                                    onChange={(e: any) => {
                                                        const newEndTime = e.target.value;
                                                        const newDuration = calculateDuration(schedule.startTime, newEndTime);
                                                        handleScheduleChange(schedule.id, 'endTime', newEndTime);
                                                        handleScheduleChange(schedule.id, 'duration', newDuration);
                                                    }}
                                                    className="pl-10 h-10"
                                                    disabled={classData?.status === 'active'}
                                                />
                                            </div>
                                        </div>

                                        {/* Thời lượng */}
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                Thời lượng
                                            </label>
                                            <Input
                                                type="number"
                                                value={schedule.duration}
                                                onChange={(e: any) => {
                                                    const newDuration = parseInt(e.target.value) || 0;
                                                    const newEndTime = calculateEndTime(schedule.startTime, newDuration);
                                                    handleScheduleChange(schedule.id, 'duration', newDuration);
                                                    handleScheduleChange(schedule.id, 'endTime', newEndTime);
                                                }}
                                                min={0}
                                                step={15}
                                                className="h-10"
                                                disabled={classData?.status === 'active'}
                                            />
                                        </div>

                                        {/* Delete button */}
                                        <div className="col-span-1 flex justify-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveSchedule(schedule.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-10 w-10 p-0"
                                                disabled={schedules.length === 1 || classData?.status === 'active'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Xem trước lịch học
                        </h4>
                        <div className="space-y-2">
                            {schedules.map(schedule => (
                                <div key={schedule.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                            {getDayLabel(schedule.day)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-green-800 dark:text-green-200">
                                        {schedule.startTime} - {schedule.endTime}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400">
                                        ({schedule.duration} phút)
                                    </div>
                                </div>
                            ))}
                        </div>
                        {schedules.length === 0 && (
                            <div className="text-sm text-green-700 dark:text-green-300 text-center py-4">
                                Chưa có lịch học nào được thiết lập
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

