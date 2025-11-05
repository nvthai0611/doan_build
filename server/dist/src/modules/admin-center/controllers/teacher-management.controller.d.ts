import { TeacherManagementService } from '../services/teacher-management.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
export declare class TeacherManagementController {
    private readonly teacherManagementService;
    constructor(teacherManagementService: TeacherManagementService);
    create(createTeacherDto: CreateTeacherDto, file?: any): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        role: string;
        gender: string;
        birthDate: string;
        status: any;
        schoolName: any;
        schoolAddress: any;
        school: {
            id: any;
            name: any;
            address: any;
        };
        contractUploads: any;
        subjects: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findAll(queryDto: any): Promise<{
        data: {
            id: any;
            name: any;
            email: any;
            phone: any;
            username: any;
            code: any;
            role: string;
            gender: string;
            birthDate: string;
            status: any;
            schoolName: any;
            schoolAddress: any;
            school: {
                id: any;
                name: any;
                address: any;
            };
            contractUploads: any;
            subjects: any;
            notes: any;
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        message: string;
    }>;
    findOne(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        role: string;
        gender: string;
        birthDate: string;
        status: any;
        schoolName: any;
        schoolAddress: any;
        school: {
            id: any;
            name: any;
            address: any;
        };
        contractUploads: any;
        subjects: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, updateTeacherDto: UpdateTeacherDto, file?: Express.Multer.File): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        role: string;
        gender: string;
        birthDate: string;
        status: any;
        schoolName: any;
        schoolAddress: any;
        school: {
            id: any;
            name: any;
            address: any;
        };
        contractUploads: any;
        subjects: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleStatus(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        role: string;
        gender: string;
        birthDate: string;
        status: any;
        schoolName: any;
        schoolAddress: any;
        school: {
            id: any;
            name: any;
            address: any;
        };
        contractUploads: any;
        subjects: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getSchedule(id: string, year?: string, month?: string): Promise<{
        teacher: {
            id: string;
            name: string;
            email: string;
        };
        sessions: {
            id: string;
            classId: string;
            date: Date;
            title: string;
            time: string;
            subject: string;
            class: string;
            room: string;
            hasAlert: boolean;
            status: "happening" | "end" | "has_not_happened" | "day_off";
            teacher: string;
            students: {
                id: string;
                name: string;
                avatar: any;
                status: "present" | "excused" | "absent";
            }[];
            attendanceWarnings: string[];
            description: string;
            materials: any[];
            cancellationReason: string;
        }[];
    }>;
    validateBulkImport(body: {
        teachers: any[];
    }): Promise<{
        message: string;
        successCount: number;
        errorCount: number;
        errors: any[];
        warnings: any[];
    }>;
    bulkImport(body: {
        teachers: any[];
    }): Promise<{
        message: string;
        successCount: number;
        errorCount: number;
        errors: any[];
        warnings: any[];
    }>;
    getTeacherContracts(id: string): Promise<{
        contractUploads: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiryDate: Date;
            notes: string;
            status: string;
        }[];
        message: string;
    }>;
    uploadContractForTeacher(teacherId: string, file: Express.Multer.File, contractType: string, expiryDate: string, notes?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            contractType: string;
            uploadedImageUrl: string;
            uploadedImageName: string;
            uploadedAt: Date;
            expiryDate: Date;
            notes: string;
            status: string;
        };
        message: string;
    }>;
    deleteTeacherContract(teacherId: string, contractId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
