import { ClassInformationService } from '../services/class-information.service';
import { PrismaService } from 'src/db/prisma.service';
export declare class ClassInformationController {
    private readonly classInfoService;
    private readonly prisma;
    constructor(classInfoService: ClassInformationService, prisma: PrismaService);
    getEnrolledSubjects(req: any): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            code: string;
        }[];
        message: string;
    }>;
    getStudentsOfClass(classId: string): Promise<{
        data: {
            id: string;
            userId: string;
            fullName: string;
            email: string;
            studentCode: string;
            enrolledAt: Date;
            status: string;
        }[];
        message: string;
    }>;
    getClassDetail(classId: string): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
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
            startDate: Date;
            endDate: Date;
            maxStudents: number;
            currentStudents: number;
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
        };
        message: string;
    }>;
    getClassSessionsForStudent(classId: string, req: any): Promise<{
        data: {
            id: string;
            classId: string;
            sessionDate: any;
            startTime: any;
            endTime: any;
            status: string;
            room: {
                id: string;
                name: string;
            };
            attendanceStatus: string;
            attendanceNote: string;
            attendanceRecordedAt: Date;
        }[];
        message: string;
    }>;
}
