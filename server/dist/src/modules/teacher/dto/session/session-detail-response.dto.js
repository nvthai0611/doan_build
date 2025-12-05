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
exports.SessionDetailResponseDto = exports.StudentInSessionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class StudentInSessionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, avatar: { required: false, type: () => String }, attendanceStatus: { required: false, type: () => String } };
    }
}
exports.StudentInSessionDto = StudentInSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID học viên' }),
    __metadata("design:type", String)
], StudentInSessionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên học viên' }),
    __metadata("design:type", String)
], StudentInSessionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Avatar học viên', required: false }),
    __metadata("design:type", String)
], StudentInSessionDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái điểm danh', required: false }),
    __metadata("design:type", String)
], StudentInSessionDto.prototype, "attendanceStatus", void 0);
class SessionDetailResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, date: { required: true, type: () => String }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, subject: { required: true, type: () => String }, className: { required: true, type: () => String }, room: { required: true, type: () => String }, studentCount: { required: true, type: () => Number }, status: { required: true, type: () => String }, notes: { required: false, type: () => String }, type: { required: true, type: () => String }, teacherId: { required: true, type: () => String }, teacherName: { required: false, type: () => String }, students: { required: false, type: () => [require("./session-detail-response.dto").StudentInSessionDto] }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.SessionDetailResponseDto = SessionDetailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID buổi học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày diễn ra (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên môn học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "className", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên phòng học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số lượng học viên' }),
    __metadata("design:type", Number)
], SessionDetailResponseDto.prototype, "studentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái buổi học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú', required: false }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại buổi học' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID giáo viên' }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên giáo viên', required: false }),
    __metadata("design:type", String)
], SessionDetailResponseDto.prototype, "teacherName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách học viên', type: [StudentInSessionDto], required: false }),
    __metadata("design:type", Array)
], SessionDetailResponseDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thời gian tạo' }),
    __metadata("design:type", Date)
], SessionDetailResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thời gian cập nhật' }),
    __metadata("design:type", Date)
], SessionDetailResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=session-detail-response.dto.js.map