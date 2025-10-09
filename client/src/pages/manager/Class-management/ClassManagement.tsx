import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {apiClient} from '../../../utils/clientAxios';

// Components
import { ClassStats } from './components/ClassStats';
import { ClassFilters } from './components/ClassFilters';
import { ClassTable } from './components/ClassTable';
import { CreateClassDialog } from './components/CreateClassDialog';
import { EditClassDialog } from './components/EditClassDialog';
import { ClassDetailDialog } from './components/ClassDetailDialog';
import { AssignTeacherDialog } from './components/AssignTeacherDialog';
import { EnrollStudentDialog } from './components/EnrollStudentDialog';

// Hooks
import { useClassesQuery } from './hooks/useClassesQuery';
import { useClassMutations } from './hooks/useClassMutations';
import { useEnrollmentMutations } from './hooks/useEnrollmentMutations';

// Types
import { ClassType } from '../../../services/center-owner/class-management/class.types';
import { EnrollmentType } from '../../../services/center-owner/enrollment/enrollment.types';

export const ClassManagement = () => {
    // States
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
    const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);

    // Queries
    const { data: classesData, isLoading: isLoadingClasses } = useClassesQuery(filters);
    
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await apiClient.get('/subjects');
            return response.data;
        }
    });

    const { data: roomsData } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await apiClient.get('/rooms');
            return response.data;
        }
    });

    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await apiClient.get('/admin-center/teachers', {
                params: { limit: 100 }
            });
            return response.data;
        }
    });

    // Mutations
    const { createClass, updateClass, deleteClass, assignTeacher } = useClassMutations();
    const { bulkEnroll } = useEnrollmentMutations();
    console.log(classesData);
    
    // Data - Extract from response structure
    const classes = classesData?.data || [];
    const meta = classesData?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };
    const subjects = subjectsData?.data || [];
    const rooms = roomsData?.data || [];
    const teachers = teachersData?.data || [];

    // Stats
    const stats = {
        totalClasses: classes.length,
        activeClasses: classes.filter((c: any) => c.status === 'active').length,
        draftClasses: classes.filter((c: any) => c.status === 'draft').length,
        completedClasses: classes.filter((c: any) => c.status === 'completed').length
    };

    // Handlers
    const handleFilterChange = (newFilters: any) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    const handleCreateClass = (data: any) => {
        createClass.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
            }
        });
    };

    const handleUpdateClass = (id: string, data: any) => {
        updateClass.mutate(
            { id, data },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedClass(null);
                }
            }
        );
    };

    const handleDeleteClass = (classItem: any) => {
        if (window.confirm(`Bạn có chắc muốn xóa lớp "${classItem?.name}"?`)) {
            deleteClass.mutate(classItem?.id);
        }
    };

    const handleEdit = (classItem: any) => {
        setSelectedClass(classItem);
        setIsEditDialogOpen(true);
    };

    const handleView = (classItem: any) => {
        setSelectedClass(classItem);
        setIsDetailDialogOpen(true);
    };

    const handleAssignTeacher = (classItem: any) => {
        setSelectedClass(classItem);
        setIsAssignTeacherDialogOpen(true);
    };

    const handleAssignTeacherSubmit = (data: any) => {
        if (selectedClass) {
            assignTeacher.mutate(
                { classId: selectedClass?.id, data },
                {
                    onSuccess: () => {
                        setIsAssignTeacherDialogOpen(false);
                        setSelectedClass(null);
                    }
                }
            );
        }
    };

    const handleEnrollStudent = (studentIds: string[]) => {
        if (selectedClass) {
            bulkEnroll.mutate(
                {
                    studentIds,
                    classId: selectedClass?.id
                },
                {
                    onSuccess: () => {
                        setIsEnrollStudentDialogOpen(false);
                    }
                }
            );
        }
    };

    const handleOpenEnrollDialog = () => {
        setIsEnrollStudentDialogOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý lớp học</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý thông tin lớp học, phân công giáo viên và đăng ký học sinh
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo lớp mới
                </Button>
            </div>

            {/* Stats */}
            <ClassStats
                totalClasses={stats.totalClasses}
                activeClasses={stats.activeClasses}
                draftClasses={stats.draftClasses}
                completedClasses={stats.completedClasses}
            />

            {/* Filters */}
            <Card className="p-6">
                <ClassFilters
                    onFilterChange={handleFilterChange}
                    subjects={subjects}
                    teachers={teachers}
                />
            </Card>

            {/* Table */}
            <Card className="p-6">
                <ClassTable
                    classes={classes}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClass}
                    onView={handleView}
                    onAssignTeacher={handleAssignTeacher}
                    isLoading={isLoadingClasses}
                />

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                            Hiển thị {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} / {meta.total}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(meta.page - 1)}
                                disabled={meta.page === 1}
                            >
                                Trước
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    Trang {meta.page} / {meta.totalPages}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(meta.page + 1)}
                                disabled={meta.page === meta.totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Dialogs */}
            <CreateClassDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreateClass}
                subjects={subjects}
                rooms={rooms}
                isLoading={createClass.isPending}
            />

            <EditClassDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSubmit={handleUpdateClass}
                classData={selectedClass}
                subjects={subjects}
                rooms={rooms}
                isLoading={updateClass.isPending}
            />

            <ClassDetailDialog
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
                classId={selectedClass?.id || null}
                onEnrollStudent={handleOpenEnrollDialog}
            />

            <AssignTeacherDialog
                open={isAssignTeacherDialogOpen}
                onOpenChange={setIsAssignTeacherDialogOpen}
                onSubmit={handleAssignTeacherSubmit}
                teachers={teachers}
                classData={selectedClass}
                isLoading={assignTeacher.isPending}
            />

            <EnrollStudentDialog
                open={isEnrollStudentDialogOpen}
                onOpenChange={setIsEnrollStudentDialogOpen}
                onSubmit={handleEnrollStudent}
                classData={selectedClass}
                isLoading={bulkEnroll.isPending}
            />
        </div>
    );
};

export default ClassManagement;

