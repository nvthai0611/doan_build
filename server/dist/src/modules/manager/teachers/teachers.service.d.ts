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
                fullName: string;
                username: string;
                email: string;
                phone: string;
                createdAt: Date;
                role: string;
                id: string;
                updatedAt: Date;
                isActive: boolean;
            };
            _count: {
                leaveRequests: number;
                classes: number;
                contracts: number;
                payrolls: number;
                documents: number;
            };
            leaveRequests: {
                status: string;
                startDate: Date;
                endDate: Date;
                createdAt: Date;
                id: string;
                requestType: string;
                reason: string;
                approvedAt: Date;
            }[];
            classes: ({
                subject: {
                    name: string;
                    description: string;
                    id: string;
                    code: string;
                };
                room: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    capacity: number;
                    equipment: import("@prisma/client/runtime/library").JsonValue;
                };
                _count: {
                    sessions: number;
                    enrollments: number;
                    assessments: number;
                };
                enrollments: {
                    status: string;
                    student: {
                        user: {
                            fullName: string;
                            email: string;
                            phone: string;
                        };
                        grade: string;
                        id: string;
                        studentCode: string;
                    };
                    id: bigint;
                    enrolledAt: Date;
                }[];
            } & {
                name: string;
                description: string | null;
                password: string | null;
                status: string;
                gradeId: string | null;
                subjectId: string;
                roomId: string | null;
                teacherId: string | null;
                feeStructureId: string | null;
                createdAt: Date;
                academicYear: string | null;
                id: string;
                updatedAt: Date;
                classCode: string | null;
                maxStudents: number | null;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            })[];
            contracts: {
                status: string;
                startDate: Date;
                endDate: Date;
                createdAt: Date;
                id: bigint;
                salary: import("@prisma/client/runtime/library").Decimal;
                terms: import("@prisma/client/runtime/library").JsonValue;
            }[];
            payrolls: {
                status: string;
                id: bigint;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                periodStart: Date;
                periodEnd: Date;
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
            id: string;
            updatedAt: Date;
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
                fullName: string;
                username: string;
                email: string;
                phone: string;
                createdAt: Date;
                role: string;
                id: string;
                updatedAt: Date;
                isActive: boolean;
            };
            _count: {
                leaveRequests: number;
                classes: number;
                contracts: number;
                payrolls: number;
                documents: number;
            };
            leaveRequests: {
                status: string;
                startDate: Date;
                endDate: Date;
                createdAt: Date;
                id: string;
                requestType: string;
                reason: string;
                approvedAt: Date;
            }[];
            classes: ({
                subject: {
                    name: string;
                    description: string;
                    id: string;
                    code: string;
                };
                room: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    capacity: number;
                    equipment: import("@prisma/client/runtime/library").JsonValue;
                };
                _count: {
                    sessions: number;
                    enrollments: number;
                    assessments: number;
                };
                enrollments: {
                    status: string;
                    student: {
                        user: {
                            fullName: string;
                            email: string;
                            phone: string;
                        };
                        grade: string;
                        id: string;
                        studentCode: string;
                    };
                    id: bigint;
                    enrolledAt: Date;
                }[];
            } & {
                name: string;
                description: string | null;
                password: string | null;
                status: string;
                gradeId: string | null;
                subjectId: string;
                roomId: string | null;
                teacherId: string | null;
                feeStructureId: string | null;
                createdAt: Date;
                academicYear: string | null;
                id: string;
                updatedAt: Date;
                classCode: string | null;
                maxStudents: number | null;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            })[];
            contracts: {
                status: string;
                startDate: Date;
                endDate: Date;
                createdAt: Date;
                id: bigint;
                salary: import("@prisma/client/runtime/library").Decimal;
                terms: import("@prisma/client/runtime/library").JsonValue;
            }[];
            payrolls: {
                status: string;
                id: bigint;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                periodStart: Date;
                periodEnd: Date;
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
            id: string;
            updatedAt: Date;
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
        contractType: string;
        uploadedImageUrl: string;
        uploadedImageName: string;
        uploadedAt: Date;
        startDate: Date;
        expiryDate: Date;
        teacherSalaryPercent: import("@prisma/client/runtime/library").Decimal;
        notes: string;
        status: string;
    }[]>;
    deleteTeacherContract(teacherId: string, contractId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
