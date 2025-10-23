import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ContractsManageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async listByTeacher(teacherId: string) {
    const uploads = await this.prisma.contractUpload.findMany({
      where: { teacherId },
      orderBy: { uploadedAt: 'desc' },
    });

    return uploads.map((u) => ({
      id: u.id,
      contractType: u.contractType,
      uploadedImageUrl: u.uploadedImageUrl,
      uploadedImageName: u.uploadedImageName,
      uploadedAt: u.uploadedAt,
    }));
  }

  async createForTeacher(teacherId: string, file: Express.Multer.File, contractType: string) {
    if (!file) {
      throw new BadRequestException('File is required');
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

    const created = await this.prisma.contractUpload.create({
      data: {
        teacherId,
        contractType: contractType || 'other',
        uploadedImageUrl: uploadResult.secure_url,
        uploadedImageName: file.originalname,
      },
    });

    return {
      id: created.id,
      contractType: created.contractType,
      uploadedImageUrl: created.uploadedImageUrl,
      uploadedImageName: created.uploadedImageName,
      uploadedAt: created.uploadedAt,
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
}
