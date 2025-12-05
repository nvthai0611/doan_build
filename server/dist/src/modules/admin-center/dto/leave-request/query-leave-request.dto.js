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
exports.QueryLeaveRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class QueryLeaveRequestDto {
    constructor() {
        this.status = 'all';
        this.search = '';
        this.page = 1;
        this.limit = 10;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { teacherId: { required: false, type: () => String }, status: { required: false, type: () => String, default: "all" }, search: { required: false, type: () => String, default: "" }, fromDate: { required: false, type: () => String }, toDate: { required: false, type: () => String }, page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 10 } };
    }
}
exports.QueryLeaveRequestDto = QueryLeaveRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeaveRequestDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['all', 'pending', 'approved', 'rejected']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeaveRequestDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeaveRequestDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeaveRequestDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QueryLeaveRequestDto.prototype, "toDate", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryLeaveRequestDto.prototype, "page", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], QueryLeaveRequestDto.prototype, "limit", void 0);
//# sourceMappingURL=query-leave-request.dto.js.map