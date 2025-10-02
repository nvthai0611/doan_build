import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}
    
    async getClassByTeacherId(query: any) {
        const { teacherId, status, page, limit, search } = query?.params;
        const assignments = await this.prisma.teacherClassAssignment.findMany({
            where: { teacherId: teacherId },
            include: { 
                class: {
                    include: { 
                        room: true,
                        subject: true,
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        // Transform the data to match frontend expectations
        const classes = assignments.map(assignment => ({
            id: assignment.class.id,
            name: assignment.class.name,
            subject: assignment.class.subject.name,
            students: assignment.class._count.enrollments,
            schedule: assignment.recurringSchedule ? 
                (typeof assignment.recurringSchedule === 'string' ? 
                    JSON.parse(assignment.recurringSchedule) : 
                    assignment.recurringSchedule) : null,
            status: assignment.class.status,
            startDate: assignment.startDate?.toISOString().split('T')[0] || '',
            endDate: assignment.endDate?.toISOString().split('T')[0] || '',
            room: assignment.class.room?.name || 'Chưa xác định',
            description: assignment.class.description || '',
            teacherId: assignment.teacherId
        }));

        return {
            data: classes,
            meta: { total: classes.length,
                page: parseInt(query.page) || 1,
                limit: parseInt(query.limit) || 10,
                totalPages: Math.ceil(classes.length / (parseInt(query.limit) || 10))
            },
            message: 'Lấy danh sách lớp học thành công'
        };
    }
    
    async getClassDetail(id: string) {
        const assignment = await this.prisma.teacherClassAssignment.findFirst({
            where: { classId: id },
            include: {
                class: {
                    include: {
                        room: true,
                        subject: true,
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            return null;
        }

        return {
            id: assignment.class.id,
            name: assignment.class.name,
            subject: assignment.class.subject.name,
            students: assignment.class._count.enrollments,
            schedule: assignment.recurringSchedule ? 
                (typeof assignment.recurringSchedule === 'string' ? 
                    JSON.parse(assignment.recurringSchedule) : 
                    assignment.recurringSchedule) : null,
            status: assignment.class.status,
            startDate: assignment.startDate?.toISOString().split('T')[0] || '',
            endDate: assignment.endDate?.toISOString().split('T')[0] || '',
            room: assignment.class.room?.name || 'Chưa xác định',
            description: assignment.class.description || '',
            teacherId: assignment.teacherId
        };
    }
    
    async createClass(body: any) {
        return this.prisma.class.create({ data: body });
    }
}
