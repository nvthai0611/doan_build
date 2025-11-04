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
exports.GetAlertsDto = exports.UpdateAlertDto = exports.CreateAlertDto = exports.AlertSeverity = exports.AlertType = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var AlertType;
(function (AlertType) {
    AlertType["PARENT_REGISTRATION"] = "parent_registration";
    AlertType["LEAVE_REQUEST"] = "leave_request";
    AlertType["SESSION_REQUEST"] = "session_request";
    AlertType["INCIDENT_REPORT"] = "incident_report";
    AlertType["ENROLLMENT"] = "enrollment";
    AlertType["PAYMENT"] = "payment";
    AlertType["STUDENT_CLASS_REQUEST"] = "student_class_request";
    AlertType["OTHER"] = "other";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity[AlertSeverity["LOW"] = 1] = "LOW";
    AlertSeverity[AlertSeverity["MEDIUM"] = 2] = "MEDIUM";
    AlertSeverity[AlertSeverity["HIGH"] = 3] = "HIGH";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
class CreateAlertDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { alertType: { required: true, enum: require("./alert.dto").AlertType }, title: { required: true, type: () => String }, message: { required: true, type: () => String }, severity: { required: false, enum: require("./alert.dto").AlertSeverity }, payload: { required: false, type: () => Object } };
    }
}
exports.CreateAlertDto = CreateAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AlertType, description: 'Loại cảnh báo' }),
    (0, class_validator_1.IsEnum)(AlertType),
    (0, class_validator_1.IsNotEmpty)({ message: 'Loại cảnh báo không được để trống' }),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "alertType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiêu đề cảnh báo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề không được để trống' }),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nội dung cảnh báo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung không được để trống' }),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: AlertSeverity,
        description: 'Mức độ nghiêm trọng',
        required: false,
    }),
    (0, class_validator_1.IsEnum)(AlertSeverity),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAlertDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dữ liệu bổ sung (JSON)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAlertDto.prototype, "payload", void 0);
class UpdateAlertDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { isRead: { required: false, type: () => Boolean }, processed: { required: false, type: () => Boolean } };
    }
}
exports.UpdateAlertDto = UpdateAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Đánh dấu là đã đọc', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAlertDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Đánh dấu là đã xử lý', required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAlertDto.prototype, "processed", void 0);
class GetAlertsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number }, limit: { required: false, type: () => Number }, alertType: { required: false, type: () => String }, severity: { required: false, type: () => String }, isRead: { required: false, type: () => Boolean }, processed: { required: false, type: () => Boolean } };
    }
}
exports.GetAlertsDto = GetAlertsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Số trang', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetAlertsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Số lượng mỗi trang',
        required: false,
        default: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetAlertsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc theo loại', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAlertsDto.prototype, "alertType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc theo mức độ nghiêm trọng', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAlertsDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc đã đọc/chưa đọc', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GetAlertsDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lọc đã xử lý/chưa xử lý', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GetAlertsDto.prototype, "processed", void 0);
//# sourceMappingURL=alert.dto.js.map