import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) {}
    
    async getClassByTeacherId(teacherId: string) {
        // Logic to get classes by teacher ID
        const assignments = await this.prisma.teacherClassAssignment.findMany({
            where: { teacherId },
            include: {
                class: {
                    include: {
                        room: true,
                    }
                }
            }
        });
        return assignments.map(assignment => ({
            ...assignment.class,
            teacherId: assignment.teacherId
        }));
    }

    async findOne(id: string) {
        // Logic to get a specific class by ID
        const classItem = await this.prisma.class.findUnique({
            where: { id },
            include: {
                room: true,
                teacherClassAssignments: {
                    select: {
                        teacherId: true
                    },
                    take: 1
                }
            }
        });
        
        if (classItem) {
            return {
                ...classItem,
                teacherId: classItem.teacherClassAssignments[0]?.teacherId
            };
        }
        
        return classItem;
    }
}
