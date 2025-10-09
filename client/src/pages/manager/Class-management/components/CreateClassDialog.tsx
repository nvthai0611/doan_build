import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface CreateClassDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    subjects?: any[];
    rooms?: any[];
    isLoading?: boolean;
}

export const CreateClassDialog = ({ open, onOpenChange, onSubmit, subjects = [], rooms = [], isLoading }: CreateClassDialogProps) => {
    const [formData, setFormData] = useState({
        name: '',
        subjectId: '',
        grade: '',
        maxStudents: '',
        roomId: '',
        description: '',
        status: 'draft'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : undefined
        });
        handleReset();
    };

    const handleReset = () => {
        setFormData({
            name: '',
            subjectId: '',
            grade: '',
            maxStudents: '',
            roomId: '',
            description: '',
            status: 'draft'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo lớp học mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Tên lớp <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên lớp học"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="subjectId">
                                    Môn học <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.subjectId}
                                    onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn môn học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject: any) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="grade">Khối</Label>
                                <Select
                                    value={formData.grade}
                                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khối" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        <SelectItem value="6">Lớp 6</SelectItem>
                                        <SelectItem value="7">Lớp 7</SelectItem>
                                        <SelectItem value="8">Lớp 8</SelectItem>
                                        <SelectItem value="9">Lớp 9</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="maxStudents">Sĩ số tối đa</Label>
                                <Input
                                    id="maxStudents"
                                    type="number"
                                    value={formData.maxStudents}
                                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                    placeholder="Nhập số học sinh tối đa"
                                    min="1"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="roomId">Phòng học</Label>
                                <Select
                                    value={formData.roomId}
                                    onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn phòng học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Không chọn</SelectItem>
                                        {rooms.map((room: any) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả về lớp học"
                                rows={3}
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
                            {isLoading ? 'Đang tạo...' : 'Tạo lớp'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

