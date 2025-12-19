import { CenterInfoService } from '../services/center-info.service';
export declare class CenterInfoController {
    private readonly centerInfoService;
    constructor(centerInfoService: CenterInfoService);
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
    updateCenterInfo(body: any, files?: {
        logoFile?: Express.Multer.File[];
        bannerFile?: Express.Multer.File[];
    }): Promise<{
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
}
