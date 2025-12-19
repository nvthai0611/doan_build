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
exports.ShowcaseManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
const validate_util_1 = require("../../../utils/validate.util");
let ShowcaseManagementService = class ShowcaseManagementService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getAllShowcases(params) {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (params?.search) {
                where.OR = [
                    { title: { contains: params.search, mode: 'insensitive' } },
                    { achievement: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } },
                ];
            }
            if (params?.featured !== undefined) {
                where.featured = params.featured;
            }
            const [showcases, total] = await Promise.all([
                this.prisma.showcase.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [
                        { featured: 'desc' },
                        { order: 'asc' },
                        { publishedAt: 'desc' },
                    ],
                }),
                this.prisma.showcase.count({ where }),
            ]);
            return {
                data: showcases,
                message: 'Lấy danh sách học sinh tiêu biểu thành công',
                success: true,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy danh sách học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getShowcaseById(id) {
        try {
            if (!(0, validate_util_1.checkId)(id)) {
                throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const showcase = await this.prisma.showcase.findUnique({
                where: { id },
            });
            if (!showcase) {
                throw new common_1.HttpException('Không tìm thấy học sinh tiêu biểu', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                data: showcase,
                message: 'Lấy thông tin học sinh tiêu biểu thành công',
                success: true,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi lấy thông tin học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createShowcase(createShowcaseDto) {
        try {
            if (!createShowcaseDto.title) {
                throw new common_1.HttpException('Tiêu đề là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!createShowcaseDto.studentImage) {
                throw new common_1.HttpException('Ảnh học sinh là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!createShowcaseDto.achievement) {
                throw new common_1.HttpException('Thành tích là bắt buộc', common_1.HttpStatus.BAD_REQUEST);
            }
            let imageUrl;
            if (createShowcaseDto.studentImage &&
                typeof createShowcaseDto.studentImage !== 'string') {
                const uploadResult = await this.cloudinaryService.uploadImage(createShowcaseDto.studentImage, 'showcases');
                imageUrl = uploadResult.secure_url;
            }
            else {
                imageUrl = createShowcaseDto.studentImage;
            }
            if (createShowcaseDto.order === undefined) {
                const maxOrder = await this.prisma.showcase.aggregate({
                    _max: { order: true },
                });
                createShowcaseDto.order = (maxOrder._max.order || 0) + 1;
            }
            const showcase = await this.prisma.showcase.create({
                data: {
                    title: createShowcaseDto.title,
                    description: createShowcaseDto.description,
                    studentImage: imageUrl,
                    achievement: createShowcaseDto.achievement,
                    featured: createShowcaseDto.featured || false,
                    order: createShowcaseDto.order,
                    publishedAt: createShowcaseDto.publishedAt || new Date(),
                },
            });
            return {
                data: showcase,
                message: 'Tạo học sinh tiêu biểu thành công',
                success: true,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi tạo học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateShowcase(id, updateShowcaseDto) {
        try {
            if (!(0, validate_util_1.checkId)(id)) {
                throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const existingShowcase = await this.prisma.showcase.findUnique({
                where: { id },
            });
            if (!existingShowcase) {
                throw new common_1.HttpException('Không tìm thấy học sinh tiêu biểu', common_1.HttpStatus.NOT_FOUND);
            }
            let imageUrl;
            if (updateShowcaseDto.studentImage) {
                if (typeof updateShowcaseDto.studentImage !== 'string') {
                    const uploadResult = await this.cloudinaryService.uploadImage(updateShowcaseDto.studentImage, 'showcases');
                    imageUrl = uploadResult.secure_url;
                }
                else {
                    imageUrl = updateShowcaseDto.studentImage;
                }
            }
            const updateData = {
                ...(updateShowcaseDto.title && { title: updateShowcaseDto.title }),
                ...(updateShowcaseDto.description !== undefined && {
                    description: updateShowcaseDto.description,
                }),
                ...(imageUrl && { studentImage: imageUrl }),
                ...(updateShowcaseDto.achievement && {
                    achievement: updateShowcaseDto.achievement,
                }),
                ...(updateShowcaseDto.featured !== undefined && {
                    featured: updateShowcaseDto.featured,
                }),
                ...(updateShowcaseDto.order !== undefined && {
                    order: updateShowcaseDto.order,
                }),
                ...(updateShowcaseDto.publishedAt !== undefined && {
                    publishedAt: updateShowcaseDto.publishedAt,
                }),
            };
            const showcase = await this.prisma.showcase.update({
                where: { id },
                data: updateData,
            });
            return {
                data: showcase,
                message: 'Cập nhật học sinh tiêu biểu thành công',
                success: true,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi cập nhật học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteShowcase(id) {
        try {
            if (!(0, validate_util_1.checkId)(id)) {
                throw new common_1.HttpException('ID không hợp lệ', common_1.HttpStatus.BAD_REQUEST);
            }
            const existingShowcase = await this.prisma.showcase.findUnique({
                where: { id },
            });
            if (!existingShowcase) {
                throw new common_1.HttpException('Không tìm thấy học sinh tiêu biểu', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.showcase.delete({
                where: { id },
            });
            return {
                data: null,
                message: 'Xóa học sinh tiêu biểu thành công',
                success: true,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || 'Lỗi khi xóa học sinh tiêu biểu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ShowcaseManagementService = ShowcaseManagementService;
exports.ShowcaseManagementService = ShowcaseManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ShowcaseManagementService);
//# sourceMappingURL=showcase-management.service.js.map