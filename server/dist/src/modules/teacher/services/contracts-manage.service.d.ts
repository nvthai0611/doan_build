import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
export declare class ContractsManageService {
    private readonly prisma;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    listByTeacher(teacherId: string): Promise<{
        id: string;
        contractType: string;
        uploadedImageUrl: string;
        uploadedImageName: string;
        uploadedAt: Date;
        expiryDate: Date;
        notes: string;
        status: string;
    }[]>;
    createForTeacher(teacherId: string, file: Express.Multer.File, contractType: string, expiryDate?: string, notes?: string): Promise<{
        id: string;
        contractType: string;
        uploadedImageUrl: string;
        uploadedImageName: string;
        uploadedAt: Date;
        expiryDate: Date;
        notes: string;
        status: string;
    }>;
    deleteForTeacher(teacherId: string, id: string): Promise<{
        message: string;
    }>;
    refreshContractStatusesDaily(): Promise<void>;
}
