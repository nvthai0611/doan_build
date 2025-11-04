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
exports.ClassStatisticsResponseDto = exports.ClassStatisticsDataDto = exports.GradeStatsDto = exports.AttendanceStatsDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class AttendanceStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, _count: { required: true, type: () => ({ status: { required: true, type: () => Number } }) } };
    }
}
exports.AttendanceStatsDto = AttendanceStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái điểm danh' }),
    __metadata("design:type", String)
], AttendanceStatsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số lượng' }),
    __metadata("design:type", Object)
], AttendanceStatsDto.prototype, "_count", void 0);
class GradeStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { _avg: { required: false, type: () => ({ score: { required: false, type: () => Number } }) }, _max: { required: false, type: () => ({ score: { required: false, type: () => Number } }) }, _min: { required: false, type: () => ({ score: { required: false, type: () => Number } }) } };
    }
}
exports.GradeStatsDto = GradeStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm trung bình', required: false }),
    __metadata("design:type", Object)
], GradeStatsDto.prototype, "_avg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm cao nhất', required: false }),
    __metadata("design:type", Object)
], GradeStatsDto.prototype, "_max", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Điểm thấp nhất', required: false }),
    __metadata("design:type", Object)
], GradeStatsDto.prototype, "_min", void 0);
class ClassStatisticsDataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalStudents: { required: true, type: () => Number }, attendanceStats: { required: true, type: () => [require("./class-statistics-response.dto").AttendanceStatsDto] }, gradeStats: { required: true, type: () => require("./class-statistics-response.dto").GradeStatsDto } };
    }
}
exports.ClassStatisticsDataDto = ClassStatisticsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tổng số học sinh' }),
    __metadata("design:type", Number)
], ClassStatisticsDataDto.prototype, "totalStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thống kê điểm danh', type: [AttendanceStatsDto] }),
    __metadata("design:type", Array)
], ClassStatisticsDataDto.prototype, "attendanceStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thống kê điểm số' }),
    __metadata("design:type", GradeStatsDto)
], ClassStatisticsDataDto.prototype, "gradeStats", void 0);
class ClassStatisticsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { success: { required: true, type: () => Boolean }, data: { required: true, type: () => require("./class-statistics-response.dto").ClassStatisticsDataDto }, message: { required: true, type: () => String } };
    }
}
exports.ClassStatisticsResponseDto = ClassStatisticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái thành công' }),
    __metadata("design:type", Boolean)
], ClassStatisticsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dữ liệu thống kê', type: ClassStatisticsDataDto }),
    __metadata("design:type", ClassStatisticsDataDto)
], ClassStatisticsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo' }),
    __metadata("design:type", String)
], ClassStatisticsResponseDto.prototype, "message", void 0);
//# sourceMappingURL=class-statistics-response.dto.js.map