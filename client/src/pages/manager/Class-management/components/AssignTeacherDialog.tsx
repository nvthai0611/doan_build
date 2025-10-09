import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';    
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface AssignTeacherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    teachers?: any[];
    classData: any;
    isLoading?: boolean;
}

export const AssignTeacherDialog = ({ open, onOpenChange, onSubmit, teachers = [], classData, isLoading }: AssignTeacherDialogProps) => {
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState({
        teacherId: '',
        semester: '1',
        academicYear: `${currentYear}-${currentYear + 1}`,
        startDate: '',
        endDate: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        handleReset();
    };

    const handleReset = () => {
        setFormData({
            teacherId: '',
            semester: '1',
            academicYear: `${currentYear}-${currentYear + 1}`,
            startDate: '',
            endDate: '',
            notes: ''
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Phân công giáo viên</DialogTitle>
                    {classData && (
                        <p className="text-sm text-gray-500">Lớp: {classData.name}</p>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="teacherId">
                                Giáo viên <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.teacherId}
                                onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giáo viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher: any) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.user?.fullName || teacher.fullName} - {teacher.user?.email || teacher.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="semester">
                                    Học kỳ <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.semester}
                                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Học kỳ 1</SelectItem>
                                        <SelectItem value="2">Học kỳ 2</SelectItem>
                                        <SelectItem value="3">Học kỳ 3 (Hè)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="academicYear">
                                    Năm học <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="academicYear"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    placeholder="2024-2025"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="startDate">
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="endDate">Ngày kết thúc</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Ghi chú (nếu có)"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                handleReset();
                                onOpenChange(false);
                            }}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang phân công...' : 'Phân công'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

