import { HolidaysSettingService } from '../services/holidays-setting.service';
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto';
export declare class HolidaysSettingController {
    private holidaysService;
    constructor(holidaysService: HolidaysSettingService);
    listHolidays(year?: string): Promise<{
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
    createHoliday(dto: CreateHolidayDto): Promise<{
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
    updateHoliday(id: string, dto: UpdateHolidayDto): Promise<{
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
    deleteHoliday(id: string): Promise<{
        data: {
            revertedSessions: number;
        };
        message: string;
    }>;
    applyHoliday(id: string): Promise<{
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
}
