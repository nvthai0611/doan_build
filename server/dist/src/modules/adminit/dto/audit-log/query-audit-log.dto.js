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
exports.QueryAuditLogDto = exports.AUDIT_SORT_FIELDS = exports.AUDIT_ACTION_FILTER = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
exports.AUDIT_ACTION_FILTER = [
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'all',
];
exports.AUDIT_SORT_FIELDS = ['timestamp', 'action', 'tableName'];
class QueryAuditLogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, action: { required: false, type: () => Object, enum: exports.AUDIT_ACTION_FILTER }, tableName: { required: false, type: () => String }, userId: { required: false, type: () => String }, recordId: { required: false, type: () => String }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String }, page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, sortBy: { required: false, type: () => Object, enum: exports.AUDIT_SORT_FIELDS }, sortOrder: { required: false, type: () => Object, enum: ['asc', 'desc'] } };
    }
}
exports.QueryAuditLogDto = QueryAuditLogDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.AUDIT_ACTION_FILTER, { message: 'Hành động lọc không hợp lệ' }),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "tableName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "recordId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày bắt đầu không hợp lệ' }),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày kết thúc không hợp lệ' }),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryAuditLogDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryAuditLogDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.AUDIT_SORT_FIELDS, { message: 'Trường sắp xếp không hợp lệ' }),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asc', 'desc'], { message: 'Thứ tự sắp xếp không hợp lệ' }),
    __metadata("design:type", String)
], QueryAuditLogDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-audit-log.dto.js.map