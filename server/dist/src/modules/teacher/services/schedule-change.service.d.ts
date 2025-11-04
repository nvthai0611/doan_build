import { PrismaService } from '../../../db/prisma.service';
import { CreateScheduleChangeDto } from '../dto/schedule-change/create-schedule-change.dto';
import { ScheduleChangeResponseDto } from '../dto/schedule-change/schedule-change-response.dto';
import { ScheduleChangeFiltersDto } from '../dto/schedule-change/schedule-change-filters.dto';
export declare class ScheduleChangeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createScheduleChange(createDto: CreateScheduleChangeDto, teacherId: string): Promise<ScheduleChangeResponseDto>;
    getMyScheduleChanges(teacherId: string, filters: ScheduleChangeFiltersDto): Promise<{
        data: ScheduleChangeResponseDto[];
        meta: any;
    }>;
    getScheduleChangeDetail(id: string, teacherId: string): Promise<ScheduleChangeResponseDto>;
    cancelScheduleChange(id: string, teacherId: string): Promise<void>;
    private checkScheduleConflict;
    private mapToResponseDto;
}
