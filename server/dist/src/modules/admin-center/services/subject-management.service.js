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
exports.SubjectManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let SubjectManagementService = class SubjectManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const subjects = await this.prisma.subject.findMany({
            orderBy: { name: 'asc' },
        });
        return subjects.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            description: s.description ?? null,
        }));
    }
    async findOne(id) {
        const s = await this.prisma.subject.findUnique({ where: { id } });
        if (!s)
            throw new common_1.HttpException('Không tìm thấy môn học', common_1.HttpStatus.NOT_FOUND);
        return { id: s.id, code: s.code, name: s.name, description: s.description ?? null };
    }
    async create(dto) {
        const existCode = await this.prisma.subject.findUnique({ where: { code: dto.code } });
        if (existCode)
            throw new common_1.HttpException('Mã môn học đã tồn tại', common_1.HttpStatus.BAD_REQUEST);
        const subject = await this.prisma.subject.create({ data: { code: dto.code, name: dto.name, description: dto.description ?? null } });
        return { id: subject.id, code: subject.code, name: subject.name, description: subject.description ?? null };
    }
    async update(id, dto) {
        const current = await this.prisma.subject.findUnique({ where: { id } });
        if (!current)
            throw new common_1.HttpException('Không tìm thấy môn học', common_1.HttpStatus.NOT_FOUND);
        if (dto.code && dto.code !== current.code) {
            const duplicate = await this.prisma.subject.findUnique({ where: { code: dto.code } });
            if (duplicate)
                throw new common_1.HttpException('Mã môn học đã tồn tại', common_1.HttpStatus.BAD_REQUEST);
        }
        const s = await this.prisma.subject.update({ where: { id }, data: { code: dto.code ?? current.code, name: dto.name ?? current.name, description: dto.description !== undefined ? dto.description : current.description } });
        return { id: s.id, code: s.code, name: s.name, description: s.description ?? null };
    }
    async remove(id) {
        const current = await this.prisma.subject.findUnique({ where: { id }, include: { classes: true } });
        if (!current)
            throw new common_1.HttpException('Không tìm thấy môn học', common_1.HttpStatus.NOT_FOUND);
        if (current.classes && current.classes.length > 0) {
            throw new common_1.HttpException('Không thể xóa môn học đang được sử dụng trong lớp học', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.prisma.subject.delete({ where: { id } });
    }
};
exports.SubjectManagementService = SubjectManagementService;
exports.SubjectManagementService = SubjectManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectManagementService);
//# sourceMappingURL=subject-management.service.js.map