import { PrismaService } from '../../../db/prisma.service';
export declare class CreateSchoolDto {
    name: string;
    address?: string;
    phone?: string;
}
export declare class SchoolsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        data: {
            createdAt: Date;
            phone: string | null;
            updatedAt: Date;
            id: string;
            name: string;
            address: string | null;
        }[];
        message: string;
    }>;
    create(createSchoolDto: CreateSchoolDto): Promise<{
        data: {
            createdAt: Date;
            phone: string | null;
            updatedAt: Date;
            id: string;
            name: string;
            address: string | null;
        };
        message: string;
        isExisting: boolean;
    }>;
}
