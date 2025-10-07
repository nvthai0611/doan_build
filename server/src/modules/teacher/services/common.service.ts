import { PrismaService } from "src/db/prisma.service";

export class CommonService {
    constructor(private readonly prisma: PrismaService) {}

    async getListStudentOfClass(assignmentId: string) {}

    async getDetailStudentOfClass(assignmentId: string, studentId: string) {}
}
