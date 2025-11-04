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
exports.CreateScheduleChangeDto = exports.ScheduleChangeType = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ScheduleChangeType;
(function (ScheduleChangeType) {
    ScheduleChangeType["RESCHEDULE"] = "reschedule";
    ScheduleChangeType["CANCEL"] = "cancel";
    ScheduleChangeType["EXTEND"] = "extend";
})(ScheduleChangeType || (exports.ScheduleChangeType = ScheduleChangeType = {}));
class CreateScheduleChangeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { classId: { required: true, type: () => Number, minimum: 1 }, sessionId: { required: true, type: () => Number, minimum: 1 }, changeType: { required: true, enum: require("./create-schedule-change.dto").ScheduleChangeType }, newDate: { required: false, type: () => String }, newStartTime: { required: false, type: () => String }, newEndTime: { required: false, type: () => String }, newRoomId: { required: false, type: () => Number }, reason: { required: true, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.CreateScheduleChangeDto = CreateScheduleChangeDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateScheduleChangeDto.prototype, "classId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateScheduleChangeDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ScheduleChangeType),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "changeType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "newDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "newStartTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "newEndTime", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateScheduleChangeDto.prototype, "newRoomId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateScheduleChangeDto.prototype, "notes", void 0);
//# sourceMappingURL=create-schedule-change.dto.js.map