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
exports.ScholarshipManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let ScholarshipManagementService = class ScholarshipManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        try {
            const { page = 1, limit = 10, search, isActive } = query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            const total = await this.prisma.scholarship.count({ where });
            const scholarships = await this.prisma.scholarship.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    _count: {
                        select: {
                            student: true,
                        },
                    },
                },
            });
            const totalPages = Math.ceil(total / limit);
            return {
                data: scholarships.map((scholarship) => ({
                    id: scholarship.id,
                    name: scholarship.name,
                    description: scholarship.description,
                    percent: Number(scholarship.percent),
                    criteria: scholarship.criteria,
                    isActive: scholarship.isActive,
                    createdAt: scholarship.createdAt,
                    updatedAt: scholarship.updatedAt,
                    studentCount: scholarship._count.student,
                })),
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi khi lấy danh sách học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const scholarship = await this.prisma.scholarship.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            student: true,
                        },
                    },
                },
            });
            if (!scholarship) {
                throw new common_1.HttpException('Không tìm thấy học bổng', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: scholarship.id,
                name: scholarship.name,
                description: scholarship.description,
                percent: Number(scholarship.percent),
                criteria: scholarship.criteria,
                isActive: scholarship.isActive,
                createdAt: scholarship.createdAt,
                updatedAt: scholarship.updatedAt,
                studentCount: scholarship._count.student,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi lấy thông tin học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(createScholarshipDto) {
        try {
            const scholarship = await this.prisma.scholarship.create({
                data: {
                    name: createScholarshipDto.name,
                    description: createScholarshipDto.description ?? null,
                    percent: createScholarshipDto.percent,
                    criteria: createScholarshipDto.criteria ?? null,
                    isActive: createScholarshipDto.isActive ?? true,
                },
            });
            return {
                id: scholarship.id,
                name: scholarship.name,
                description: scholarship.description,
                percent: Number(scholarship.percent),
                criteria: scholarship.criteria,
                isActive: scholarship.isActive,
                createdAt: scholarship.createdAt,
                updatedAt: scholarship.updatedAt,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi khi tạo học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateScholarshipDto) {
        try {
            const existingScholarship = await this.prisma.scholarship.findUnique({
                where: { id },
            });
            if (!existingScholarship) {
                throw new common_1.HttpException('Không tìm thấy học bổng', common_1.HttpStatus.NOT_FOUND);
            }
            const updateData = {};
            if (updateScholarshipDto.name !== undefined)
                updateData.name = updateScholarshipDto.name;
            if (updateScholarshipDto.description !== undefined)
                updateData.description = updateScholarshipDto.description;
            if (updateScholarshipDto.percent !== undefined)
                updateData.percent = updateScholarshipDto.percent;
            if (updateScholarshipDto.criteria !== undefined)
                updateData.criteria = updateScholarshipDto.criteria;
            if (updateScholarshipDto.isActive !== undefined)
                updateData.isActive = updateScholarshipDto.isActive;
            const scholarship = await this.prisma.scholarship.update({
                where: { id },
                data: updateData,
            });
            return {
                id: scholarship.id,
                name: scholarship.name,
                description: scholarship.description,
                percent: Number(scholarship.percent),
                criteria: scholarship.criteria,
                isActive: scholarship.isActive,
                createdAt: scholarship.createdAt,
                updatedAt: scholarship.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi cập nhật học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const existingScholarship = await this.prisma.scholarship.findUnique({
                where: { id },
                include: {
                    student: true,
                },
            });
            if (!existingScholarship) {
                throw new common_1.HttpException('Không tìm thấy học bổng', common_1.HttpStatus.NOT_FOUND);
            }
            if (existingScholarship.student.length > 0) {
                throw new common_1.HttpException('Không thể xóa học bổng đang được sử dụng bởi học sinh', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.scholarship.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'Xóa học bổng thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi xóa học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async assignToStudent(studentId, scholarshipId) {
        try {
            const student = await this.prisma.student.findUnique({
                where: { id: studentId },
            });
            if (!student) {
                throw new common_1.HttpException('Không tìm thấy học sinh', common_1.HttpStatus.NOT_FOUND);
            }
            if (scholarshipId) {
                const scholarship = await this.prisma.scholarship.findUnique({
                    where: { id: scholarshipId },
                });
                if (!scholarship) {
                    throw new common_1.HttpException('Không tìm thấy học bổng', common_1.HttpStatus.NOT_FOUND);
                }
                if (!scholarship.isActive) {
                    throw new common_1.HttpException('Không thể gán học bổng không hoạt động', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const updatedStudent = await this.prisma.student.update({
                where: { id: studentId },
                data: {
                    scholarshipId: scholarshipId || null,
                },
                include: {
                    user: true,
                    scholarship: true,
                },
            });
            return {
                id: updatedStudent.id,
                studentCode: updatedStudent.studentCode,
                fullName: updatedStudent.user.fullName,
                scholarship: updatedStudent.scholarship
                    ? {
                        id: updatedStudent.scholarship.id,
                        name: updatedStudent.scholarship.name,
                        percent: Number(updatedStudent.scholarship.percent),
                    }
                    : null,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi gán học bổng: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScholarshipManagementService = ScholarshipManagementService;
exports.ScholarshipManagementService = ScholarshipManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScholarshipManagementService);
//# sourceMappingURL=scholarship-management.service.js.map