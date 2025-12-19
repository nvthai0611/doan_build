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
exports.GradesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const grade_service_1 = require("../services/grade.service");
const swagger_1 = require("@nestjs/swagger");
let GradesController = class GradesController {
    constructor(gradeService) {
        this.gradeService = gradeService;
    }
    async findAll() {
        return this.gradeService.findAll();
    }
};
exports.GradesController = GradesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách khối lớp' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GradesController.prototype, "findAll", null);
exports.GradesController = GradesController = __decorate([
    (0, swagger_1.ApiTags)('Shared - Grades'),
    (0, common_1.Injectable)(),
    (0, common_1.Controller)('grades'),
    __metadata("design:paramtypes", [grade_service_1.GradeService])
], GradesController);
//# sourceMappingURL=grades.controller.js.map