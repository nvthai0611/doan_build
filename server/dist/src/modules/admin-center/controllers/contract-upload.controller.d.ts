import { ContractUploadService } from '../services/contract-upload.service';
export declare class ContractUploadController {
    private readonly contractUploadService;
    constructor(contractUploadService: ContractUploadService);
    getByStudentId(studentId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string | null;
            status: string | null;
            parentId: string | null;
            teacherId: string | null;
            enrollmentId: bigint | null;
            contractType: string;
            subjectIds: string[];
            uploadedImageUrl: string;
            uploadedImageName: string | null;
            uploadedAt: Date;
            startDate: Date | null;
            expiredAt: Date | null;
            note: string | null;
        }[];
    }>;
    uploadContract(studentId: string, applicationFile: Express.Multer.File, body: any): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string | null;
            status: string | null;
            parentId: string | null;
            teacherId: string | null;
            enrollmentId: bigint | null;
            contractType: string;
            subjectIds: string[];
            uploadedImageUrl: string;
            uploadedImageName: string | null;
            uploadedAt: Date;
            startDate: Date | null;
            expiredAt: Date | null;
            note: string | null;
        };
        message: string;
    }>;
    updateContract(contractId: string, body: {
        subjectIds?: string[];
        note?: string;
        expiredAt?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            studentId: string | null;
            status: string | null;
            parentId: string | null;
            teacherId: string | null;
            enrollmentId: bigint | null;
            contractType: string;
            subjectIds: string[];
            uploadedImageUrl: string;
            uploadedImageName: string | null;
            uploadedAt: Date;
            startDate: Date | null;
            expiredAt: Date | null;
            note: string | null;
        };
        message: string;
    }>;
    deleteContract(contractId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
