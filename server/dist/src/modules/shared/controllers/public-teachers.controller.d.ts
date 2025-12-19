import { PublicTeachersService } from '../services/public-teachers.service';
export declare class PublicTeachersController {
    private readonly publicTeachersService;
    constructor(publicTeachersService: PublicTeachersService);
    getTeachers(subjectId?: string, limit?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            subject: string;
            subjects: string[];
            experience: number;
            students: number;
            rating: number;
            avatar: string;
            classesStatus: string[];
            assignedClasses: {
                className: string;
                classCode: string;
                status: string;
            }[];
        }[];
        message: string;
    }>;
}
