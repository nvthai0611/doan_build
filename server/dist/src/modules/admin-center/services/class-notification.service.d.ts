import { PrismaService } from '../../../db/prisma.service';
import { AlertService } from './alert.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class ClassNotificationService {
    private prisma;
    private alertService;
    private emailNotificationService;
    private readonly logger;
    constructor(prisma: PrismaService, alertService: AlertService, emailNotificationService: EmailNotificationService);
    checkClassesStartingSoon(): Promise<void>;
    checkClassesEndingSoon(): Promise<void>;
    private createClassStartingAlert;
    private createClassEndingAlert;
    private buildStartingMessage;
    private buildEndingMessage;
    private formatSchedule;
    private sendClassStartingEmail;
    private sendClassEndingEmail;
}
