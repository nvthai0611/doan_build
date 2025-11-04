import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}
    
    async getClassByTeacherId(teacherId: string) {
        // Logic to get classes by teacher ID
        const classes = await this.prisma.class.findMany({
            where: { teacherId },
            include: {
                room: true,
                teacher: true
            }
        });
        return classes.map(cls => ({
            ...cls,
            teacherId: cls.teacherId
        }));
    }

    async findOne(id: string) {
        // Logic to get a specific class by ID
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: {
                room: true,
                teacher: true
            }
        });
        
        if (classItem) {
            return {
                ...classItem,
                teacherId: classItem.teacherId,
                room: classItem.room || { id: '', name: 'Chưa xác định', capacity: 0 }
            };
        }
        
        return classItem;
    }
}
