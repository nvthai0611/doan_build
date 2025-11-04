import { PrismaService } from "src/db/prisma.service";
export declare class CommonService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getListStudentOfClass(classId: string, teacherId: string): Promise<{
        success: boolean;
        data: ({
            student: {
                user: {
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                    id: string;
                    gender: import(".prisma/client").$Enums.Gender;
                    birthDate: Date;
                };
                school: {
                    id: string;
                    name: string;
                };
                grades: {
                    assessment: {
                        id: string;
                        name: string;
                        type: string;
                        date: Date;
                    };
                    id: bigint;
                    score: import("@prisma/client/runtime/library").Decimal;
                }[];
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            class: {
                teacher: {
                    user: {
                        email: string;
                        fullName: string;
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
                    code: string;
                };
                grade: {
                    level: number;
                    id: string;
                    name: string;
                };
                academicYear: string;
                id: string;
                name: string;
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
        message: string;
    }>;
    getClassSessionsByAssignment(classId: string, academicYear?: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            room: {
                name: string;
            };
            id: string;
            status: string;
            sessionDate: Date;
            startTime: string;
            endTime: string;
        }[];
        message: string;
    }>;
    getDetailStudentOfClass(studentId: string, classId?: string, teacherId?: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            student: {
                parent: {
                    user: {
                        email: string;
                        fullName: string;
                        phone: string;
                    };
                } & {
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    relationshipType: string | null;
                };
                user: {
                    email: string;
                    createdAt: Date;
                    fullName: string;
                    avatar: string;
                    phone: string;
                    id: string;
                    gender: import(".prisma/client").$Enums.Gender;
                    birthDate: Date;
                };
                school: {
                    phone: string;
                    id: string;
                    name: string;
                    address: string;
                };
                grades: ({
                    assessment: {
                        id: string;
                        name: string;
                        type: string;
                        date: Date;
                        maxScore: import("@prisma/client/runtime/library").Decimal;
                    };
                } & {
                    id: bigint;
                    studentId: string;
                    assessmentId: string;
                    score: import("@prisma/client/runtime/library").Decimal | null;
                    feedback: string | null;
                    gradedBy: string;
                    gradedAt: Date;
                })[];
                attendances: ({
                    session: {
                        id: string;
                        status: string;
                        sessionDate: Date;
                        startTime: string;
                        endTime: string;
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
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            class: {
                teacher: {
                    user: {
                        email: string;
                        fullName: string;
                        phone: string;
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
                    description: string;
                    code: string;
                };
                grade: {
                    level: number;
                    id: string;
                    name: string;
                };
                academicYear: string;
                id: string;
                name: string;
                description: string;
                expectedStartDate: Date;
                actualStartDate: Date;
                actualEndDate: Date;
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
        };
        message: string;
    }>;
    getClassStatistics(classId: string, teacherId: string): Promise<{
        success: boolean;
        data: {
            totalStudents: number;
            attendanceStats: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.StudentSessionAttendanceGroupByOutputType, "status"[]> & {
                _count: {
                    status: number;
                };
            })[];
            gradeStats: import(".prisma/client").Prisma.GetStudentAssessmentGradeAggregateType<{
                where: {
                    student: {
                        user: {
                            isActive: true;
                        };
                        enrollments: {
                            some: {
                                classId: string;
                                status: string;
                                class: {
                                    status: string;
                                    teacherId: string;
                                };
                            };
                        };
                    };
                };
                _avg: {
                    score: true;
                };
                _max: {
                    score: true;
                };
                _min: {
                    score: true;
                };
            }>;
        };
        message: string;
    }>;
    getTeacherInfo(teacherId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                email: string;
                fullName: string;
            };
            classes: ({
                subject: {
                    id: string;
                    name: string;
                };
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
    }>;
}
