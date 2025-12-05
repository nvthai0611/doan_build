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
exports.CommonController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_service_1 = require("../services/common.service");
const student_list_response_dto_1 = require("../dto/common/student-list-response.dto");
const student_detail_response_dto_1 = require("../dto/common/student-detail-response.dto");
const class_statistics_response_dto_1 = require("../dto/common/class-statistics-response.dto");
const prisma_service_1 = require("../../../db/prisma.service");
let CommonController = class CommonController {
    constructor(commonService, prisma) {
        this.commonService = commonService;
        this.prisma = prisma;
    }
    async getStudentsByClass(classId, req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                    data: null,
                };
            }
            const teacher = await this.prisma.teacher.findFirst({
                where: { userId: userId },
                select: { id: true }
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin giáo viên',
                    data: null,
                };
            }
            const result = await this.commonService.getListStudentOfClass(classId, teacher.id);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async getListStudentOfClass(classId, req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                    data: null,
                };
            }
            const teacher = await this.prisma.teacher.findFirst({
                where: { userId: userId },
                select: { id: true }
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin giáo viên',
                    data: null,
                };
            }
            const result = await this.commonService.getListStudentOfClass(classId, teacher.id);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async getDetailStudentOfClass(studentId, req, classId) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                    data: null,
                };
            }
            const teacher = await this.prisma.teacher.findFirst({
                where: { userId: userId },
                select: { id: true }
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin giáo viên',
                    data: null,
                };
            }
            const result = await this.commonService.getDetailStudentOfClass(studentId, classId, teacher.id);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async getClassStatistics(classId, req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                    data: null,
                };
            }
            const teacher = await this.prisma.teacher.findFirst({
                where: { userId: userId },
                select: { id: true }
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin giáo viên',
                    data: null,
                };
            }
            const result = await this.commonService.getClassStatistics(classId, teacher.id);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async getTeacherInfo(req) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                    data: null,
                };
            }
            const teacher = await this.prisma.teacher.findFirst({
                where: { userId: userId },
                select: { id: true }
            });
            if (!teacher) {
                return {
                    success: false,
                    message: 'Không tìm thấy thông tin giáo viên',
                    data: null,
                };
            }
            const result = await this.commonService.getTeacherInfo(teacher.id);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async getClassSessionsByClass(classId) {
        try {
            const result = await this.commonService.getClassSessionsByAssignment(classId);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
};
exports.CommonController = CommonController;
__decorate([
    (0, common_1.Get)('class/:classId/students'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách học sinh trong lớp (Frontend API)',
        description: 'API endpoint cho frontend để lấy danh sách học sinh trong lớp',
    }),
    (0, swagger_1.ApiParam)({
        name: 'classId',
        description: 'ID lớp học',
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách học sinh thành công',
        type: student_list_response_dto_1.StudentListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Lỗi request không hợp lệ',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Không có quyền truy cập',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getStudentsByClass", null);
__decorate([
    (0, common_1.Get)('students/:classId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách học sinh trong lớp',
        description: 'Lấy danh sách tất cả học sinh đang học trong lớp thông qua class ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'classId',
        description: 'ID lớp học',
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách học sinh thành công',
        type: student_list_response_dto_1.StudentListResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Lỗi request không hợp lệ',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Không có quyền truy cập',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getListStudentOfClass", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy chi tiết thông tin học sinh',
        description: 'Lấy thông tin chi tiết của một học sinh bao gồm lịch sử điểm danh, điểm số, thông tin phụ huynh',
    }),
    (0, swagger_1.ApiParam)({
        name: 'studentId',
        description: 'ID học sinh',
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'classId',
        description: 'ID lớp học (tùy chọn)',
        required: false,
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thông tin chi tiết học sinh thành công',
        type: student_detail_response_dto_1.StudentDetailResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Không tìm thấy học sinh',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getDetailStudentOfClass", null);
__decorate([
    (0, common_1.Get)('statistics/:classId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy thống kê lớp học',
        description: 'Lấy thống kê tổng quan về lớp học bao gồm số lượng học sinh, thống kê điểm danh, điểm số',
    }),
    (0, swagger_1.ApiParam)({
        name: 'classId',
        description: 'ID lớp học',
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy thống kê lớp học thành công',
        type: class_statistics_response_dto_1.ClassStatisticsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Lỗi request không hợp lệ',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getClassStatistics", null);
__decorate([
    (0, common_1.Get)('teacher-info'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy thông tin giáo viên',
        description: 'Lấy thông tin giáo viên',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getTeacherInfo", null);
__decorate([
    (0, common_1.Get)('class/:classId/sessions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lấy danh sách buổi học theo năm học hiện tại',
        description: 'Trả về danh sách buổi học của lớp theo class ID và academicYear hiện tại',
    }),
    (0, swagger_1.ApiParam)({
        name: 'classId',
        description: 'ID lớp học',
        example: 'uuid-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lấy danh sách buổi học thành công',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommonController.prototype, "getClassSessionsByClass", null);
exports.CommonController = CommonController = __decorate([
    (0, swagger_1.ApiTags)('Common - Quản lý chung'),
    (0, common_1.Controller)('common'),
    __metadata("design:paramtypes", [common_service_1.CommonService,
        prisma_service_1.PrismaService])
], CommonController);
//# sourceMappingURL=common.controller.js.map