import { PrismaService } from '../../../db/prisma.service';
export declare class RoomsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            isActive: boolean;
            id: string;
            name: string;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
