import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersListResponseDto, TeacherResponseDto } from './dto/teacher-response.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    create(createTeacherDto: CreateTeacherDto): Promise<string>;
    findAll(): Promise<TeachersListResponseDto>;
    findOne(id: string): Promise<TeacherResponseDto>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<string>;
    remove(id: string): Promise<string>;
    getTeacherContracts(id: string): Promise<{
        id: string;
        parentId: string | null;
        teacherId: string | null;
        status: string | null;
        startDate: Date | null;
        studentId: string | null;
        note: string | null;
        enrollmentId: bigint | null;
        uploadedAt: Date;
        contractType: string;
        subjectIds: string[];
        uploadedImageUrl: string;
        uploadedImageName: string | null;
        expiredAt: Date | null;
    }[]>;
    deleteTeacherContract(teacherId: string, contractId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
