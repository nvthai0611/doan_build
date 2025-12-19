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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentProfileByStudentId(studentId) {
        if (!studentId)
            return null;
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                school: true,
                parent: { include: { user: true } },
                enrollments: {
                    orderBy: { enrolledAt: 'desc' },
                    include: {
                        class: { include: { subject: true } },
                    },
                },
            },
        });
        if (!student)
            return null;
        const user = student.user;
        return {
            id: user?.id || '',
            email: user?.email || '',
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            isActive: user?.isActive ?? true,
            studentId: student.id,
            studentCode: student.studentCode || undefined,
            dateOfBirth: user?.birthDate || undefined,
            gender: (user?.gender ? String(user.gender).toLowerCase() : undefined),
            address: student.address || undefined,
            grade: student.grade || undefined,
            school: student.school ? {
                id: student.school.id,
                name: student.school.name,
                address: student.school.address || undefined,
                phone: student.school.phone || undefined,
            } : { id: '', name: '' },
            enrollments: (student.enrollments || []).map((e) => ({
                id: e.id,
                classId: e.classId,
                status: e.status,
                enrolledAt: e.enrolledAt,
                class: {
                    id: e.class?.id || '',
                    name: e.class?.name || '',
                    subject: e.class?.subject?.name || '',
                },
            })),
            parentLinks: student.parent ? [{
                    id: student.parent.id,
                    parentId: student.parent.id,
                    relation: undefined,
                    primaryContact: true,
                    parent: {
                        id: student.parent.id,
                        user: {
                            fullName: student.parent.user?.fullName || '',
                            email: student.parent.user?.email || '',
                            phone: student.parent.user?.phone || undefined,
                        }
                    }
                }] : [],
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map