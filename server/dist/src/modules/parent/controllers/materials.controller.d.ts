import { MaterialsService, GetParentMaterialsDto } from '../services/materials.service';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    getMaterials(req: any, query: Partial<GetParentMaterialsDto>): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    markDownloaded(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
