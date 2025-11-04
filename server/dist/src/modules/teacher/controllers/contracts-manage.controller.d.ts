import { ContractsManageService } from '../services/contracts-manage.service';
import { PrismaService } from '../../../db/prisma.service';
export declare class ContractsManageController {
    private readonly service;
    private readonly prisma;
    constructor(service: ContractsManageService, prisma: PrismaService);
    list(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiryDate: Date;
            notes: string;
            status: string;
        }[];
    }>;
    upload(req: any, file: Express.Multer.File, contractType: string, expiryDate: string, notes: string): Promise<{
        success: boolean;
        data: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiryDate: Date;
            notes: string;
            status: string;
        };
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
