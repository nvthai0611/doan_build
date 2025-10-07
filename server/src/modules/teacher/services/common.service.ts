import { PrismaService } from "src/db/prisma.service";

export class CommonService {
    constructor(private readonly prisma: PrismaService) {}

    async getListStudentOfClass(assignmentId: string) {}

    async getDetailStudentOfClass( studentId: string) {
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
            }
        });
    }
}
