import { PrismaService } from '../../../db/prisma.service';
export declare class PublicShowcasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getShowcases(query?: {
        featured?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: string;
            description: string;
            title: string;
            studentImage: string;
            achievement: string;
            featured: boolean;
            order: number;
            publishedAt: Date;
        }[];
        message: string;
    }>;
}
