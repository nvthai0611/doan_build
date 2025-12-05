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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassInformationController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const class_information_service_1 = require("../services/class-information.service");
const prisma_service_1 = require("../../../db/prisma.service");
const session_status_util_1 = require("../../../utils/session-status.util");
let ClassInformationController = class ClassInformationController {
    constructor(classInfoService, prisma) {
        this.classInfoService = classInfoService;
        this.prisma = prisma;
    }
    async getEnrolledSubjects(req) {
        const studentId = req.user?.studentId;
        const data = await this.classInfoService.getEnrolledSubjectsByStudent(studentId);
        return { data, message: 'Lấy danh sách môn học đã ghi danh thành công' };
    }
    async getStudentsOfClass(classId) {
        const data = await this.classInfoService.getStudentsOfClassForStudent(classId);
        return { data, message: 'Lấy danh sách thành viên lớp thành công' };
    }
    async getClassDetail(classId) {
        const data = await this.classInfoService.getClassDetailForStudent(classId);
        return { data, message: 'Lấy chi tiết lớp học thành công' };
    }
    async getClassSessionsForStudent(classId, req) {
        const studentId = req.user?.studentId;
        const sessions = await this.prisma.classSession.findMany({
            where: { classId },
            orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
            include: {
                room: true,
                attendances: {
                    where: { studentId },
                    select: {
                        id: true,
                        status: true,
                        note: true,
                        recordedAt: true,
                    },
                    take: 1,
                },
            },
        });
        const data = sessions.map((s) => {
            const attendance = s.attendances[0];
            return {
                id: s.id,
                classId: s.classId,
                sessionDate: s.sessionDate,
                startTime: s.startTime,
                endTime: s.endTime,
                status: (0, session_status_util_1.getSessionStatus)(s),
                room: s.room ? { id: s.room.id, name: s.room.name } : null,
                attendanceStatus: attendance?.status || null,
                attendanceNote: attendance?.note || null,
                attendanceRecordedAt: attendance?.recordedAt || null,
            };
        });
        return { data, message: 'Lấy danh sách buổi học của lớp thành công' };
    }
};
exports.ClassInformationController = ClassInformationController;
__decorate([
    (0, common_1.Get)('enrolled-subjects'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassInformationController.prototype, "getEnrolledSubjects", null);
__decorate([
    (0, common_1.Get)('classes/:classId/students'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassInformationController.prototype, "getStudentsOfClass", null);
__decorate([
    (0, common_1.Get)('classes/:classId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassInformationController.prototype, "getClassDetail", null);
__decorate([
    (0, common_1.Get)('classes/:classId/sessions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassInformationController.prototype, "getClassSessionsForStudent", null);
exports.ClassInformationController = ClassInformationController = __decorate([
    (0, common_1.Controller)('class-information'),
    __metadata("design:paramtypes", [class_information_service_1.ClassInformationService, prisma_service_1.PrismaService])
], ClassInformationController);
//# sourceMappingURL=class-information.controller.js.map