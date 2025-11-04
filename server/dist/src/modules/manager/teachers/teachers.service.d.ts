import { PrismaService } from '../../../db/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTeacherDto: CreateTeacherDto): Promise<string>;
    findAll(): Promise<{
        success: boolean;
        data: ({
            user: {
                role: string;
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
            };
            _count: {
                leaveRequests: number;
                classes: number;
                contracts: number;
                payrolls: number;
                documents: number;
            };
            leaveRequests: {
                createdAt: Date;
                id: string;
                status: string;
                startDate: Date;
                reason: string;
                endDate: Date;
                approvedAt: Date;
                requestType: string;
            }[];
            classes: ({
                subject: {
                    id: string;
                    name: string;
                    description: string;
                    code: string;
                };
                room: {
                    isActive: boolean;
                    id: string;
                    name: string;
                    capacity: number;
                    equipment: import("@prisma/client/runtime/library").JsonValue;
                };
                _count: {
                    sessions: number;
                    enrollments: number;
                    assessments: number;
                };
                enrollments: {
                    student: {
                        user: {
                            email: string;
                            fullName: string;
                            phone: string;
                        };
                        grade: string;
                        id: string;
                        studentCode: string;
                    };
                    id: bigint;
                    status: string;
                    enrolledAt: Date;
                }[];
            } & {
                academicYear: string | null;
                password: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                name: string;
                description: string | null;
                subjectId: string;
                gradeId: string | null;
                maxStudents: number | null;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeStructureId: string | null;
                classCode: string | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            })[];
            contracts: {
                createdAt: Date;
                id: bigint;
                status: string;
                startDate: Date;
                endDate: Date;
                terms: import("@prisma/client/runtime/library").JsonValue;
                salary: import("@prisma/client/runtime/library").Decimal;
            }[];
            payrolls: {
                id: bigint;
                status: string;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date;
                periodStart: Date;
                periodEnd: Date;
                baseSalary: import("@prisma/client/runtime/library").Decimal;
                bonuses: import("@prisma/client/runtime/library").Decimal;
                deductions: import("@prisma/client/runtime/library").Decimal;
                hourlyRate: import("@prisma/client/runtime/library").Decimal;
                teachingHours: import("@prisma/client/runtime/library").Decimal;
            }[];
            documents: {
                id: bigint;
                uploadedAt: Date;
                docType: string;
                docUrl: string;
            }[];
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        })[];
        total: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        data: any[];
        total: number;
        message: string;
        error: any;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            user: {
                role: string;
                email: string;
                createdAt: Date;
                fullName: string;
                isActive: boolean;
                phone: string;
                updatedAt: Date;
                username: string;
                id: string;
            };
            _count: {
                leaveRequests: number;
                classes: number;
                contracts: number;
                payrolls: number;
                documents: number;
            };
            leaveRequests: {
                createdAt: Date;
                id: string;
                status: string;
                startDate: Date;
                reason: string;
                endDate: Date;
                approvedAt: Date;
                requestType: string;
            }[];
            classes: ({
                subject: {
                    id: string;
                    name: string;
                    description: string;
                    code: string;
                };
                room: {
                    isActive: boolean;
                    id: string;
                    name: string;
                    capacity: number;
                    equipment: import("@prisma/client/runtime/library").JsonValue;
                };
                _count: {
                    sessions: number;
                    enrollments: number;
                    assessments: number;
                };
                enrollments: {
                    student: {
                        user: {
                            email: string;
                            fullName: string;
                            phone: string;
                        };
                        grade: string;
                        id: string;
                        studentCode: string;
                    };
                    id: bigint;
                    status: string;
                    enrolledAt: Date;
                }[];
            } & {
                academicYear: string | null;
                password: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                name: string;
                description: string | null;
                subjectId: string;
                gradeId: string | null;
                maxStudents: number | null;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeStructureId: string | null;
                classCode: string | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            })[];
            contracts: {
                createdAt: Date;
                id: bigint;
                status: string;
                startDate: Date;
                endDate: Date;
                terms: import("@prisma/client/runtime/library").JsonValue;
                salary: import("@prisma/client/runtime/library").Decimal;
            }[];
            payrolls: {
                id: bigint;
                status: string;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                paidAt: Date;
                periodStart: Date;
                periodEnd: Date;
                baseSalary: import("@prisma/client/runtime/library").Decimal;
                bonuses: import("@prisma/client/runtime/library").Decimal;
                deductions: import("@prisma/client/runtime/library").Decimal;
                hourlyRate: import("@prisma/client/runtime/library").Decimal;
                teachingHours: import("@prisma/client/runtime/library").Decimal;
            }[];
            documents: {
                id: bigint;
                uploadedAt: Date;
                docType: string;
                docUrl: string;
            }[];
        } & {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            schoolId: string | null;
            teacherCode: string;
            subjects: string[];
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        data: any;
        message: string;
        error: any;
    }>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<string>;
    remove(id: string): Promise<string>;
    getTeacherContracts(teacherId: string): Promise<{
        id: string;
        parentId: string | null;
        teacherId: string | null;
        status: string | null;
        startDate: Date | null;
        studentId: string | null;
        note: string | null;
        enrollmentId: bigint | null;
        uploadedAt: Date;
        contractType: string;
        subjectIds: string[];
        uploadedImageUrl: string;
        uploadedImageName: string | null;
        expiredAt: Date | null;
    }[]>;
    deleteTeacherContract(teacherId: string, contractId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
