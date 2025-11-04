import { HttpStatus } from '@nestjs/common';
import { ClassManagementService } from '../services/class-management.service';
import { ClassQueryDto } from '../dto/classes/query-class.dto';
export declare class ClassManagementController {
    private readonly classManagementService;
    constructor(classManagementService: ClassManagementService);
    getClassDetails(request: any, query: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            id: string;
            name: string;
            description: string;
            grade: {
                level: number;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
            };
            maxStudents: number;
            status: string;
            academicYear: string;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            createdAt: Date;
            updatedAt: Date;
            room: {
                createdAt: Date;
                isActive: boolean;
                id: string;
                name: string;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            };
            emrollments: ({
                student: {
                    user: {
                        email: string;
                        fullName: string;
                        avatar: string;
                        phone: string;
                        id: string;
                    };
                    studentCode: string;
                };
            } & {
                id: bigint;
                status: string;
                studentId: string;
                classId: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            })[];
            studentCount: number;
            classSession: {
                total: number;
                completed: number;
                upcoming: number;
                attendanceRate: number;
                averageAttendancePerSession: number;
                totalPresentCount: number;
                totalAbsentCount: number;
                totalExcusedCount: number;
            };
            schedule: any;
        };
        message: string;
        meta: any;
    }>;
    getClassByTeacherId(request: any, queryParams: ClassQueryDto): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            id: string;
            name: string;
            description: string;
            grade: {
                level: number;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
            };
            maxStudents: number;
            status: string;
            academicYear: string;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            createdAt: Date;
            updatedAt: Date;
            teacherName: string;
            teacherEmail: string;
            teacherId: string;
            subject: {
                id: string;
                name: string;
                description: string | null;
                code: string;
            };
            subjectId: string;
            room: {
                createdAt: Date;
                isActive: boolean;
                id: string;
                name: string;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            roomId: string;
            studentCount: number;
            feeStructure: {
                createdAt: Date;
                isActive: boolean;
                id: string;
                name: string;
                description: string | null;
                subjectId: string | null;
                gradeId: string | null;
                amount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            };
            feeStructureId: string;
            schedule: any;
            enrollmentStatus: {
                current: number;
                max: number;
                percentage: number;
                available: number;
                isFull: boolean;
                status: string;
            };
        }[];
        message: string;
        meta: {
            pagination: {
                currentPage: number;
                totalPages: number;
                totalCount: number;
                limit: number;
                hasNextPage: boolean;
                hasPrevPage: boolean;
            };
            filters: {
                search: string;
                status: string;
            };
        };
    }>;
    getCountByStatus(request: any): Promise<{
        success: boolean;
        status: HttpStatus;
        data: {
            total: number;
            active: number;
            draft: number;
            completed: number;
            cancelled: number;
            ready: number;
        };
        message: string;
        meta: any;
    }>;
    getHistoryAttendanceOfClass(classId: string, req: any): Promise<{
        success: boolean;
        message: string;
        status: HttpStatus;
        data: ({
            attendances: ({
                student: {
                    user: {
                        role: string;
                        email: string | null;
                        password: string;
                        createdAt: Date;
                        fullName: string | null;
                        isActive: boolean;
                        avatar: string | null;
                        phone: string | null;
                        roleId: string | null;
                        updatedAt: Date;
                        username: string;
                        id: string;
                        gender: import(".prisma/client").$Enums.Gender | null;
                        birthDate: Date | null;
                    };
                    id: string;
                };
            } & {
                id: bigint;
                sessionId: string;
                status: string;
                studentId: string;
                note: string | null;
                recordedBy: string;
                recordedAt: Date;
                isSent: boolean;
                sentAt: Date | null;
            })[];
        } & {
            academicYear: string;
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            status: string;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            notes: string | null;
            cancellationReason: string | null;
        })[];
    }>;
}
