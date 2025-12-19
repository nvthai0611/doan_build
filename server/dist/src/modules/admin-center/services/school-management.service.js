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
exports.SchoolManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let SchoolManagementService = class SchoolManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            const schools = await this.prisma.school.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    _count: {
                        select: {
                            students: true,
                            teachers: true,
                        },
                    },
                },
            });
            return schools.map((school) => ({
                id: school.id,
                name: school.name,
                address: school.address ?? null,
                phone: school.phone ?? null,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt,
                studentCount: school._count.students,
                teacherCount: school._count.teachers,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi khi lấy danh sách trường học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats() {
        try {
            const [totalSchools, totalStudents, totalTeachers] = await Promise.all([
                this.prisma.school.count(),
                this.prisma.student.count(),
                this.prisma.teacher.count(),
            ]);
            return {
                totalSchools,
                totalStudents,
                totalTeachers,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi khi lấy thống kê: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const school = await this.prisma.school.findUnique({
                where: { id },
            });
            if (!school) {
                throw new common_1.HttpException('Không tìm thấy trường học', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: school.id,
                name: school.name,
                address: school.address ?? null,
                phone: school.phone ?? null,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi lấy thông tin trường học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(createSchoolDto) {
        try {
            const existingSchool = await this.prisma.school.findFirst({
                where: {
                    name: {
                        equals: createSchoolDto.name,
                        mode: 'insensitive',
                    },
                },
            });
            if (existingSchool) {
                throw new common_1.HttpException(`Trường học với tên "${createSchoolDto.name}" đã tồn tại`, common_1.HttpStatus.BAD_REQUEST);
            }
            const school = await this.prisma.school.create({
                data: {
                    name: createSchoolDto.name,
                    address: createSchoolDto.address ?? null,
                    phone: createSchoolDto.phone ?? null,
                },
            });
            return {
                id: school.id,
                name: school.name,
                address: school.address ?? null,
                phone: school.phone ?? null,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi tạo trường học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateSchoolDto) {
        try {
            const existingSchool = await this.prisma.school.findUnique({
                where: { id },
            });
            if (!existingSchool) {
                throw new common_1.HttpException('Không tìm thấy trường học', common_1.HttpStatus.NOT_FOUND);
            }
            if (updateSchoolDto.name && updateSchoolDto.name !== existingSchool.name) {
                const duplicateSchool = await this.prisma.school.findFirst({
                    where: {
                        name: {
                            equals: updateSchoolDto.name,
                            mode: 'insensitive',
                        },
                        id: {
                            not: id,
                        },
                    },
                });
                if (duplicateSchool) {
                    throw new common_1.HttpException(`Trường học với tên "${updateSchoolDto.name}" đã tồn tại`, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const updateData = {};
            if (updateSchoolDto.name !== undefined)
                updateData.name = updateSchoolDto.name;
            if (updateSchoolDto.address !== undefined)
                updateData.address = updateSchoolDto.address;
            if (updateSchoolDto.phone !== undefined)
                updateData.phone = updateSchoolDto.phone;
            const school = await this.prisma.school.update({
                where: { id },
                data: updateData,
            });
            return {
                id: school.id,
                name: school.name,
                address: school.address ?? null,
                phone: school.phone ?? null,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi cập nhật trường học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const existingSchool = await this.prisma.school.findUnique({
                where: { id },
                include: {
                    students: true,
                    teachers: true,
                },
            });
            if (!existingSchool) {
                throw new common_1.HttpException('Không tìm thấy trường học', common_1.HttpStatus.NOT_FOUND);
            }
            if (existingSchool.students.length > 0 || existingSchool.teachers.length > 0) {
                throw new common_1.HttpException('Không thể xóa trường học đang có học sinh hoặc giáo viên', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.school.delete({
                where: { id },
            });
            return {
                success: true,
                message: 'Xóa trường học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi xóa trường học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SchoolManagementService = SchoolManagementService;
exports.SchoolManagementService = SchoolManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolManagementService);
//# sourceMappingURL=school-management.service.js.map