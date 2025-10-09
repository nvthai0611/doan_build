import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { ClassType } from '../../../../services/center-owner/class-management/class.types';

interface ClassTableProps {
    classes: ClassType[];
    onEdit: (classItem: ClassType) => void;
    onDelete: (classItem: ClassType) => void;
    onView: (classItem: ClassType) => void;
    onAssignTeacher: (classItem: ClassType) => void;
    isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
        draft: { variant: 'secondary', label: 'Nháp' },
        active: { variant: 'default', label: 'Hoạt động' },
        completed: { variant: 'outline', label: 'Hoàn thành' },
        deleted: { variant: 'destructive', label: 'Đã xóa' }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const ClassTable = ({ classes, onEdit, onDelete, onView, onAssignTeacher, isLoading }: ClassTableProps) => {
    if (isLoading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    if (!classes || classes.length === 0) {
        return <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>;
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên lớp</TableHead>
                        <TableHead>Môn học</TableHead>
                        <TableHead>Khối</TableHead>
                        <TableHead>Giáo viên</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Sĩ số</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                            <TableCell className="font-medium">{classItem.name}</TableCell>
                            <TableCell>{classItem.subjectName}</TableCell>
                            <TableCell>{classItem.grade ? `Lớp ${classItem.grade}` : '-'}</TableCell>
                            <TableCell>
                                {classItem.teachers && classItem.teachers.length > 0
                                    ? classItem.teachers[0].name
                                    : '-'}
                            </TableCell>
                            <TableCell>{classItem.roomName || '-'}</TableCell>
                            <TableCell>
                                <span className={classItem.currentStudents >= (classItem.maxStudents || 0) ? 'text-red-600 font-semibold' : ''}>
                                    {classItem.currentStudents}/{classItem.maxStudents || '∞'}
                                </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView(classItem)}
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onAssignTeacher(classItem)}
                                        title="Phân công giáo viên"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(classItem)}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(classItem)}
                                        title="Xóa"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

