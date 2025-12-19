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
exports.ChildTeacherFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ChildTeacherFeedbackService = class ChildTeacherFeedbackService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAvailableTeachersForChild(userId, childId) {
        const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
        if (!parent)
            throw new common_1.HttpException('Không tìm thấy phụ huynh', common_1.HttpStatus.NOT_FOUND);
        const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
        if (!child)
            throw new common_1.HttpException('Không tìm thấy học sinh', common_1.HttpStatus.NOT_FOUND);
        const enrollments = await this.prisma.enrollment.findMany({
            where: { studentId: childId, status: 'studying', class: { status: 'active', teacherId: { not: null } } },
            include: { class: { include: { teacher: { include: { user: true } } } } },
        });
        const byTeacher = new Map();
        for (const e of enrollments) {
            const t = e.class.teacher;
            if (!t)
                continue;
            if (!byTeacher.has(t.id)) {
                byTeacher.set(t.id, {
                    id: t.id,
                    name: t.user?.fullName ?? '',
                    avatar: t.user?.avatar ?? null,
                    classes: [],
                });
            }
            byTeacher.get(t.id).classes.push({ id: e.classId, name: e.class.name });
        }
        return Array.from(byTeacher.values());
    }
    async getFeedbacksForChild(userId, childId) {
        const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
        if (!parent)
            throw new common_1.HttpException('Không tìm thấy phụ huynh', common_1.HttpStatus.NOT_FOUND);
        const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
        if (!child)
            throw new common_1.HttpException('Không tìm thấy học sinh', common_1.HttpStatus.NOT_FOUND);
        const feedbacks = await this.prisma.teacherFeedback.findMany({
            where: { parentId: parent.id, studentId: childId },
            include: { teacher: { include: { user: true } }, class: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return feedbacks.map((f) => ({
            id: f.id,
            teacherId: f.teacherId,
            classId: f.classId || undefined,
            rating: f.rating,
            comment: f.comment || '',
            categories: f.categories || undefined,
            isAnonymous: f.isAnonymous,
            date: f.createdAt.toISOString().slice(0, 10),
            status: f.status,
            teacherName: f.teacher?.user?.fullName || '',
            className: f.class?.name || undefined,
        }));
    }
    async createFeedbackForChild(userId, childId, dto) {
        const parent = await this.prisma.parent.findUnique({ where: { userId }, select: { id: true } });
        if (!parent)
            throw new common_1.HttpException('Không tìm thấy phụ huynh', common_1.HttpStatus.NOT_FOUND);
        const child = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
        if (!child)
            throw new common_1.HttpException('Không tìm thấy học sinh', common_1.HttpStatus.NOT_FOUND);
        if (!dto.teacherId || !dto.rating) {
            throw new common_1.HttpException('Thiếu teacherId hoặc rating', common_1.HttpStatus.BAD_REQUEST);
        }
        const valid = await this.prisma.enrollment.findFirst({
            where: {
                studentId: childId,
                status: 'studying',
                class: { status: 'active', teacherId: dto.teacherId, ...(dto.classId ? { id: dto.classId } : {}) },
            },
            include: { class: true },
        });
        if (!valid) {
            throw new common_1.HttpException('Giáo viên hoặc lớp không hợp lệ với học sinh này', common_1.HttpStatus.BAD_REQUEST);
        }
        const created = await this.prisma.teacherFeedback.create({
            data: {
                teacherId: dto.teacherId,
                parentId: parent.id,
                studentId: childId,
                classId: dto.classId ?? valid.classId,
                rating: Math.max(1, Math.min(5, Number(dto.rating))),
                comment: dto.comment || '',
                categories: dto.categories ? dto.categories : undefined,
                isAnonymous: !!dto.isAnonymous,
                status: 'pending',
            },
        });
        return { id: created.id };
    }
};
exports.ChildTeacherFeedbackService = ChildTeacherFeedbackService;
exports.ChildTeacherFeedbackService = ChildTeacherFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildTeacherFeedbackService);
//# sourceMappingURL=child-teacher-feedback.service.js.map