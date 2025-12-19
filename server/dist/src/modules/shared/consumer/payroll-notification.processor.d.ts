import { Job } from 'bull';
import { PrismaService } from '../../../db/prisma.service';
import { EmailNotificationPayrollService } from '../services/email-notification-payroll.service';
interface PayrollNotificationPayload {
    payrollId: bigint;
    executionId?: string;
}
export declare class PayrollNotificationProcessor {
    private readonly emailService;
    private readonly prisma;
    private readonly logger;
    constructor(emailService: EmailNotificationPayrollService, prisma: PrismaService);
    handlePayrollNotification(job: Job<PayrollNotificationPayload>): Promise<void>;
}
export {};
