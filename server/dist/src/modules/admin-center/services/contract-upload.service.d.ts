import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
export declare class ContractUploadService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getByStudentId(studentId: string): Promise<{
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
    }[]>;
    uploadContract(studentId: string, file: Express.Multer.File, data: {
        parentId?: string;
        contractType: string;
        subjectIds?: string[];
        note?: string;
        expiredAt?: Date;
    }): Promise<{
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
    }>;
    updateContract(contractId: string, data: {
        subjectIds?: string[];
        note?: string;
        expiredAt?: Date;
        status?: string;
    }): Promise<{
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
    }>;
    deleteContract(contractId: string): Promise<{
        success: boolean;
    }>;
}
