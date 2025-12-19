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
exports.QueryUserDto = exports.USER_SORT_FIELDS = exports.USER_STATUS_FILTER = exports.USER_ROLES_FILTER = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../../common/constants");
exports.USER_ROLES_FILTER = [
    'admin',
    'center_owner',
    'teacher',
    'parent',
    'student',
];
exports.USER_STATUS_FILTER = ['all', 'active', 'inactive'];
exports.USER_SORT_FIELDS = ['createdAt', 'fullName', 'username', 'role'];
class QueryUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, gender: { required: false, enum: require("../../../../common/constants").Gender }, status: { required: false, type: () => Object, enum: exports.USER_STATUS_FILTER }, role: { required: false, type: () => Object, enum: [...exports.USER_ROLES_FILTER, 'all'] }, roles: { required: false, type: () => [Object], enum: exports.USER_ROLES_FILTER }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String }, page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, sortBy: { required: false, type: () => Object, enum: exports.USER_SORT_FIELDS }, sortOrder: { required: false, type: () => Object, enum: ['asc', 'desc'] }, includeRelations: { required: false, type: () => Boolean } };
    }
}
exports.QueryUserDto = QueryUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(constants_1.Gender, { message: 'Giới tính không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.USER_STATUS_FILTER, { message: 'Trạng thái lọc không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([...exports.USER_ROLES_FILTER, 'all'], { message: 'Vai trò lọc không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(exports.USER_ROLES_FILTER, { each: true, message: 'Danh sách vai trò không hợp lệ' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return undefined;
        if (Array.isArray(value))
            return value;
        if (typeof value === 'string')
            return value.split(',').map((item) => item.trim());
        return undefined;
    }),
    __metadata("design:type", Array)
], QueryUserDto.prototype, "roles", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày bắt đầu không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày kết thúc không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.USER_SORT_FIELDS, { message: 'Trường sắp xếp không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asc', 'desc'], { message: 'Thứ tự sắp xếp không hợp lệ' }),
    __metadata("design:type", String)
], QueryUserDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((value) => value !== undefined),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryUserDto.prototype, "includeRelations", void 0);
//# sourceMappingURL=query-user.dto.js.map