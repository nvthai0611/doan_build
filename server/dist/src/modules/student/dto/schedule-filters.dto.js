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
    static _OPENAPI_METADATA_FACTORY() {
        return { startDate: { required: false, type: () => String, pattern: "/^\\d{4}-\\d{2}-\\d{2}$/" }, endDate: { required: false, type: () => String, pattern: "/^\\d{4}-\\d{2}-\\d{2}$/" } };
    }
}
exports.ScheduleFiltersDto = ScheduleFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ngày bắt đầu (YYYY-MM-DD)',
        example: '2024-01-01',
        type: 'string',
        format: 'date'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'startDate phải có định dạng YYYY-MM-DD'
    }),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ngày kết thúc (YYYY-MM-DD)',
        example: '2024-12-31',
        type: 'string',
        format: 'date'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'endDate phải có định dạng YYYY-MM-DD'
    }),
    (0, class_validator_1.ValidateIf)((o) => o.startDate && o.endDate),
    __metadata("design:type", String)
], ScheduleFiltersDto.prototype, "endDate", void 0);
//# sourceMappingURL=schedule-filters.dto.js.map