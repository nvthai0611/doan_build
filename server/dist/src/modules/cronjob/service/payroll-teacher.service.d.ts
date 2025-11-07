import { PrismaService } from '../../../db/prisma.service';
export declare class PayrollCronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCalculateDailyPayouts(): Promise<void>;
    handleGenerateMonthlyPayrolls(): Promise<void>;
}
