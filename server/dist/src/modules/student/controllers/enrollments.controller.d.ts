import { EnrollmentsService } from '../services/enrollments.service';
export declare class EnrollmentsController {
    private readonly enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    getMyEnrollments(req: any): Promise<{
        data: {
            class: {
                teacher: {
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
                } & {
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    schoolId: string | null;
                    teacherCode: string;
                    subjects: string[];
                };
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
                room: {
                    createdAt: Date;
                    isActive: boolean;
                    id: string;
                    name: string;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
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
            };
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
        }[];
        message: string;
    }>;
}
