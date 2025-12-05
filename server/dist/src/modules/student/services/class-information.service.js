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
exports.ClassInformationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ClassInformationService = class ClassInformationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEnrolledSubjectsByStudent(studentId) {
        const subjects = await this.prisma.subject.findMany({
            where: {
                classes: {
                    some: {
                        status: 'active',
                        enrollments: { some: { studentId } },
                    },
                },
            },
            select: { id: true, code: true, name: true, description: true },
        });
        return subjects;
    }
    async getStudentsOfClassForStudent(classId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { classId },
            include: { student: { include: { user: true } } },
            orderBy: { enrolledAt: 'asc' },
        });
        return enrollments.map((e) => ({
            id: e.student.id,
            userId: e.student.userId,
            fullName: e.student.user?.fullName,
            email: e.student.user?.email,
            studentCode: e.student.studentCode,
            enrolledAt: e.enrolledAt,
            status: e.status,
        }));
    }
    async getClassDetailForStudent(classId) {
        const cls = await this.prisma.class.findUnique({
            where: { id: classId },
            include: {
                subject: true,
                room: true,
                teacher: { include: { user: true } },
                _count: { select: { enrollments: true } },
            },
        });
        if (!cls)
            return null;
        return {
            id: cls.id,
            name: cls.name,
            description: cls.description,
            subject: cls.subject,
            room: cls.room,
            startDate: cls.actualStartDate ?? cls.expectedStartDate ?? null,
            endDate: cls.actualEndDate ?? null,
            maxStudents: cls.maxStudents ?? null,
            currentStudents: cls._count?.enrollments ?? 0,
            teacher: cls.teacher ?? null,
        };
    }
};
exports.ClassInformationService = ClassInformationService;
exports.ClassInformationService = ClassInformationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassInformationService);
//# sourceMappingURL=class-information.service.js.map