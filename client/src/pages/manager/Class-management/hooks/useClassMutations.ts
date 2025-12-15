import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { toast } from 'sonner';

export const useClassMutations = () => {
    const queryClient = useQueryClient();
    const getErrorMessage = (error: any) =>
        error?.response?.data?.message ||
        error?.response?.message ||
        error?.message ||
        'Không thể thực hiện hành động';

    const createClass = useMutation({
        mutationFn: classService.createClass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            toast.success('Tạo lớp học thành công');
        },
        onError: (error: any) => {
            
            const message = getErrorMessage(error);
            toast.error(message);
            console.error('Error:', message);
        }
    });

    const updateClass = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            classService.updateClass(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            toast.success('Cập nhật lớp học thành công');
        },
        onError: (error: any) => {
            console.log(error);
            
            const message = getErrorMessage(error);
            toast.error(message);
            console.error('Error:', message);
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
            console.error('Error:', error?.response?.message || 'Không thể cập nhật lịch học');
        }
    });


    const deleteClass = useMutation({
        mutationFn: classService.deleteClass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            console.log('Xóa lớp học thành công');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Không thể xóa lớp học');
            console.error('Error:', error?.message || 'Không thể xóa lớp học');
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
            console.error('Error:', error?.message || 'Không thể phân công giáo viên');
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
            console.error('Error:', error?.message || 'Không thể xóa phân công giáo viên');
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

