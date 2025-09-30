import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    async getClassByTeacherId(query: any) {
        const assignments = await this.prisma.teacherClassAssignment.findMany({
            where: { teacherId: query.teacherId },
            include: { 
                class: {
                    include: { room: true }
                }
            }
        });
        return assignments.map(assignment => assignment.class);
    }
    async getClassDetail(id: string) {
        return this.prisma.class.findUnique({ where: { id } });
    }
    async createClass(body: any) {
        return this.prisma.class.create({ data: body });
    }   
}
