import { PrismaService } from '../../../db/prisma.service';
import { CenterInfoSettingDto } from '../dto/setting/center-info.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
export declare class CenterInfoService {
    private prisma;
    private cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getCenterInfo(): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string | null;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            updatedBy: string | null;
        };
        message: string;
    }>;
    updateCenterInfo(dto: CenterInfoSettingDto, logoFile?: Express.Multer.File, bannerFile?: Express.Multer.File): Promise<{
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string | null;
            value: import("@prisma/client/runtime/library").JsonValue;
            key: string;
            group: string;
            updatedBy: string | null;
        };
        message: string;
    }>;
    private validateImageFile;
    private validateWorkingHours;
}
