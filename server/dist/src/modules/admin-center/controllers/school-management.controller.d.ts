import { SchoolManagementService } from '../services/school-management.service';
import { CreateSchoolDto } from '../dto/school/create-school.dto';
import { UpdateSchoolDto } from '../dto/school/update-school.dto';
export declare class SchoolManagementController {
    private readonly schoolManagementService;
    constructor(schoolManagementService: SchoolManagementService);
    getStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSchools: number;
            totalStudents: number;
            totalTeachers: number;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            address: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            studentCount: number;
            teacherCount: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            address: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    create(createSchoolDto: CreateSchoolDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            address: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            address: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
