import { PrismaService } from "../../../db/prisma.service";
export declare class GradeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        level: number;
        isActive: boolean;
        id: string;
        name: string;
        description: string | null;
    }[]>;
}
