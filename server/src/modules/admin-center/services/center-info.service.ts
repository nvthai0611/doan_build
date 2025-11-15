import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CenterInfoSettingDto } from '../dto/setting/center-info.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class CenterInfoService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

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

  async updateCenterInfo(
    dto: CenterInfoSettingDto,
    logoFile?: Express.Multer.File,
    bannerFile?: Express.Multer.File,
  ) {
    // Validate working hours
    this.validateWorkingHours(dto.contact.workingHours);

    // Lấy data hiện tại để giữ URL cũ nếu không có file mới
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key: 'center-info' },
    });
    const existingData = existing?.value as Partial<CenterInfoSettingDto> | null;

    // Upload logo nếu có file mới
    if (logoFile) {
      this.validateImageFile(logoFile);
      try {
        const result = await this.cloudinaryService.uploadImage(logoFile, 'center-info');
        dto.centerInfo.logo = result.secure_url;
      } catch (error) {
        throw new BadRequestException('Không thể upload logo lên Cloudinary');
      }
    } else if (existingData?.centerInfo?.logo) {
      // Giữ lại URL cũ nếu không có file mới
      dto.centerInfo.logo = existingData.centerInfo.logo;
    }

    // Upload banner nếu có file mới
    if (bannerFile) {
      this.validateImageFile(bannerFile);
      try {
        const result = await this.cloudinaryService.uploadImage(bannerFile, 'center-info');
        dto.centerInfo.banner = result.secure_url;
      } catch (error) {
        throw new BadRequestException('Không thể upload banner lên Cloudinary');
      }
    } else if (existingData?.centerInfo?.banner) {
      // Giữ lại URL cũ nếu không có file mới
      dto.centerInfo.banner = existingData.centerInfo.banner;
    }

    const setting = await this.prisma.systemSetting.upsert({
      where: { key: 'center-info' },
      update: {
        group: 'center-profile',
        value: dto as any,
        description: 'Basic center information',
      },
      create: {
        key: 'center-info',
        group: 'center-profile',
        value: dto as any,
        description: 'Basic center information',
      },
    });

    return {
      data: setting,
      message: 'Cập nhật thông tin trung tâm thành công',
    };
  }

  private validateImageFile(file: Express.Multer.File) {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP, SVG)');
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Dung lượng file tối đa 5MB');
    }
  }

  private validateWorkingHours(workingHours: any[]) {
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
        throw new BadRequestException('Ngày làm việc không hợp lệ');
      }

      if (fromIndex > toIndex) {
        throw new BadRequestException('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
      }

      if (slot.open >= slot.close) {
        throw new BadRequestException('Giờ mở cửa phải trước giờ đóng cửa');
      }
    }
  }
}

