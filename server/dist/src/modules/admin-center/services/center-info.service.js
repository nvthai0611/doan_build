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
exports.CenterInfoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
const cloudinary_service_1 = require("../../cloudinary/cloudinary.service");
let CenterInfoService = class CenterInfoService {
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async getCenterInfo() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'center-info' },
        });
        if (!setting) {
            return {
                data: null,
                message: 'Chưa có thông tin trung tâm',
            };
        }
        return {
            data: setting,
            message: 'Lấy thông tin trung tâm thành công',
        };
    }
    async updateCenterInfo(dto, logoFile, bannerFile) {
        this.validateWorkingHours(dto.contact.workingHours);
        const existing = await this.prisma.systemSetting.findUnique({
            where: { key: 'center-info' },
        });
        const existingData = existing?.value;
        if (logoFile) {
            this.validateImageFile(logoFile);
            try {
                const result = await this.cloudinaryService.uploadImage(logoFile, 'center-info');
                dto.centerInfo.logo = result.secure_url;
            }
            catch (error) {
                throw new common_1.BadRequestException('Không thể upload logo lên Cloudinary');
            }
        }
        else if (existingData?.centerInfo?.logo) {
            dto.centerInfo.logo = existingData.centerInfo.logo;
        }
        if (bannerFile) {
            this.validateImageFile(bannerFile);
            try {
                const result = await this.cloudinaryService.uploadImage(bannerFile, 'center-info');
                dto.centerInfo.banner = result.secure_url;
            }
            catch (error) {
                throw new common_1.BadRequestException('Không thể upload banner lên Cloudinary');
            }
        }
        else if (existingData?.centerInfo?.banner) {
            dto.centerInfo.banner = existingData.centerInfo.banner;
        }
        const setting = await this.prisma.systemSetting.upsert({
            where: { key: 'center-info' },
            update: {
                group: 'center-profile',
                value: dto,
                description: 'Basic center information',
            },
            create: {
                key: 'center-info',
                group: 'center-profile',
                value: dto,
                description: 'Basic center information',
            },
        });
        return {
            data: setting,
            message: 'Cập nhật thông tin trung tâm thành công',
        };
    }
    validateImageFile(file) {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP, SVG)');
        }
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new common_1.BadRequestException('Dung lượng file tối đa 5MB');
        }
    }
    validateWorkingHours(workingHours) {
        const dayOrder = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
        ];
        for (const slot of workingHours) {
            const fromIndex = dayOrder.indexOf(slot.fromDay);
            const toIndex = dayOrder.indexOf(slot.toDay);
            if (fromIndex === -1 || toIndex === -1) {
                throw new common_1.BadRequestException('Ngày làm việc không hợp lệ');
            }
            if (fromIndex > toIndex) {
                throw new common_1.BadRequestException('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
            }
            if (slot.open >= slot.close) {
                throw new common_1.BadRequestException('Giờ mở cửa phải trước giờ đóng cửa');
            }
        }
    }
};
exports.CenterInfoService = CenterInfoService;
exports.CenterInfoService = CenterInfoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], CenterInfoService);
//# sourceMappingURL=center-info.service.js.map