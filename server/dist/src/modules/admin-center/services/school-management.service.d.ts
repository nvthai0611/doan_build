import { PrismaService } from '../../../db/prisma.service';
import { CreateSchoolDto } from '../dto/school/create-school.dto';
import { UpdateSchoolDto } from '../dto/school/update-school.dto';
export declare class SchoolManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        address: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        studentCount: number;
        teacherCount: number;
    }[]>;
    getStats(): Promise<{
        totalSchools: number;
        totalStudents: number;
        totalTeachers: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        address: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createSchoolDto: CreateSchoolDto): Promise<{
        id: string;
        name: string;
        address: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<{
        id: string;
        name: string;
        address: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
