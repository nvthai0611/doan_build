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
exports.QueryScheduleMonthDto = exports.QueryScheduleWeekDto = exports.QueryScheduleDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class QueryScheduleDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { date: { required: false, type: () => String } };
    }
}
exports.QueryScheduleDto = QueryScheduleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryScheduleDto.prototype, "date", void 0);
class QueryScheduleWeekDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String } };
    }
}
exports.QueryScheduleWeekDto = QueryScheduleWeekDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryScheduleWeekDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryScheduleWeekDto.prototype, "endDate", void 0);
class QueryScheduleMonthDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { month: { required: true, type: () => String }, year: { required: true, type: () => String } };
    }
}
exports.QueryScheduleMonthDto = QueryScheduleMonthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryScheduleMonthDto.prototype, "month", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryScheduleMonthDto.prototype, "year", void 0);
//# sourceMappingURL=query-schedule.dto.js.map