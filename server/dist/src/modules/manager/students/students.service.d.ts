import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsService {
    create(createStudentDto: CreateStudentDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateStudentDto: UpdateStudentDto): string;
    remove(id: number): string;
}
