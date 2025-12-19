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
exports.SessionRequestResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class SessionRequestResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, requestType: { required: true, type: () => String }, sessionDate: { required: true, type: () => String }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String }, reason: { required: true, type: () => String }, notes: { required: false, type: () => String }, status: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, approvedAt: { required: false, type: () => Date }, class: { required: true, type: () => ({ id: { required: true, type: () => String }, name: { required: true, type: () => String }, subject: { required: true, type: () => ({ name: { required: true, type: () => String } }) } }) }, room: { required: false, type: () => ({ id: { required: true, type: () => String }, name: { required: true, type: () => String } }) }, teacher: { required: true, type: () => ({ id: { required: true, type: () => String }, user: { required: true, type: () => ({ fullName: { required: true, type: () => String } }) } }) }, createdByUser: { required: true, type: () => ({ id: { required: true, type: () => String }, fullName: { required: true, type: () => String } }) }, approvedByUser: { required: false, type: () => ({ id: { required: true, type: () => String }, fullName: { required: true, type: () => String } }) } };
    }
}
exports.SessionRequestResponseDto = SessionRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID của yêu cầu' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại yêu cầu' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "requestType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày buổi học' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "sessionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ bắt đầu' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Giờ kết thúc' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lý do yêu cầu' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ghi chú', required: false }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trạng thái yêu cầu' }),
    __metadata("design:type", String)
], SessionRequestResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày tạo' }),
    __metadata("design:type", Date)
], SessionRequestResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ngày duyệt', required: false }),
    __metadata("design:type", Date)
], SessionRequestResponseDto.prototype, "approvedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin lớp học' }),
    __metadata("design:type", Object)
], SessionRequestResponseDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin phòng học', required: false }),
    __metadata("design:type", Object)
], SessionRequestResponseDto.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông tin giáo viên' }),
    __metadata("design:type", Object)
], SessionRequestResponseDto.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Người tạo yêu cầu' }),
    __metadata("design:type", Object)
], SessionRequestResponseDto.prototype, "createdByUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Người duyệt yêu cầu', required: false }),
    __metadata("design:type", Object)
], SessionRequestResponseDto.prototype, "approvedByUser", void 0);
//# sourceMappingURL=session-request-response.dto.js.map