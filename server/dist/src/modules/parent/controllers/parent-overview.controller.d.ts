import { ParentOverviewService } from '../services/parent-overview.service';
export declare class ParentOverviewController {
    private readonly parentOverviewService;
    constructor(parentOverviewService: ParentOverviewService);
    getOverview(req: any, date?: string): Promise<{
        success: boolean;
        data: {
            parentName: string;
            gender: import(".prisma/client").$Enums.Gender;
            upcomingLessons: any[];
            activeClasses: any[];
            studentCount: number;
        };
        message: string;
    }>;
}
