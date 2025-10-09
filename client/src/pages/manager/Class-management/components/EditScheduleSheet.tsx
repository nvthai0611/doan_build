import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Plus, Clock, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScheduleItem {
    id: string;
    day: string;
    startTime: string;
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
    const [schedules, setSchedules] = useState<ScheduleItem[]>([
        { id: '1', day: 'wednesday', startTime: '19:45', duration: 90 },
        { id: '2', day: 'friday', startTime: '19:45', duration: 90 }
    ]);

    const dayOptions = [
        { value: 'monday', label: 'Thứ Hai' },
        { value: 'tuesday', label: 'Thứ Ba' },
        { value: 'wednesday', label: 'Thứ Tư' },
        { value: 'thursday', label: 'Thứ Năm' },
        { value: 'friday', label: 'Thứ Sáu' },
        { value: 'saturday', label: 'Thứ Bảy' },
        { value: 'sunday', label: 'Chủ Nhật' }
    ];

    const handleAddSchedule = () => {
        const newSchedule: ScheduleItem = {
            id: Date.now().toString(),
            day: 'monday',
            startTime: '08:00',
            duration: 90
        };
        setSchedules([...schedules, newSchedule]);
    };

    const handleRemoveSchedule = (id: string) => {
        setSchedules(schedules.filter(s => s.id !== id));
    };

    const handleScheduleChange = (id: string, field: keyof ScheduleItem, value: string | number) => {
        setSchedules(schedules.map(s => 
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleSubmit = () => {
        onSubmit(schedules);
    };

    const getDayLabel = (day: string) => {
        return dayOptions.find(opt => opt.value === day)?.label || day;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
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
                                disabled={isLoading}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <Alert className="bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800">
                        <AlertDescription className="text-sm text-cyan-800 dark:text-cyan-200">
                            Bạn nhớ kiểm tra lại lịch phân công giảng dạy của giáo viên trong lớp sau khi cập nhật lịch học nhé.
                        </AlertDescription>
                    </Alert>
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
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Lịch học
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {schedules.map((schedule, index) => (
                                <div key={schedule.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                                    <div className="flex items-end gap-3">
                                        {/* Thứ */}
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Thứ</label>
                                            <Select 
                                                value={schedule.day} 
                                                onValueChange={(value: string) => handleScheduleChange(schedule.id, 'day', value)}
                                            >
                                                <SelectTrigger>
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
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                                Bắt đầu <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="time"
                                                    value={schedule.startTime}
                                                    onChange={(e: any) => handleScheduleChange(schedule.id, 'startTime', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        {/* Thời lượng */}
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                                Thời lượng (phút) <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                value={schedule.duration}
                                                onChange={(e: any) => handleScheduleChange(schedule.id, 'duration', parseInt(e.target.value) || 0)}
                                                min={0}
                                                step={15}
                                            />
                                        </div>

                                        {/* Delete button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSchedule(schedule.id)}
                                            className="text-red-600 hover:text-red-700 h-10 w-10 p-0"
                                            disabled={schedules.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Xem trước lịch học:</h4>
                        <div className="space-y-1">
                            {schedules.map(schedule => (
                                <div key={schedule.id} className="text-sm text-blue-800 dark:text-blue-300">
                                    • {getDayLabel(schedule.day)}, {schedule.startTime} → {
                                        (() => {
                                            const [hours, minutes] = schedule.startTime.split(':').map(Number);
                                            const totalMinutes = hours * 60 + minutes + schedule.duration;
                                            const endHours = Math.floor(totalMinutes / 60) % 24;
                                            const endMinutes = totalMinutes % 60;
                                            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                                        })()
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

