import { ClassJoinService } from '../services/class-join.service';
import { JoinClassByCodeDto, RequestJoinClassDto } from '../dto/request/join-class.dto';
export declare class ClassJoinController {
    private readonly classJoinService;
    constructor(classJoinService: ClassJoinService);
    getClassInfo(req: any, dto: JoinClassByCodeDto): Promise<{
        success: boolean;
        data: {
            id: any;
            name: any;
            classCode: any;
            description: any;
            status: any;
            requirePassword: boolean;
            subject: {
                id: any;
                name: any;
                code: any;
            };
            grade: {
                id: any;
                name: any;
                level: any;
            };
            teacher: {
                id: any;
                userId: any;
                fullName: any;
                avatar: any;
                phone: any;
                email: any;
            };
            expectedStartDate: any;
            actualStartDate: any;
            actualEndDate: any;
            maxStudents: any;
            currentStudents: any;
            recurringSchedule: any;
            scheduleText: string;
            feeStructure: {
                id: any;
                name: any;
                amount: number;
                period: any;
            };
            feeAmount: number;
            feePeriod: any;
            feeCurrency: any;
            academicYear: any;
        };
        message: string;
    }>;
    requestJoinClass(req: any, dto: RequestJoinClassDto): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string;
            classId: string;
            message: string;
            status: string;
            createdAt: string;
            student: {
                id: string;
                fullName: string;
                email: string;
            };
            class: {
                id: string;
                name: string;
                subject: string;
            };
        };
        message: string;
    }>;
    getMyRequests(req: any, status?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string;
            classId: string;
            message: string;
            status: string;
            createdAt: string;
            processedAt: string;
            student: {
                id: string;
                fullName: string;
                avatar: string;
            };
            class: {
                id: string;
                name: string;
                classCode: string;
                subject: string;
                teacher: string;
            };
        }[];
        message: string;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
