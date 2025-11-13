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
        startDate: Date;
        expiryDate: Date;
        teacherSalaryPercent: import("@prisma/client/runtime/library").Decimal;
        notes: string;
        status: string;
    }[]>;
    createForTeacher(teacherId: string, file: Express.Multer.File, contractType: string, startDate?: string, expiryDate?: string, notes?: string, teacherSalaryPercent?: number): Promise<{
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
