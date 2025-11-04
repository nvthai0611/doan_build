import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
export declare class CommitmentsService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getStudentCommitments(studentId: string, parentId: string): Promise<{
        id: string;
        contractType: string;
        uploadedImageUrl: string;
        uploadedImageName: string;
        uploadedAt: Date;
        expiredAt: Date;
        status: string;
        note: string;
        subjectIds: string[];
    }[]>;
    uploadCommitment(parentId: string, studentId: string, file: Express.Multer.File, subjectIds: string[], note?: string): Promise<{
        id: string;
        contractType: string;
        uploadedImageUrl: string;
        uploadedImageName: string;
        uploadedAt: Date;
        expiredAt: Date;
        status: string;
        note: string;
        subjectIds: string[];
    }>;
    deleteCommitment(commitmentId: string, studentId: string, parentId: string): Promise<{
        message: string;
    }>;
}
