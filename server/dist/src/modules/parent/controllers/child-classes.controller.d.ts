import { ClassInformationService } from '../services/class-information.service';
export declare class ChildClassesController {
    private readonly classInformationService;
    constructor(classInformationService: ClassInformationService);
    getAllChildrenClasses(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            classCode: string;
            status: string;
            progress: number;
            currentStudents: any;
            maxStudents: number;
            description: string;
            teacher: {
                id: string;
                user: {
                    fullName: string;
                    email: string;
                };
            };
            room: {
                name: string;
            };
            subject: {
                name: string;
                code: string;
            };
            grade: {
                name: string;
                level: number;
            };
            schedule: any[];
            startDate: Date;
            endDate: any;
            studentName: string;
            enrolledAt: Date;
            totalSessions: number;
            completedSessions: number;
        }[];
        message: string;
    }>;
    getChildClasses(req: any, studentId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            classCode: string;
            status: string;
            progress: number;
            currentStudents: any;
            maxStudents: number;
            description: string;
            teacher: {
                id: string;
                user: {
                    fullName: string;
                    email: string;
                };
            };
            room: {
                name: string;
            };
            subject: {
                name: string;
                code: string;
            };
            grade: {
                name: string;
                level: number;
            };
            schedule: any[];
            startDate: Date;
            endDate: any;
            studentName: string;
            enrolledAt: Date;
            totalSessions: number;
            completedSessions: number;
        }[];
        message: string;
    }>;
}
