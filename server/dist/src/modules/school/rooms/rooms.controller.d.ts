import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
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
