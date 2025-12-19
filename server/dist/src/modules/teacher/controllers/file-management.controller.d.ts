import { Response } from 'express';
import { FileManagementService } from '../services/file-management.service';
import { UploadMaterialDto, GetMaterialsDto } from '../dto/upload/upload-material.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { PrismaService } from '../../../db/prisma.service';
export declare class FileManagementController {
    private readonly fileManagementService;
    private readonly cloudinaryService;
    private readonly prisma;
    constructor(fileManagementService: FileManagementService, cloudinaryService: CloudinaryService, prisma: PrismaService);
    uploadMaterial(req: any, dto: UploadMaterialDto, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            id: bigint;
            classId: string;
            className: string;
            title: string;
            fileName: string;
            category: string;
            description: string;
            fileUrl: string;
            fileSize: number;
            fileType: string;
            uploadedBy: string;
            uploadedAt: Date;
            downloads: number;
        };
        message: string;
    }>;
    getMaterials(req: any, query: GetMaterialsDto): Promise<{
        success: boolean;
        data: {
            data: {
                id: bigint;
                classId: string;
                className: string;
                title: string;
                fileName: string;
                category: string;
                description: string;
                fileUrl: string;
                fileSize: number;
                fileType: string;
                uploadedBy: string;
                uploadedAt: Date;
                downloads: number;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
                totalSize: number;
                totalDownloads: number;
                recentUploads: number;
            };
        };
        message: string;
    }>;
    getTeacherClasses(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            grade: string;
            gradeLevel: number;
            subject: string;
        }[];
        message: string;
    }>;
    deleteMaterial(req: any, id: number): Promise<{
        success: boolean;
        data: {
            message: string;
        };
        message: string;
    }>;
    getDownloadUrl(id: number): Promise<{
        success: boolean;
        data: {
            url: string;
            fileName: string;
            fileType: string;
            fileSize: number;
        };
        message: string;
    }>;
    incrementDownload(id: number): Promise<{
        success: boolean;
        data: {
            message: string;
        };
        message: string;
    }>;
    downloadFileDirect(id: number, res: Response): Promise<void>;
}
