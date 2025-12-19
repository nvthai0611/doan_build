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
exports.AffectedSessionCreateDto = exports.ReplacementTeacherDto = exports.ReplacementTeachersQueryDto = exports.AffectedSessionItemDto = exports.AffectedSessionsQueryDto = exports.LeaveRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class LeaveRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { leaveType: { required: true, type: () => String }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, reason: { required: true, type: () => String }, affectedSessions: { required: false, type: () => [require("./leave-request.dto").AffectedSessionCreateDto] }, image: { required: false, type: () => Object }, imageUrl: { required: false, type: () => String } };
    }
}
exports.LeaveRequestDto = LeaveRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại nghỉ', example: 'sick_leave' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ngày bắt đầu nghỉ (YYYY-MM-DD)',
        example: '2025-10-10',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ngày kết thúc nghỉ (YYYY-MM-DD)',
        example: '2025-10-12',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do xin nghỉ' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Danh sách sessions bị ảnh hưởng' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], LeaveRequestDto.prototype, "affectedSessions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File đính kèm' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], LeaveRequestDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL ảnh đính kèm' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "imageUrl", void 0);
class AffectedSessionsQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String } };
    }
}
exports.AffectedSessionsQueryDto = AffectedSessionsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ngày bắt đầu (YYYY-MM-DD)',
        example: '2025-10-10',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AffectedSessionsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ngày kết thúc (YYYY-MM-DD)',
        example: '2025-10-12',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AffectedSessionsQueryDto.prototype, "endDate", void 0);
class AffectedSessionItemDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sessionId: { required: true, type: () => String }, date: { required: true, type: () => String }, time: { required: true, type: () => String }, className: { required: true, type: () => String }, room: { required: true, type: () => String }, selected: { required: true, type: () => Boolean }, replacementTeacherId: { required: false, type: () => String } };
    }
}
exports.AffectedSessionItemDto = AffectedSessionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID buổi học' }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày học (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Khung giờ hiển thị', example: '08:00 - 10:00' }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp' }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "className", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phòng học', required: false }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mặc định chọn', example: true }),
    __metadata("design:type", Boolean)
], AffectedSessionItemDto.prototype, "selected", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID giáo viên dạy thay (nếu có)' }),
    __metadata("design:type", String)
], AffectedSessionItemDto.prototype, "replacementTeacherId", void 0);
class ReplacementTeachersQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { sessionId: { required: true, type: () => String }, date: { required: true, type: () => String }, time: { required: true, type: () => String } };
    }
}
exports.ReplacementTeachersQueryDto = ReplacementTeachersQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID buổi học', example: 'uuid-string' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReplacementTeachersQueryDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày học (YYYY-MM-DD)', example: '2025-10-10' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReplacementTeachersQueryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Khung giờ (HH:MM-HH:MM)',
        example: '08:00-10:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReplacementTeachersQueryDto.prototype, "time", void 0);
class ReplacementTeacherDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: false, type: () => String }, subjects: { required: true, type: () => [String] }, compatibilityScore: { required: true, type: () => Number }, compatibilityReason: { required: true, type: () => String }, isAvailable: { required: true, type: () => Boolean }, availabilityNote: { required: false, type: () => String } };
    }
}
exports.ReplacementTeacherDto = ReplacementTeacherDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID giáo viên' }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Họ và tên giáo viên' }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email giáo viên' }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Số điện thoại' }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Các môn học có thể dạy', type: [String] }),
    __metadata("design:type", Array)
], ReplacementTeacherDto.prototype, "subjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mức độ phù hợp (1-5)', example: 4 }),
    __metadata("design:type", Number)
], ReplacementTeacherDto.prototype, "compatibilityScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lý do phù hợp',
        example: 'Cùng dạy môn Toán, có kinh nghiệm lớp 12',
    }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "compatibilityReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Có sẵn sàng dạy thay không', example: true }),
    __metadata("design:type", Boolean)
], ReplacementTeacherDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ghi chú về lịch trình',
        example: 'Có thể dạy thay vào buổi sáng',
    }),
    __metadata("design:type", String)
], ReplacementTeacherDto.prototype, "availabilityNote", void 0);
class AffectedSessionCreateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, replacementTeacherId: { required: false, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.AffectedSessionCreateDto = AffectedSessionCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID buổi học' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AffectedSessionCreateDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID giáo viên thay thế' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AffectedSessionCreateDto.prototype, "replacementTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ghi chú cho session này' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AffectedSessionCreateDto.prototype, "notes", void 0);
//# sourceMappingURL=leave-request.dto.js.map