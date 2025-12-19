import { PrismaService } from '../../../db/prisma.service';
export declare class PublicCenterInfoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
