import { PrismaService } from '../../../db/prisma.service';
export declare class SessionSchedulerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    updateSessionStatus(): Promise<void>;
    markPastSessionsAsEnded(): Promise<void>;
}
