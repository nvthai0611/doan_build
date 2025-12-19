import { PrismaService } from 'src/db/prisma.service';
export interface GetParentMaterialsDto {
    childId: string;
    classId?: string;
    category?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export declare class MaterialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMaterialsForChild(parentUserId: string, dto: GetParentMaterialsDto): Promise<any>;
    incrementDownload(materialId: number): Promise<void>;
}
