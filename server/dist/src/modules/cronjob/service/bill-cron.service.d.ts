import { PrismaService } from "../../../../src/db/prisma.service";
export declare class BillCronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
}
