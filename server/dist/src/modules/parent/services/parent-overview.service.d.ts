import { PrismaService } from 'src/db/prisma.service';
export declare class ParentOverviewService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getParentOverview(parentUserId: string, date?: string): Promise<{
        parentName: string;
        gender: import(".prisma/client").$Enums.Gender;
        upcomingLessons: any[];
        activeClasses: any[];
        studentCount: number;
    }>;
}
