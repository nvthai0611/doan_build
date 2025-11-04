import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
interface CreateStudentDto {
    fullName: string;
    username: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    parentId?: string;
    schoolId: string;
    password?: string;
    applicationFile?: Express.Multer.File;
    subjectIds?: string[];
}
interface UpdateStudentDto {
    fullName?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    schoolId?: string;
}
export interface StudentResponse {
    data: any;
    message: string;
}
export declare class StudentManagementService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    private formatStudentResponse;
    createStudent(createStudentData: CreateStudentDto): Promise<StudentResponse>;
    findParentByEmail(email: string): Promise<StudentResponse>;
    getAllStudents(status?: string, search?: string, birthMonth?: string, birthYear?: string, gender?: string, accountStatus?: string, customerConnection?: string, course?: string, page?: number, limit?: number): Promise<StudentResponse>;
    getCountByStatus(): Promise<StudentResponse>;
    toggleStudentStatus(studentId: string, currentUserId?: string): Promise<StudentResponse>;
    updateStudentStatus(studentId: string, isActive: boolean, currentUserId?: string): Promise<StudentResponse>;
    updateStudent(studentId: string, updateStudentData: UpdateStudentDto): Promise<StudentResponse>;
    updateStudentParent(studentId: string, parentId: string | null): Promise<StudentResponse>;
    getAttendanceByStudentIdAndClassId(studentId: string, classId: string): Promise<StudentResponse>;
}
export {};
