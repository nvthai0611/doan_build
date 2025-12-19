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
exports.ScheduleChangeResponseDto = exports.RoomResponseDto = exports.TeacherResponseDto = exports.SessionResponseDto = exports.ClassResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class ClassResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, description: { required: false, type: () => String } };
    }
}
exports.ClassResponseDto = ClassResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ClassResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ClassResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ClassResponseDto.prototype, "description", void 0);
class SessionResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, sessionDate: { required: true, type: () => Date }, startTime: { required: true, type: () => String }, endTime: { required: true, type: () => String } };
    }
}
exports.SessionResponseDto = SessionResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], SessionResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "sessionDate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "endTime", void 0);
class TeacherResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, userId: { required: true, type: () => Number }, user: { required: true, type: () => ({ id: { required: true, type: () => Number }, fullName: { required: true, type: () => String }, email: { required: true, type: () => String } }) } };
    }
}
exports.TeacherResponseDto = TeacherResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], TeacherResponseDto.prototype, "userId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], TeacherResponseDto.prototype, "user", void 0);
class RoomResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, capacity: { required: true, type: () => Number } };
    }
}
exports.RoomResponseDto = RoomResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RoomResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], RoomResponseDto.prototype, "capacity", void 0);
class ScheduleChangeResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, classId: { required: true, type: () => Number }, class: { required: true, type: () => require("./schedule-change-response.dto").ClassResponseDto }, sessionId: { required: true, type: () => Number }, session: { required: true, type: () => require("./schedule-change-response.dto").SessionResponseDto }, changeType: { required: true, type: () => String }, newDate: { required: false, type: () => Date }, newStartTime: { required: false, type: () => String }, newEndTime: { required: false, type: () => String }, newRoomId: { required: false, type: () => Number }, newRoom: { required: false, type: () => require("./schedule-change-response.dto").RoomResponseDto }, reason: { required: true, type: () => String }, notes: { required: false, type: () => String }, status: { required: true, type: () => String }, teacherId: { required: true, type: () => Number }, teacher: { required: true, type: () => require("./schedule-change-response.dto").TeacherResponseDto }, createdBy: { required: true, type: () => Number }, approvedBy: { required: false, type: () => Number }, approvedAt: { required: false, type: () => Date }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.ScheduleChangeResponseDto = ScheduleChangeResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "classId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ClassResponseDto),
    __metadata("design:type", ClassResponseDto)
], ScheduleChangeResponseDto.prototype, "class", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => SessionResponseDto),
    __metadata("design:type", SessionResponseDto)
], ScheduleChangeResponseDto.prototype, "session", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "changeType", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ScheduleChangeResponseDto.prototype, "newDate", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "newStartTime", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "newEndTime", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "newRoomId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => RoomResponseDto),
    __metadata("design:type", RoomResponseDto)
], ScheduleChangeResponseDto.prototype, "newRoom", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "reason", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "notes", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => TeacherResponseDto),
    __metadata("design:type", TeacherResponseDto)
], ScheduleChangeResponseDto.prototype, "teacher", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ScheduleChangeResponseDto.prototype, "approvedBy", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ScheduleChangeResponseDto.prototype, "approvedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ScheduleChangeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ScheduleChangeResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=schedule-change-response.dto.js.map