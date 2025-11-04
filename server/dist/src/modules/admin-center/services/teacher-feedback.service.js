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
exports.TeacherFeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TeacherFeedbackService = class TeacherFeedbackService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, teacherId, classId, rating, isAnonymous, dateFrom, dateTo, status, } = query || {};
        const where = {};
        if (teacherId)
            where.teacherId = teacherId;
        if (classId)
            where.classId = classId;
        if (status)
            where.status = status;
        if (typeof isAnonymous !== 'undefined')
            where.isAnonymous = String(isAnonymous) === 'true';
        if (rating)
            where.rating = Number(rating);
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo) {
                const d = new Date(dateTo);
                d.setHours(23, 59, 59, 999);
                where.createdAt.lte = d;
            }
        }
        const searchOr = [];
        if (search) {
            const contains = String(search);
            searchOr.push({ teacher: { user: { fullName: { contains, mode: 'insensitive' } } } }, { parent: { user: { fullName: { contains, mode: 'insensitive' } } } }, { student: { user: { fullName: { contains, mode: 'insensitive' } } } }, { class: { name: { contains, mode: 'insensitive' } } });
        }
        const feedbacks = await this.prisma.teacherFeedback.findMany({
            where: searchOr.length ? { AND: [where], OR: searchOr } : where,
            orderBy: { createdAt: 'desc' },
            include: {
                teacher: { include: { user: true } },
                parent: { include: { user: true } },
                student: { include: { user: true } },
                class: true,
            },
        });
        const data = feedbacks.map((f) => ({
            id: f.id,
            teacherId: f.teacherId,
            teacherName: f.teacher?.user?.fullName ?? 'Giáo viên',
            teacherAvatar: f.teacher?.user?.avatar ?? undefined,
            parentName: f.parent?.user?.fullName ?? 'Phụ huynh',
            parentEmail: f.parent?.user?.email ?? '',
            studentName: f.student?.user?.fullName ?? '',
            className: f.class?.name ?? '',
            rating: f.rating,
            categories: f.categories || {},
            comment: f.comment || '',
            isAnonymous: f.isAnonymous,
            status: f.status,
            createdAt: f.createdAt.toISOString().slice(0, 10),
        }));
        return { data, message: 'Fetched feedbacks successfully' };
    }
};
exports.TeacherFeedbackService = TeacherFeedbackService;
exports.TeacherFeedbackService = TeacherFeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeacherFeedbackService);
//# sourceMappingURL=teacher-feedback.service.js.map