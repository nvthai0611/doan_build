import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    async getClassByTeacherId(query: any) {
        return this.prisma.class.findMany({
            where: { teacherId: query.teacherId },
            include: { room: true }
        });
    }
    async getClassDetail(id: string) {
        return this.prisma.class.findUnique({ where: { id } });
    }
    async createClass(body: any) {
        return this.prisma.class.create({ data: body });
    }   
}
