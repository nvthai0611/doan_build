import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ContractUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get all contract uploads for a student
   */
  async getByStudentId(studentId: string) {
    const contracts = await this.prisma.contractUpload.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    return contracts;
  }

  /**
   * Upload a new contract for student
   */
  async uploadContract(
    studentId: string,
    file: Express.Multer.File,
    data: {
      parentId?: string;
      contractType: string;
      subjectIds?: string[];
      note?: string;
      expiredAt?: Date;
    }
  ) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadDocument(
      file,
      'student-applications'
    );

    // Calculate expiredAt if not provided
    let expiredAt = data.expiredAt;
    if (!expiredAt) {
      const now = new Date();
      const nextYear = now.getFullYear() + 1;
      expiredAt = new Date(nextYear, 4, 31, 23, 59, 59); // May 31 next year
    }
    // Create contract upload record
    const contract = await this.prisma.contractUpload.create({
      data: {
        studentId,
        parentId: data.parentId && data.parentId.trim() !== '' ? data.parentId.trim() : null,
        contractType: 'student_commitment',
        subjectIds: data.subjectIds || [],
        uploadedImageUrl: uploadResult.secure_url,
        uploadedImageName: file.originalname,
        uploadedAt: new Date(),
        expiredAt: expiredAt,
        note: data.note || `Đơn xin học thêm (${student.user.fullName})`,
        status: 'active'
      }
    });

    return contract;
  }

  /**
   * Update contract
   */
  async updateContract(
    contractId: string,
    data: {
      subjectIds?: string[];
      note?: string;
      expiredAt?: Date;
      status?: string;
    }
  ) {
    const contract = await this.prisma.contractUpload.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return await this.prisma.contractUpload.update({
      where: { id: contractId },
      data: {
        ...(data.subjectIds && { subjectIds: data.subjectIds }),
        ...(data.note && { note: data.note }),
        ...(data.expiredAt && { expiredAt: data.expiredAt }),
        ...(data.status && { status: data.status }),
      }
    });
  }

  /**
   * Delete contract
   */
  async deleteContract(contractId: string) {
    const contract = await this.prisma.contractUpload.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    await this.prisma.contractUpload.delete({
      where: { id: contractId }
    });

    return { success: true };
  }
}
