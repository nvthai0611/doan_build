import { GradeService } from "../services/grade.service";
export declare class GradesController {
    private readonly gradeService;
    constructor(gradeService: GradeService);
    findAll(): Promise<{
        level: number;
        isActive: boolean;
        id: string;
        name: string;
        description: string | null;
    }[]>;
}
