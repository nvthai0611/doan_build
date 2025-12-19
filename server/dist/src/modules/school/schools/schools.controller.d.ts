import { SchoolsService, CreateSchoolDto } from './schools.service';
export declare class SchoolsController {
    private readonly schoolsService;
    constructor(schoolsService: SchoolsService);
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
