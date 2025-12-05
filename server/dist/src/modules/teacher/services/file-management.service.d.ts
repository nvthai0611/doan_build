import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UploadMaterialDto, GetMaterialsDto } from '../dto/upload/upload-material.dto';
export declare class FileManagementService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    uploadMaterial(teacherId: string, dto: UploadMaterialDto, file: Express.Multer.File): Promise<{
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
    }>;
    getMaterials(teacherId: string, dto: GetMaterialsDto): Promise<{
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
    }>;
    getTeacherClasses(teacherId: string): Promise<{
        id: string;
        name: string;
        grade: string;
        gradeLevel: number;
        subject: string;
    }[]>;
    deleteMaterial(teacherId: string, materialId: number): Promise<{
        message: string;
    }>;
    incrementDownload(materialId: number): Promise<{
        message: string;
    }>;
    getDownloadUrl(materialId: number): Promise<{
        url: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    }>;
}
