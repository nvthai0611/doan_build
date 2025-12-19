import { PrismaService } from '../../../db/prisma.service';
import { EmailServiceNotificationBill } from '../../shared/services/email-notification-bill.service';
export declare class FeeReminderService {
    private readonly prisma;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailServiceNotificationBill);
    handleEarlyFeeReminder(): Promise<void>;
    handleDueFeeReminder(): Promise<void>;
    private processFeeReminders;
    private groupFeesByParent;
    private createJobExecution;
    private updateJobExecution;
    private formatCurrency;
}
