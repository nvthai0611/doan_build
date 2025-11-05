import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { toast } from 'sonner';

export const useClassMutations = () => {
    const queryClient = useQueryClient();

    const createClass = useMutation({
        mutationFn: classService.createClass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            console.log('Tạo lớp học thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.message || 'Có lỗi xảy ra');
        }
    });

    const updateClass = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            classService.updateClass(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            console.log('Cập nhật lớp học thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.message || 'Có lỗi xảy ra');
        }
    });

    const updateClassSchedule = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            classService.updateClassSchedule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classSchedules'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            console.log('Cập nhật lịch học thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.message || 'Có lỗi xảy ra');
        }
    });


    const deleteClass = useMutation({
        mutationFn: classService.deleteClass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            console.log('Xóa lớp học thành công');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Có lỗi xảy ra');
            console.error('Error:', error?.message || 'Có lỗi xảy ra');
        }
    });
    
    const assignTeacher = useMutation({
        mutationFn: ({ classId, data }: { classId: string; data: any }) =>
            classService.assignTeacher(classId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classTeachers'] });
            console.log('Phân công giáo viên thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.message || 'Có lỗi xảy ra');
        }
    });

    const removeTeacher = useMutation({
        mutationFn: ({ classId, teacherId }: { classId: string; teacherId: string }) =>
            classService.removeTeacher(classId, teacherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classTeachers'] });
            console.log('Xóa phân công giáo viên thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.message || 'Có lỗi xảy ra');
        }
    });

    return {
        createClass,
        updateClass,
        updateClassSchedule,
        deleteClass,
        assignTeacher,
        removeTeacher
    };
};

