import { PrismaService } from 'src/db/prisma.service';
interface GetChildrenQuery {
    search?: string;
    grade?: string;
    schoolId?: string;
    enrollmentStatus?: 'enrolled' | 'not_enrolled' | 'all';
    page?: number;
    limit?: number;
}
export declare class StudentManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getChildrenForParent(userId: string, query?: GetChildrenQuery): Promise<{
        data: any[];
        message: string;
        meta?: undefined;
    } | {
        data: {
            id: string;
            userId: string;
            studentCode: string;
            dateOfBirth: string;
            gender: import(".prisma/client").$Enums.Gender;
            address: string;
            grade: string;
            school: {
                id: string;
                name: string;
                address: string;
                phone: string;
            };
            user: {
                id: string;
                fullName: string;
                email: string;
                avatar: string;
                phone: string;
            };
            enrollments: {
                id: string;
                classId: any;
                status: any;
                enrolledAt: any;
                class: {
                    id: any;
                    name: any;
                    subject: {
                        id: any;
                        name: any;
                    };
                    teacher: {
                        id: any;
                        user: {
                            fullName: any;
                        };
                    };
                };
            }[];
        }[];
        message: string;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getChildDetailForParent(userId: string, childId: string): Promise<{
        data: any;
        message: string;
    }>;
    getChildMetricsForParent(userId: string, childId: string): Promise<{
        data: {
            averageGrade: number;
            classRank: number;
            totalStudents: number;
            attendanceRate: number;
        };
        message: string;
    }>;
    getChildScheduleForParent(userId: string, childId: string, startDate?: string, endDate?: string): Promise<{
        data: {
            id: string;
            classId: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            room: {
                id: string;
                name: string;
                capacity: number;
            };
            status: string;
            teacher: {
                id: string;
                fullName: string;
            };
            substituteTeacher: {
                id: string;
                fullName: string;
            };
            substituteEndDate: string;
            class: {
                id: string;
                name: string;
                subject: {
                    id: string;
                    name: string;
                };
                teacher: {
                    id: string;
                    fullName: string;
                };
                maxStudents: number;
                currentStudents: number;
            };
        }[];
        message: string;
    }>;
    getChildGradesForParent(userId: string, childId: string, classId?: string): Promise<{
        data: {
            id: string;
            subject: string;
            examName: string;
            date: string;
            score: number;
            maxScore: number;
            status: string;
            teacher: string;
            feedback: string;
            gradedAt: string;
            assessmentType: string;
            className: string;
            classId: string;
        }[];
        message: string;
    }>;
    getChildAttendanceForParent(userId: string, childId: string, filters?: {
        classId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            sessionId: string;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            status: string;
            attendanceStatus: string;
            attendanceRecordedAt: Date;
            attendanceRecordedBy: string;
            attendanceNote: string;
            room: {
                name: string;
            };
            class: {
                name: string;
                subject: {
                    name: string;
                };
            };
            teacher: string;
        }[];
        message: string;
    }>;
    getClassRankingForParent(userId: string, childId: string, classId: string): Promise<{
        data: {
            rank: number;
            totalStudents: number;
            averageScore: number;
        };
        message: string;
    }>;
}
export {};
