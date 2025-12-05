import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
interface CreateShowcaseDto {
    title: string;
    description?: string;
    studentImage: string | Express.Multer.File;
    achievement: string;
    featured?: boolean;
    order?: number;
    publishedAt?: Date;
}
interface UpdateShowcaseDto {
    title?: string;
    description?: string;
    studentImage?: string | Express.Multer.File;
    achievement?: string;
    featured?: boolean;
    order?: number;
    publishedAt?: Date;
}
export interface ShowcaseResponse {
    data: any;
    message: string;
}
export declare class ShowcaseManagementService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    getAllShowcases(params?: {
        page?: number;
        limit?: number;
        search?: string;
        featured?: boolean;
    }): Promise<ShowcaseResponse>;
    getShowcaseById(id: string): Promise<ShowcaseResponse>;
    createShowcase(createShowcaseDto: CreateShowcaseDto): Promise<ShowcaseResponse>;
    updateShowcase(id: string, updateShowcaseDto: UpdateShowcaseDto): Promise<ShowcaseResponse>;
    deleteShowcase(id: string): Promise<ShowcaseResponse>;
}
export {};
