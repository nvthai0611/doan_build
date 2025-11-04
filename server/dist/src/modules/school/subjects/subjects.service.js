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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let SubjectsService = class SubjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            const subjects = await this.prisma.subject.findMany({
                orderBy: { name: 'asc' }
            });
            return {
                success: true,
                message: 'Lấy danh sách môn học thành công',
                data: subjects
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách môn học',
                error: error.message
            };
        }
    }
    async findOne(id) {
        try {
            const subject = await this.prisma.subject.findUnique({
                where: { id }
            });
            if (!subject) {
                return {
                    success: false,
                    message: 'Không tìm thấy môn học'
                };
            }
            return {
                success: true,
                message: 'Lấy thông tin môn học thành công',
                data: subject
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra',
                error: error.message
            };
        }
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map