import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '../../../../services/center-owner/enrollment/enrollment.service';

export const useEnrollmentMutations = () => {
    const queryClient = useQueryClient();

    const enrollStudent = useMutation({
        mutationFn: enrollmentService.enrollStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classStats'] });
            console.log('Đăng ký học sinh thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const bulkEnroll = useMutation({
        mutationFn: enrollmentService.bulkEnroll,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classStats'] });
            console.log(data.message || 'Đăng ký học sinh thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const updateStatus = useMutation({
        mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: any }) =>
            enrollmentService.updateStatus(enrollmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classStats'] });
            console.log('Cập nhật trạng thái thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const transferStudent = useMutation({
        mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: any }) =>
            enrollmentService.transferStudent(enrollmentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classStats'] });
            console.log('Chuyển lớp thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const deleteEnrollment = useMutation({
        mutationFn: enrollmentService.deleteEnrollment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
            queryClient.invalidateQueries({ queryKey: ['class'] });
            queryClient.invalidateQueries({ queryKey: ['classStats'] });
            console.log('Xóa đăng ký thành công');
        },
        onError: (error: any) => {
            console.error('Error:', error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    return {
        enrollStudent,
        bulkEnroll,
        updateStatus,
        transferStudent,
        deleteEnrollment
    };
};

