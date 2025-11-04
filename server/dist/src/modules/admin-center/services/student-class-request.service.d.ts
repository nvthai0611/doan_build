import { PrismaService } from '../../../db/prisma.service';
import { AlertService } from './alert.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class StudentClassRequestService {
    private readonly prisma;
    private readonly alertService;
    private readonly emailNotificationService;
    constructor(prisma: PrismaService, alertService: AlertService, emailNotificationService: EmailNotificationService);
    getAllRequests(filters?: {
        status?: string;
        classId?: string;
        studentId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string;
            classId: string;
            message: string;
            status: string;
            createdAt: string;
            processedAt: string;
            commitmentImageUrl: string;
            student: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
            };
            parent: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
            };
            class: {
                id: string;
                name: string;
                subject: string;
                teacher: {
                    id: string;
                    fullName: string;
                };
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            pendingCount: number;
        };
        message: string;
    }>;
    approveRequest(requestId: string, overrideCapacity?: boolean): Promise<{
        success: boolean;
        data: {
            request: {
                id: string;
                status: string;
                processedAt: string;
            };
            enrollment: {
                id: bigint;
                studentId: string;
                classId: string;
                status: string;
                enrolledAt: string;
            };
            contractUpload: {
                id: any;
                contractType: any;
                uploadedImageUrl: any;
                uploadedAt: any;
            };
        };
        message: string;
    }>;
    rejectRequest(requestId: string, reason?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            status: string;
            processedAt: string;
        };
        message: string;
    }>;
    getRequestById(requestId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string;
            classId: string;
            message: string;
            status: string;
            createdAt: string;
            processedAt: string;
            commitmentImageUrl: string;
            student: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                birthDate: string;
            };
            parent: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
            };
            class: {
                id: string;
                name: string;
                subject: string;
                maxStudents: number;
                currentStudents: number;
                teacher: {
                    id: string;
                    fullName: string;
                    email: string;
                };
            };
        };
        message: string;
    }>;
}
