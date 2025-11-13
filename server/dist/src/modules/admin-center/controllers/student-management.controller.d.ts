import { StudentManagementService, StudentResponse } from '../services/student-management.service';
export declare class StudentManagementController {
    private readonly studentManagementService;
    constructor(studentManagementService: StudentManagementService);
    getAllStudents(query: any): Promise<StudentResponse>;
    countByStatus(): Promise<StudentResponse>;
    createStudent(createStudentDto: any, applicationFile: Express.Multer.File, req: any): Promise<StudentResponse>;
    findParentByEmail(email: string): Promise<StudentResponse>;
    toggleStudentStatus(studentId: string): Promise<StudentResponse>;
    updateStudentStatus(studentId: string, updateStudentStatusDto: any): Promise<StudentResponse>;
    updateStudent(studentId: string, updateStudentDto: {
        fullName?: string;
        phone?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate?: string;
        address?: string;
        grade?: string;
        schoolId?: string;
    }): Promise<StudentResponse>;
    updateStudentParent(studentId: string, updateParentDto: {
        parentId: string | null;
    }): Promise<StudentResponse>;
    getAttendanceByStudentAndClass(studentId: string, classId: string): Promise<StudentResponse>;
}
