import { PrismaService } from '../../../db/prisma.service';
export declare class PayrollCronService {
    private readonly prisma;
    private readonly logger;
    private readonly JOB_TYPE;
    constructor(prisma: PrismaService);
    private roundMoney;
    private toDbDate;
    handleGenerateTeacherPayroll(): Promise<void>;
    private getTeacherRate;
    private processCurrentMonthPools;
    private processBackPay;
    private aggregateAndCreatePayrolls;
}
