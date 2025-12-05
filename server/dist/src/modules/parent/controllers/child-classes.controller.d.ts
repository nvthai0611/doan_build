import { StudentLeaveRequestService } from '../services/student-leave-request.service';
export declare class ChildClassesController {
    private readonly studentLeaveRequestService;
    constructor(studentLeaveRequestService: StudentLeaveRequestService);
    getAllChildrenClasses(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            room: {
                name: string;
                createdAt: Date;
                id: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
            };
            sessions: {
                status: string;
                id: string;
                sessionDate: Date;
                startTime: string;
                endTime: string;
            }[];
            student: {
                id: string;
                user: {
                    fullName: string;
                    email: string;
                };
            };
        }[];
        message: string;
    }>;
    getChildClasses(req: any, studentId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
}
