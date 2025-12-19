import { StudentClassRequestService } from '../services/student-class-request.service';
import { GetStudentClassRequestsDto, RejectRequestDto } from '../dto/student-class-request.dto';
export declare class StudentClassRequestController {
    private readonly studentClassRequestService;
    constructor(studentClassRequestService: StudentClassRequestService);
    getAllRequests(query: GetStudentClassRequestsDto): Promise<{
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
    getRequestById(id: string): Promise<{
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
    approveRequest(id: string, body?: {
        overrideCapacity?: boolean;
    }): Promise<{
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
    rejectRequest(id: string, dto: RejectRequestDto): Promise<{
        success: boolean;
        data: {
            id: string;
            status: string;
            processedAt: string;
        };
        message: string;
    }>;
}
