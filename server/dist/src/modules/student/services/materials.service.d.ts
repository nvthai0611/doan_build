import { PrismaService } from 'src/db/prisma.service';
export interface GetStudentMaterialsDto {
    classId?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class MaterialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMaterialsForStudent(studentId: string, dto: GetStudentMaterialsDto): Promise<{
        items: {
            id: bigint;
            title: string;
            description: string;
            fileName: string;
            fileType: string;
            fileSize: bigint;
            category: string;
            fileUrl: string;
            uploadedAt: Date;
            classId: string;
            className: any;
            teacherName: any;
            downloads: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            totalSize: number;
            recentUploads: number;
            totalDownloads?: undefined;
        };
    } | {
        items: {
            id: bigint;
            title: string;
            description: string;
            fileName: string;
            fileType: string;
            fileSize: bigint;
            category: string;
            fileUrl: string;
            uploadedAt: Date;
            classId: string;
            className: any;
            teacherName: any;
            downloads: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            totalSize: number;
            totalDownloads: number;
            recentUploads: number;
        };
    }>;
    incrementDownload(materialId: number): Promise<void>;
}
