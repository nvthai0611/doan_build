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
exports.PublicTeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let PublicTeachersService = class PublicTeachersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTeachers(params) {
        const { subjectId, limit } = params || {};
        const where = {};
        if (subjectId) {
            where.subjects = { has: subjectId };
        }
        const teachers = await this.prisma.teacher.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                createdAt: true,
                subjects: true,
                user: {
                    select: {
                        fullName: true,
                        avatar: true,
                    },
                },
                classes: {
                    select: {
                        status: true,
                        name: true,
                        classCode: true,
                        enrollments: {
                            where: {
                                status: { in: ['studying', 'not_been_updated'] },
                                class: { status: { in: ['active', 'ready'] } },
                            },
                            select: { id: true },
                        },
                    },
                },
                feedbacks: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        const now = new Date();
        const result = teachers.map((t) => {
            const students = t.classes.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);
            const rating = t.feedbacks.length
                ? Number((t.feedbacks.reduce((s, f) => s + (f.rating || 0), 0) /
                    (t.feedbacks.length || 1)).toFixed(1))
                : 0;
            const experience = Math.max(0, now.getFullYear() - t.createdAt.getFullYear());
            const subjectLabel = t.subjects.length === 1 ? t.subjects[0] : t.subjects.length > 1 ? 'Đa môn' : 'Giáo viên';
            return {
                id: t.id,
                name: t.user.fullName || 'Giáo viên',
                subject: subjectLabel,
                subjects: t.subjects,
                experience,
                students,
                rating,
                avatar: t.user.avatar,
                classesStatus: t.classes.map(c => c.status),
                assignedClasses: t.classes.filter(c => c.status === 'active' || c.status === 'ready').map(c => ({
                    className: c.name,
                    classCode: c.classCode,
                    status: c.status,
                })),
            };
        });
        return {
            success: true,
            data: result,
            message: 'Lấy danh sách giáo viên thành công',
        };
    }
};
exports.PublicTeachersService = PublicTeachersService;
exports.PublicTeachersService = PublicTeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicTeachersService);
//# sourceMappingURL=public-teachers.service.js.map