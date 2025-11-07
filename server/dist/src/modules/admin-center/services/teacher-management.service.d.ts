import { PrismaService } from 'src/db/prisma.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class TeacherManagementService {
    private prisma;
    private cloudinaryService;
    private emailNotificationService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService, emailNotificationService: EmailNotificationService);
    createTeacher(createTeacherDto: CreateTeacherDto): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        avatar: any;
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
    findAllTeachers(queryDto: any): Promise<{
        data: {
            id: any;
            name: any;
            email: any;
            phone: any;
            username: any;
            code: any;
            avatar: any;
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
    findOneTeacher(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        avatar: any;
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
    updateTeacher(id: string, updateTeacherDto: UpdateTeacherDto): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        avatar: any;
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
    removeTeacher(id: string): Promise<{
        message: string;
    }>;
    toggleTeacherStatus(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        phone: any;
        username: any;
        code: any;
        avatar: any;
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
    getTeacherSchedule(id: string, year?: number, month?: number): Promise<{
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
            originalTeacher: string;
            substituteTeacher: string;
            isSubstitute: boolean;
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
    private checkSessionAlerts;
    private mapAttendanceStatus;
    private generateAttendanceWarnings;
    private formatTeacherResponse;
    private mapRoleToVietnamese;
    private formatDate;
    validateTeachersData(teachersData: any[]): Promise<{
        message: string;
        successCount: number;
        errorCount: number;
        errors: any[];
        warnings: any[];
    }>;
    private parseDateString;
    bulkImportTeachers(teachersData: any[]): Promise<{
        message: string;
        successCount: number;
        errorCount: number;
        errors: any[];
        warnings: any[];
    }>;
    getTeacherContracts(teacherId: string): Promise<{
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
    uploadContractForTeacher(teacherId: string, file: Express.Multer.File, contractType: string, expiryDate?: string, notes?: string): Promise<{
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
