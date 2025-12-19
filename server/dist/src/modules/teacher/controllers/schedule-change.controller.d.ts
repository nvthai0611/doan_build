import { ScheduleChangeService } from '../services/schedule-change.service';
import { CreateScheduleChangeDto } from '../dto/schedule-change/create-schedule-change.dto';
import { ScheduleChangeFiltersDto } from '../dto/schedule-change/schedule-change-filters.dto';
import { ScheduleChangeResponseDto } from '../dto/schedule-change/schedule-change-response.dto';
export declare class ScheduleChangeController {
    private readonly scheduleChangeService;
    constructor(scheduleChangeService: ScheduleChangeService);
    createScheduleChange(createDto: CreateScheduleChangeDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: ScheduleChangeResponseDto;
    }>;
    getMyScheduleChanges(filters: ScheduleChangeFiltersDto, req: any): Promise<{
        success: boolean;
        data: ScheduleChangeResponseDto[];
        meta: any;
    }>;
    getScheduleChangeDetail(id: string, req: any): Promise<{
        success: boolean;
        data: ScheduleChangeResponseDto;
    }>;
    cancelScheduleChange(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
