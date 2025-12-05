import { ClassNotificationService } from '../services/class-notification.service';
export declare class ClassNotificationCronService {
    private readonly classNotificationService;
    private readonly logger;
    constructor(classNotificationService: ClassNotificationService);
    checkClassNotifications(): Promise<void>;
}
