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
exports.UpdateScheduleStatusDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateScheduleStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => Object, enum: ['completed', 'cancelled'] }, notes: { required: false, type: () => String } };
    }
}
exports.UpdateScheduleStatusDto = UpdateScheduleStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trạng thái mới của buổi dạy',
        enum: ['completed', 'cancelled'],
        example: 'completed'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['completed', 'cancelled']),
    __metadata("design:type", String)
], UpdateScheduleStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ghi chú khi cập nhật trạng thái',
        example: 'Buổi dạy đã hoàn thành thành công'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScheduleStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=update-schedule-status.dto.js.map