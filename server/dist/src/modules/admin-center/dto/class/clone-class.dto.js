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
exports.CloneClassDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CloneClassDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, cloneSchedule: { required: false, type: () => Boolean }, cloneTeacher: { required: false, type: () => Boolean }, cloneStudents: { required: false, type: () => Boolean }, cloneRoom: { required: false, type: () => Boolean } };
    }
}
exports.CloneClassDto = CloneClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên lớp học mới', example: 'Toán 6K22-Clone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên lớp học là bắt buộc' }),
    __metadata("design:type", String)
], CloneClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clone lịch học', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CloneClassDto.prototype, "cloneSchedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clone giáo viên', example: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CloneClassDto.prototype, "cloneTeacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clone học sinh', example: false, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CloneClassDto.prototype, "cloneStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clone phòng học', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CloneClassDto.prototype, "cloneRoom", void 0);
//# sourceMappingURL=clone-class.dto.js.map