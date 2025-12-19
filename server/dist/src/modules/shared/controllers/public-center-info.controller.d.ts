import { PublicCenterInfoService } from '../services/public-center-info.service';
export declare class PublicCenterInfoController {
    private readonly publicCenterInfoService;
    constructor(publicCenterInfoService: PublicCenterInfoService);
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
}
