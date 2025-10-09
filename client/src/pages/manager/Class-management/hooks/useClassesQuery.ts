import { useQuery } from '@tanstack/react-query';
import { classService } from '../../../../services/center-owner/class-management/class.service';

export const useClassesQuery = (filters: any) => {
    return useQuery({
        queryKey: ['classes', filters],
        queryFn: () => classService.getClasses(filters),
        staleTime: 30000,
        refetchOnWindowFocus: false
    });
};

export const useClassQuery = (classId: string) => {
    return useQuery({
        queryKey: ['class', classId],
        queryFn: () => classService.getClassById(classId),
        enabled: !!classId,
        staleTime: 30000
    });
};

export const useClassStatsQuery = (classId: string) => {
    return useQuery({
        queryKey: ['classStats', classId],
        queryFn: () => classService.getClassStats(classId),
        enabled: !!classId,
        staleTime: 30000
    });
};

export const useTeachersByClassQuery = (classId: string) => {
    return useQuery({
        queryKey: ['classTeachers', classId],
        queryFn: () => classService.getTeachersByClass(classId),
        enabled: !!classId,
        staleTime: 30000
    });
};

