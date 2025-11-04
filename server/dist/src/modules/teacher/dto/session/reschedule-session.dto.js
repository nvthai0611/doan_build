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
exports.RescheduleSessionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RescheduleSessionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { newDate: { required: true, type: () => String }, newStartTime: { required: true, type: () => String }, newEndTime: { required: true, type: () => String }, newRoomId: { required: false, type: () => String }, reason: { required: true, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.RescheduleSessionDto = RescheduleSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ngày mới (YYYY-MM-DD)',
        example: '2024-10-15'
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "newDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Giờ bắt đầu mới',
        example: '14:00'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "newStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Giờ kết thúc mới',
        example: '16:00'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "newEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID phòng học mới',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "newRoomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lý do dời lịch',
        example: 'Giáo viên bị ốm'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ghi chú thêm',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RescheduleSessionDto.prototype, "notes", void 0);
//# sourceMappingURL=reschedule-session.dto.js.map