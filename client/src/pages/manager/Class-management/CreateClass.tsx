import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Check, Plus, Clock, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/clientAxios';
import { useClassMutations } from './hooks/useClassMutations';
import { toast } from 'sonner';

interface ScheduleItem {
    id: string;
    day: string;
    startTime: string;
    duration: number;
}

export const CreateClass = () => {
    const navigate = useNavigate();
    const { createClass } = useClassMutations();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        subjectId: '',
        grade: '',
        maxStudents: '',
        roomId: '',
        startDate: '',
        description: '',
        status: 'draft'
    });

    const [useTemplate, setUseTemplate] = useState(false);
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

    // Fetch subjects and rooms
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await apiClient.get('/subjects');
            return response;
        }
    });

    const { data: roomsData } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await apiClient.get('/rooms');
            return response;
        }
    });

    const subjects = (subjectsData as any)?.data || [];
    const rooms = (roomsData as any)?.data || [];

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
        const submitData = {
            ...formData,
            subjectId: formData.subjectId === 'none' ? undefined : formData.subjectId,
            roomId: formData.roomId === 'none' ? undefined : formData.roomId,
            maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined,
            schedules: schedules
        };

        createClass.mutate(submitData, {
            onSuccess: () => {
                toast.success('Tạo lớp học thành công');
                navigate('/center-qn/classes');
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Có lỗi xảy ra khi tạo lớp học');
            }
        });
    };

    const handleCancel = () => {
        navigate('/center-qn/classes');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Thêm mới lớp học</h1>
                            <Breadcrumb className="mt-2">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/center-qn" className="text-muted-foreground hover:text-foreground">
                                            Dashboard
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/center-qn/classes" className="text-muted-foreground hover:text-foreground">
                                            Danh sách lớp học
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-foreground font-medium">Thêm mới lớp học</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                className="h-9 px-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={createClass.isPending}
                                className="h-9 px-4"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {createClass.isPending ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto p-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-6">
                            {/* Tên lớp */}
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Tên lớp <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên lớp học"
                                    className="mt-1.5"
                                    required
                                />
                            </div>

                            {/* Mã lớp & Khoá học */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code" className="text-sm font-medium">Mã lớp</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="Mã lớp"
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="subjectId" className="text-sm font-medium">
                                        Khoá học <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.subjectId}
                                        onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Chọn khoá học" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Chọn khoá học</SelectItem>
                                            {subjects && subjects.length > 0 && subjects?.map((subject: any) => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Ngày khai giảng & Phòng học */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate" className="text-sm font-medium">Ngày khai giảng (dự kiến)</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="roomId" className="text-sm font-medium">Chọn phòng học</Label>
                                    <Select
                                        value={formData.roomId}
                                        onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Chọn phòng học" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không chọn</SelectItem>
                                            {rooms && rooms.length > 0 && rooms.map((room: any) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    {room.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Lịch học hàng tuần */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-base font-semibold">Lịch học hàng tuần</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={handleAddSchedule}
                                    className="text-blue-600 hover:text-blue-700 h-auto p-0"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Lịch học
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {schedules.map((schedule) => (
                                    <div key={schedule.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-end gap-3">
                                            {/* Thứ */}
                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-600 dark:text-gray-400">Thứ</Label>
                                                <Select
                                                    value={schedule.day}
                                                    onValueChange={(value: string) => handleScheduleChange(schedule.id, 'day', value)}
                                                >
                                                    <SelectTrigger className="mt-1 h-9">
                                                        <SelectValue placeholder="Chọn" />
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
                                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                                    Bắt đầu <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative mt-1">
                                                    <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        value={schedule.startTime}
                                                        onChange={(e: any) => handleScheduleChange(schedule.id, 'startTime', e.target.value)}
                                                        className="pl-9 h-9"
                                                    />
                                                </div>
                                            </div>

                                            {/* Thời lượng */}
                                            <div className="flex-1">
                                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                                    Thời lượng (phút) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={schedule.duration}
                                                    onChange={(e: any) => handleScheduleChange(schedule.id, 'duration', parseInt(e.target.value) || 0)}
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

                                {schedules.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm border border-dashed rounded-lg">
                                        Chưa có lịch học. Click "+ Lịch học" để thêm.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Use Template Switch */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="useTemplate" className="text-sm font-medium cursor-pointer">
                                    Sử dụng chương trình học theo khoá học mẫu
                                </Label>
                                <Switch
                                    id="useTemplate"
                                    checked={useTemplate}
                                    onCheckedChange={setUseTemplate}
                                />
                            </div>
                        </div>

                        {/* Mô tả */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                            <Label htmlFor="description" className="text-sm font-medium">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập gì đó tại đây"
                                rows={20}
                                className="mt-3 resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Sử dụng các công cụ định dạng văn bản để làm đẹp nội dung
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateClass;

