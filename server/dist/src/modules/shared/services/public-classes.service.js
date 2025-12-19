"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PublicClassesService = class PublicClassesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecruitingClasses(query) {
        const { page, limit, subjectId, gradeId, teacherId } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: { in: ['ready', 'active'] },
        };
        if (subjectId) {
            where.subjectId = subjectId;
        }
        if (gradeId) {
            where.gradeId = gradeId;
        }
        if (teacherId) {
            where.teacherId = teacherId;
        }
        const allClasses = await this.prisma.class.findMany({
            where,
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                grade: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                fullName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                status: { in: ['studying', 'not_been_updated'] },
                            },
                        },
                        classRequests: {
                            where: {
                                status: 'pending',
                            },
                        },
                        sessions: {
                            where: {
                                status: 'end',
                            },
                        },
                    },
                },
            },
            orderBy: [
                { status: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        const availableClasses = allClasses.filter((classItem) => {
            if (!classItem.maxStudents) {
                return true;
            }
            return classItem._count.enrollments < classItem.maxStudents;
        });
        const total = availableClasses.length;
        const classes = availableClasses.slice(skip, skip + limit);
        const formattedClasses = classes.map((classItem) => ({
            id: classItem.id,
            name: classItem.name,
            classCode: classItem.classCode,
            description: classItem.description,
            status: classItem.status,
            maxStudents: classItem.maxStudents,
            currentStudents: classItem._count.enrollments,
            pendingRequests: classItem._count.classRequests,
            completedSessionsCount: classItem._count.sessions,
            subject: classItem.subject,
            grade: classItem.grade,
            teacher: classItem.teacher
                ? {
                    id: classItem.teacher.id,
                    fullName: classItem.teacher.user.fullName,
                    avatar: classItem.teacher.user.avatar,
                }
                : null,
            recurringSchedule: classItem.recurringSchedule,
            expectedStartDate: classItem.expectedStartDate,
            actualStartDate: classItem.actualStartDate,
            actualEndDate: classItem.actualEndDate,
            requirePassword: !!classItem.password,
            createdAt: classItem.createdAt,
        }));
        return {
            success: true,
            data: formattedClasses,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            message: 'Lấy danh sách lớp đang tuyển sinh thành công',
        };
    }
    async getSubjects() {
        const subjects = await this.prisma.subject.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return {
            success: true,
            data: subjects,
            message: 'Lấy danh sách môn học thành công',
        };
    }
    async getGrades() {
        const grades = await this.prisma.grade.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return {
            success: true,
            data: grades,
            message: 'Lấy danh sách khối lớp thành công',
        };
    }
};
exports.PublicClassesService = PublicClassesService;
exports.PublicClassesService = PublicClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicClassesService);
//# sourceMappingURL=public-classes.service.js.map