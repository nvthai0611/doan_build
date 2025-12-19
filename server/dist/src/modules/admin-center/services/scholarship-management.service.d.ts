import { PrismaService } from '../../../db/prisma.service';
import { CreateScholarshipDto } from '../dto/scholarship/create-scholarship.dto';
import { UpdateScholarshipDto } from '../dto/scholarship/update-scholarship.dto';
import { QueryScholarshipDto } from '../dto/scholarship/query-scholarship.dto';
export declare class ScholarshipManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryScholarshipDto): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            percent: number;
            criteria: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            studentCount: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        percent: number;
        criteria: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        studentCount: number;
    }>;
    create(createScholarshipDto: CreateScholarshipDto): Promise<{
        id: string;
        name: string;
        description: string;
        percent: number;
        criteria: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateScholarshipDto: UpdateScholarshipDto): Promise<{
        id: string;
        name: string;
        description: string;
        percent: number;
        criteria: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assignToStudent(studentId: string, scholarshipId: string | null): Promise<{
        id: string;
        studentCode: string;
        fullName: string;
        scholarship: {
            id: string;
            name: string;
            percent: number;
        };
    }>;
}
