import { useQuery } from '@tanstack/react-query';
import { classService } from '../../../../services/center-owner/class-management/class.service';

export const useClassesQuery = (filters: any) => {
    const data = useQuery({
        queryKey: ['classes', filters],
        queryFn: () => classService.getClasses(filters),
        staleTime: 0, // Cache for 30 seconds
        refetchOnWindowFocus: true, // Disable refetch on window focus to reduce API calls
        retry: 1 // Only retry once on failure
    });
    return data;
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

