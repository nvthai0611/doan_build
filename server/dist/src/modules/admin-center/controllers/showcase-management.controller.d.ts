import { ShowcaseManagementService } from '../services/showcase-management.service';
export declare class ShowcaseManagementController {
    private readonly showcaseManagementService;
    constructor(showcaseManagementService: ShowcaseManagementService);
    getAllShowcases(query: any): Promise<import("../services/showcase-management.service").ShowcaseResponse>;
    getShowcaseById(id: string): Promise<import("../services/showcase-management.service").ShowcaseResponse>;
    createShowcase(createShowcaseDto: any, file?: Express.Multer.File): Promise<import("../services/showcase-management.service").ShowcaseResponse>;
    updateShowcase(id: string, updateShowcaseDto: any, file?: Express.Multer.File): Promise<import("../services/showcase-management.service").ShowcaseResponse>;
    deleteShowcase(id: string): Promise<import("../services/showcase-management.service").ShowcaseResponse>;
}
