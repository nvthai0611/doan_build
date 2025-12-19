import { PrismaService } from '../../../db/prisma.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';
export declare class HolidaysSettingService {
    private prisma;
    constructor(prisma: PrismaService);
    list(year?: string): Promise<{
        data: {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            type: string;
            startDate: Date;
            note: string | null;
            endDate: Date;
        }[];
        message: string;
    }>;
    create(dto: CreateHolidayDto): Promise<{
        data: {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            type: string;
            startDate: Date;
            note: string | null;
            endDate: Date;
        };
        message: string;
    }>;
    update(id: string, dto: UpdateHolidayDto): Promise<{
        data: {
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            id: string;
            type: string;
            startDate: Date;
            note: string | null;
            endDate: Date;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        data: {
            revertedSessions: number;
        };
        message: string;
    }>;
    apply(id: string): Promise<{
        data: {
            created: number;
            affectedSessions?: undefined;
            holidayNote?: undefined;
        };
        message: string;
    } | {
        data: {
            affectedSessions: number;
            holidayNote: string;
            created?: undefined;
        };
        message: string;
    }>;
    private checkOverlappingHolidays;
}
