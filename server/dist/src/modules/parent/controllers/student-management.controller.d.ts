import { StudentManagementService } from '../services/student-management.service';
export declare class StudentManagementController {
    private readonly service;
    constructor(service: StudentManagementService);
    getChildren(req: any, query: any): Promise<{
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
    getChildDetail(req: any, childId: string): Promise<{
        data: any;
        message: string;
    }>;
    getChildMetrics(req: any, childId: string): Promise<{
        data: {
            averageGrade: number;
            classRank: number;
            totalStudents: number;
            attendanceRate: number;
        };
        message: string;
    }>;
    getChildSchedule(req: any, childId: string, startDate?: string, endDate?: string): Promise<{
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
    getChildGrades(req: any, childId: string, classId?: string): Promise<{
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
    getChildAttendance(req: any, childId: string, classId?: string, startDate?: string, endDate?: string): Promise<{
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
    getClassRanking(req: any, childId: string, classId: string): Promise<{
        data: {
            rank: number;
            totalStudents: number;
            averageScore: number;
        };
        message: string;
    }>;
}
