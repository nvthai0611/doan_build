import { PrismaService } from '../../../db/prisma.service';
interface GetMaterialsDto {
    classId?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class FileManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMaterials(dto: GetMaterialsDto): Promise<{
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
    getCenterClasses(): Promise<{
        id: string;
        name: string;
        grade: string;
        gradeLevel: number;
        subject: string;
        teacherName: string;
    }[]>;
    deleteMaterial(materialId: number): Promise<{
        message: string;
    }>;
    incrementDownload(materialId: number): Promise<{
        message: string;
    }>;
}
export {};
