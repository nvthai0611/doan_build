import { StudentSharedService } from "../services/student.service";
export declare class StudentsSharedController {
    private readonly studentSharedService;
    constructor(studentSharedService: StudentSharedService);
    getStudentDetail(id: string): Promise<any>;
}
