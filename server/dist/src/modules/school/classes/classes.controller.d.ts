import { ClassesService } from './classes.service';
import { ClassesListResponseDto, ClassResponseDto } from './dto/class-response.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    findOne(id: string): Promise<ClassResponseDto>;
    getClassByTeacherId(teacherId: string): Promise<ClassesListResponseDto>;
}
