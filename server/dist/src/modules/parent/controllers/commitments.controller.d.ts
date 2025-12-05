import { CommitmentsService } from '../services/commitments.service';
import { UploadCommitmentDto } from '../dto/request/upload-commitment.dto';
import { PrismaService } from '../../../db/prisma.service';
export declare class CommitmentsController {
    private readonly commitmentsService;
    private readonly prisma;
    constructor(commitmentsService: CommitmentsService, prisma: PrismaService);
    getStudentCommitments(req: any, studentId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiredAt: Date;
            status: string;
            note: string;
            subjectIds: string[];
        }[];
    }>;
    uploadCommitment(req: any, file: Express.Multer.File, dto: UploadCommitmentDto): Promise<{
        success: boolean;
        data: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiredAt: Date;
            status: string;
            note: string;
            subjectIds: string[];
        };
    }>;
    deleteCommitment(req: any, commitmentId: string, studentId: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
