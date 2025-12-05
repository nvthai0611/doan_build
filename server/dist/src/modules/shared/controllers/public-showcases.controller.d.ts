import { PublicShowcasesService } from '../services/public-showcases.service';
export declare class PublicShowcasesController {
    private readonly publicShowcasesService;
    constructor(publicShowcasesService: PublicShowcasesService);
    getShowcases(featured?: string): Promise<{
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
