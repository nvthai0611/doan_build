import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { enrollmentService } from '../../../../services/center-owner/enrollment/enrollment.service';
import { Users, BookOpen, DoorOpen, UserPlus } from 'lucide-react';

interface ClassDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: string | null;
    onEnrollStudent?: () => void;
}

export const ClassDetailDialog = ({ open, onOpenChange, classId, onEnrollStudent }: any) => {
    const { data: classDetail, isLoading } = useQuery({
        queryKey: ['class', classId],
        queryFn: () => classService.getClassById(classId!),
        enabled: !!classId && open
    });

    const { data: enrolledStudents } = useQuery({
        queryKey: ['enrollments', classId],
        queryFn: () => enrollmentService.getStudentsByClass(classId!),
        enabled: !!classId && open
    });

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px]">
                    <div className="text-center py-8">Đang tải...</div>
                </DialogContent>
            </Dialog>
        );
    }

    const classData = classDetail as any;
    const students = enrolledStudents as any[];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Chi tiết lớp học</DialogTitle>
                </DialogHeader>

                {classData && (
                    <div className="space-y-6">
                        {/* Class Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Môn học</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                        <span className="font-semibold">{classData.subjectName}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Khối</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="font-semibold">
                                        {classData.grade ? `Lớp ${classData.grade}` : 'Chưa xác định'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Phòng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <DoorOpen className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold">{classData.roomName}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Sĩ số</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <span className="font-semibold">
                                            {classData.currentStudents}/{classData.maxStudents || '∞'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for Details */}
                        <Tabs defaultValue="students" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="students">
                                    Danh sách học sinh ({students.length})
                                </TabsTrigger>
                                <TabsTrigger value="teachers">
                                    Giáo viên ({classData.teachers?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="info">Thông tin</TabsTrigger>
                            </TabsList>

                            {/* Students Tab */}
                            <TabsContent value="students" className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Danh sách học sinh</h3>
                                    {onEnrollStudent && (
                                        <Button onClick={onEnrollStudent} size="sm">
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Thêm học sinh
                                        </Button>
                                    )}
                                </div>
                                <div className="border rounded-lg">
                                    {students.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Chưa có học sinh</div>
                                    ) : (
                                        <div className="divide-y">
                                            {students.map((student: any, index: number) => (
                                                <div key={student.enrollmentId} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-gray-500 font-medium">{index + 1}</div>
                                                        <div>
                                                            <div className="font-medium">{student.fullName}</div>
                                                            <div className="text-sm text-gray-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                        {student.status === 'active' ? 'Đang học' : student.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Teachers Tab */}
                            <TabsContent value="teachers" className="space-y-4">
                                <h3 className="font-semibold">Giáo viên phụ trách</h3>
                                <div className="border rounded-lg">
                                    {!classData.teachers || classData.teachers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Chưa phân công giáo viên</div>
                                    ) : (
                                        <div className="divide-y">
                                            {classData.teachers.map((teacher: any) => (
                                                <div key={teacher.assignmentId} className="p-4">
                                                    <div className="font-medium">{teacher.name}</div>
                                                    <div className="text-sm text-gray-500">{teacher.email}</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {teacher.semester} - {teacher.academicYear}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Info Tab */}
                            <TabsContent value="info" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tên lớp</label>
                                        <div className="mt-1 text-lg font-semibold">{classData.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                                        <div className="mt-1">
                                            <Badge>{classData.status}</Badge>
                                        </div>
                                    </div>
                                    {classData.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Mô tả</label>
                                            <div className="mt-1 text-gray-700">{classData.description}</div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

