import { Job } from 'bull';
import { PrismaService } from '../../../db/prisma.service';
export declare class RecalculatedPayrollTeacherProcessor {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private roundMoney;
    handleRecalculation(job: Job<{
        payrollId: string;
    }>): Promise<void>;
}
