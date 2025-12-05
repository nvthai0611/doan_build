import { FileManagementService } from '../services/file-management.service';
interface GetMaterialsQuery {
    classId?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class FileManagementController {
    private readonly fileManagementService;
    constructor(fileManagementService: FileManagementService);
    getMaterials(req: any, query: GetMaterialsQuery): Promise<{
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
    getCenterClasses(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            grade: string;
            gradeLevel: number;
            subject: string;
            teacherName: string;
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
    incrementDownload(id: number): Promise<{
        success: boolean;
        data: {
            message: string;
        };
        message: string;
    }>;
}
export {};
