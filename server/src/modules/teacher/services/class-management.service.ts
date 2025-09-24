import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}

    async getClassByTeacherId(teacherId: string) {
        // Logic to get classes by teacher ID
        const classes = await this.prisma.class.findMany({
            where: { teacherId },
            include:{
                room: true,             
            }
        })
        return classes;
    }
}
