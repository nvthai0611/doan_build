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
exports.ScheduleChangeFiltersDto = exports.ScheduleChangeStatus = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ScheduleChangeStatus;
(function (ScheduleChangeStatus) {
    ScheduleChangeStatus["PENDING"] = "pending";
    ScheduleChangeStatus["APPROVED"] = "approved";
    ScheduleChangeStatus["REJECTED"] = "rejected";
    ScheduleChangeStatus["CANCELLED"] = "cancelled";
})(ScheduleChangeStatus || (exports.ScheduleChangeStatus = ScheduleChangeStatus = {}));
class ScheduleChangeFiltersDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, default: 1, minimum: 1 }, limit: { required: false, type: () => Number, default: 10, minimum: 1 }, status: { required: false, enum: require("./schedule-change-filters.dto").ScheduleChangeStatus }, changeType: { required: false, type: () => String }, classId: { required: false, type: () => Number, minimum: 1 } };
    }
}
exports.ScheduleChangeFiltersDto = ScheduleChangeFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], ScheduleChangeFiltersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], ScheduleChangeFiltersDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ScheduleChangeStatus),
    __metadata("design:type", String)
], ScheduleChangeFiltersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleChangeFiltersDto.prototype, "changeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], ScheduleChangeFiltersDto.prototype, "classId", void 0);
//# sourceMappingURL=schedule-change-filters.dto.js.map