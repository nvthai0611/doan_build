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
exports.ScheduleFiltersDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ScheduleFiltersDto {
    constructor() {
        this.status = 'all';
        this.type = 'all';
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String, default: "all", enum: ['scheduled', 'completed', 'cancelled', 'all'] }, type: { required: false, type: () => String, default: "all", enum: ['regular', 'exam', 'makeup', 'all'] }, fromDate: { required: false, type: () => String }, toDate: { required: false, type: () => String }, search: { required: false, type: () => String } };
    }
}
exports.ScheduleFiltersDto = ScheduleFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Trạng thái buổi dạy',
        enum: ['scheduled', 'completed', 'cancelled', 'all'],
        default: 'all'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['scheduled', 'completed', 'cancelled', 'all']),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Loại buổi dạy',
        enum: ['regular', 'exam', 'makeup', 'all'],
        default: 'all'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['regular', 'exam', 'makeup', 'all']),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Từ ngày (YYYY-MM-DD)',
        example: '2024-09-01'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Đến ngày (YYYY-MM-DD)',
        example: '2024-09-30'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Từ khóa tìm kiếm (môn học, lớp, phòng)',
        example: 'Toán học'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "search", void 0);
//# sourceMappingURL=schedule-filters.dto.js.map