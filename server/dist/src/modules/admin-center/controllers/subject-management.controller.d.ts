import { SubjectManagementService } from '../services/subject-management.service';
import { CreateSubjectDto } from 'src/modules/admin-center/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/modules/admin-center/dto/subject/update-subject.dto';
export declare class SubjectManagementController {
    private readonly subjectService;
    constructor(subjectService: SubjectManagementService);
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            code: string;
            name: string;
            description: string;
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            code: string;
            name: string;
            description: string;
        };
    }>;
    create(dto: CreateSubjectDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            code: string;
            name: string;
            description: string;
        };
    }>;
    update(id: string, dto: UpdateSubjectDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            code: string;
            name: string;
            description: string;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
