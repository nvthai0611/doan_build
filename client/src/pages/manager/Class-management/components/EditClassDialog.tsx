        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { ClassType } from '../../../../services/center-owner/class-management/class.types';

interface EditClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (id: string, data: any) => void;
    classData: ClassType | null;
    subjects?: any[];
    rooms?: any[];
    isLoading?: boolean;
}

export const EditClassDialog = ({ open, onOpenChange, onSubmit, classData, subjects = [], rooms = [], isLoading }: EditClassDialogProps) => {
    const [formData, setFormData] = useState({
        name: '',
        subjectId: '',
        grade: '',
        maxStudents: '',
        roomId: '',
        description: '',
        status: ''
    });

    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name || '',
                subjectId: classData.subjectId || '',
                grade: classData.grade || '',
                maxStudents: classData.maxStudents?.toString() || '',
                roomId: classData.roomId || '',
                description: classData.description || '',
                status: classData.status || 'draft'
            });
        }
    }, [classData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (classData) {
            onSubmit(classData.id, {
                ...formData,
                maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tên lớp <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Môn học <span className="text-red-500">*</span></Label>
                                <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s: any) => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Khối</Label>
                                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                                    <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        {[6, 7, 8, 9].map((g) => (
                                            <SelectItem key={g} value={g.toString()}>Lớp {g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Sĩ số tối đa</Label>
                                <Input
                                    type="number"
                                    value={formData.maxStudents}
                                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                    min="1"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Phòng học</Label>
                                <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
                                    <SelectTrigger><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        {rooms.map((r: any) => (
                                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Trạng thái</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Mô tả</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

