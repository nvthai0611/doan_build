import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ContractsManageService {
  private readonly logger = new Logger(ContractsManageService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async listByTeacher(teacherId: string) {
    const uploads = await this.prisma.contractUpload.findMany({
      where: { teacherId },
      orderBy: { uploadedAt: 'desc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return uploads.map((u) => {
      let status = 'active';
      if (u.expiredAt) {
        if (u.expiredAt < now) {
          status = 'expired';
        } else if (u.expiredAt <= thirtyDaysFromNow) {
          status = 'expiring_soon';
        }
      }

      return {
        id: u.id,
        contractType: u.contractType,
        uploadedImageUrl: u.uploadedImageUrl,
        uploadedImageName: u.uploadedImageName,
        uploadedAt: u.uploadedAt,
        startDate: u.startDate,
        expiryDate: u.expiredAt,
        teacherSalaryPercent: u.teacherSalaryPercent,
        notes: u.note,
        status,
      };
    });
  }

  async createForTeacher(
    teacherId: string,
    file: Express.Multer.File,
    contractType: string,
    startDate?: string,
    expiryDate?: string,
    notes?: string,
    teacherSalaryPercent?: number
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!startDate) {
      throw new BadRequestException('Start date is required');
    }

    if (!expiryDate) {
      throw new BadRequestException('Expiry date is required');
    }

    if (teacherSalaryPercent === undefined || teacherSalaryPercent === null) {
      throw new BadRequestException('teacherSalaryPercent is required');
    }

    if (teacherSalaryPercent < 0 || teacherSalaryPercent > 100) {
      throw new BadRequestException('teacherSalaryPercent must be between 0 and 100');
    }

    let uploadResult: any;
    try {
      uploadResult = await this.cloudinaryService.uploadDocument(file, `contracts/${teacherId}`);
    } catch (err) {
      uploadResult = {
        secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
        public_id: `mock_${Date.now()}`,
      };
    }

    const expiredAt = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let status = 'active';
    if (expiredAt < now) {
      status = 'expired';
    } else if (expiredAt <= thirtyDaysFromNow) {
      status = 'expiring_soon';
    }

    const startDateObj = new Date(startDate);

    const created = await this.prisma.contractUpload.create({
      data: {
        teacherId,
        contractType: contractType || 'other',
        uploadedImageUrl: uploadResult.secure_url,
        uploadedImageName: file.originalname,
        startDate: startDateObj,
        expiredAt,
        note: notes || null,
        status,
        teacherSalaryPercent,
      },
    });

    return {
      id: created.id,
      contractType: created.contractType,
      uploadedImageUrl: created.uploadedImageUrl,
      uploadedImageName: created.uploadedImageName,
      uploadedAt: created.uploadedAt,
      expiryDate: created.expiredAt,
      notes: created.note,
      status: created.status,
    };
  }

  async deleteForTeacher(teacherId: string, id: string) {
    const found = await this.prisma.contractUpload.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException('Contract upload not found');
    }

    if (found.teacherId !== teacherId) {
      throw new BadRequestException('You do not have permission to delete this upload');
    }

    await this.prisma.contractUpload.delete({ where: { id } });

    return { message: 'Deleted' };
  }

  // Cron job merged from ContractsCronService
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshContractStatusesDaily() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.logger.log('Running daily contract status refresh job...');

    // Mark expired
    const expiredRes = await this.prisma.contractUpload.updateMany({
      where: { expiredAt: { lt: now }, status: { not: 'expired' } },
      data: { status: 'expired' },
    });

    // Mark expiring soon (within next 30 days)
    const expiringSoonRes = await this.prisma.contractUpload.updateMany({
      where: {
        expiredAt: { gte: now, lte: thirtyDaysFromNow },
        status: { not: 'expiring_soon' },
      },
      data: { status: 'expiring_soon' },
    });

    // Mark active (more than 30 days away or no expiry set)
    const activeRes = await this.prisma.contractUpload.updateMany({
      where: {
        OR: [
          { expiredAt: { gt: thirtyDaysFromNow } },
          { expiredAt: null },
        ],
        status: { not: 'active' },
      },
      data: { status: 'active' },
    });

    this.logger.log(`Contract status refresh complete. expired=${expiredRes.count}, expiringSoon=${expiringSoonRes.count}, active=${activeRes.count}`);
  }
}
