import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(createStudentDto: CreateStudentDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateStudentDto: UpdateStudentDto): string;
    remove(id: string): string;
}
