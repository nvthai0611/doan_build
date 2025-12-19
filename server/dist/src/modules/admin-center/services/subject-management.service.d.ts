import { PrismaService } from '../../../db/prisma.service';
import { CreateSubjectDto } from 'src/modules/admin-center/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/modules/admin-center/dto/subject/update-subject.dto';
export declare class SubjectManagementService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        code: string;
        name: string;
        description: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        description: string;
    }>;
    create(dto: CreateSubjectDto): Promise<{
        id: string;
        code: string;
        name: string;
        description: string;
    }>;
    update(id: string, dto: UpdateSubjectDto): Promise<{
        id: string;
        code: string;
        name: string;
        description: string;
    }>;
    remove(id: string): Promise<void>;
}
