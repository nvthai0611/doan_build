import { ScholarshipManagementService } from '../services/scholarship-management.service';
import { CreateScholarshipDto } from '../dto/scholarship/create-scholarship.dto';
import { UpdateScholarshipDto } from '../dto/scholarship/update-scholarship.dto';
import { QueryScholarshipDto } from '../dto/scholarship/query-scholarship.dto';
export declare class ScholarshipManagementController {
    private readonly scholarshipManagementService;
    constructor(scholarshipManagementService: ScholarshipManagementService);
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
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    create(createScholarshipDto: CreateScholarshipDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            description: string;
            percent: number;
            criteria: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: string, updateScholarshipDto: UpdateScholarshipDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            description: string;
            percent: number;
            criteria: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assignToStudent(studentId: string, body: {
        scholarshipId: string | null;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            studentCode: string;
            fullName: string;
            scholarship: {
                id: string;
                name: string;
                percent: number;
            };
        };
    }>;
}
