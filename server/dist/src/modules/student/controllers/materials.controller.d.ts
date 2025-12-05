import { MaterialsService, GetStudentMaterialsDto } from '../services/materials.service';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    getMaterials(req: any, query: GetStudentMaterialsDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    markDownloaded(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
