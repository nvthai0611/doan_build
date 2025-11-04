import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class CommitmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Lấy danh sách hợp đồng cam kết của học sinh
   */
  async getStudentCommitments(studentId: string, parentId: string) {
    // Verify that the student belongs to this parent
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { parentId: true },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    if (student.parentId !== parentId) {
      throw new BadRequestException('Bạn không có quyền xem hợp đồng của học sinh này');
    }

    const commitments = await this.prisma.contractUpload.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return commitments.map((commitment) => {
      let status = 'active';
      if (commitment.expiredAt) {
        if (commitment.expiredAt < now) {
          status = 'expired';
        } else if (commitment.expiredAt <= thirtyDaysFromNow) {
          status = 'expiring_soon';
        }
      }

      return {
        id: commitment.id,
        contractType: commitment.contractType,
        uploadedImageUrl: commitment.uploadedImageUrl,
        uploadedImageName: commitment.uploadedImageName,
        uploadedAt: commitment.uploadedAt,
        expiredAt: commitment.expiredAt,
        status,
        note: commitment.note,
        subjectIds: commitment.subjectIds || [],
      };
    });
  }

  /**
   * Upload hợp đồng cam kết mới cho học sinh
   */
  async uploadCommitment(
    parentId: string,
    studentId: string,
    file: Express.Multer.File,
    subjectIds: string[],
    note?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    if (!subjectIds || subjectIds.length === 0) {
      throw new BadRequestException('Phải chọn ít nhất một môn học');
    }

    // Verify that the student belongs to this parent
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { parentId: true },
    });

    if (!student) {
      throw new NotFoundException('Không tìm thấy học sinh');
    }

    if (student.parentId !== parentId) {
      throw new BadRequestException('Bạn không có quyền upload hợp đồng cho học sinh này');
    }

    // Validate subject IDs
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
    });

    if (subjects.length !== subjectIds.length) {
      throw new BadRequestException('Một hoặc nhiều môn học không hợp lệ');
    }

    // Upload file to Cloudinary
    let uploadResult: any;
    try {
      uploadResult = await this.cloudinaryService.uploadDocument(
        file,
        `commitments/${studentId}`,
      );
    } catch (err) {
      // Fallback for development
      uploadResult = {
        secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
        public_id: `mock_${Date.now()}`,
      };
    }

    // Tính expiredAt: 31/05 năm sau
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;
    const expiredAt = new Date(nextYear, 4, 31, 23, 59, 59, 999); // 31/05 năm sau (tháng 4 = May, vì 0-indexed)

    // Calculate status based on expiry date
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let status = 'active';
    if (expiredAt < now) {
      status = 'expired';
    } else if (expiredAt <= thirtyDaysFromNow) {
      status = 'expiring_soon';
    }

    const created = await this.prisma.contractUpload.create({
      data: {
        studentId,
        parentId,
        contractType: 'student_commitment',
        subjectIds,
        uploadedImageUrl: uploadResult.secure_url,
        uploadedImageName: file.originalname,
        note: note || null,
        expiredAt,
        status,
      },
    });

    return {
      id: created.id,
      contractType: created.contractType,
      uploadedImageUrl: created.uploadedImageUrl,
      uploadedImageName: created.uploadedImageName,
      uploadedAt: created.uploadedAt,
      expiredAt: created.expiredAt,
      status: created.status || 'active',
      note: created.note,
      subjectIds: created.subjectIds || [],
    };
  }

  /**
   * Xóa hợp đồng cam kết
   */
  async deleteCommitment(commitmentId: string, studentId: string, parentId: string) {
    const commitment = await this.prisma.contractUpload.findUnique({
      where: { id: commitmentId },
      select: { studentId: true },
    });

    if (!commitment) {
      throw new NotFoundException('Không tìm thấy hợp đồng cam kết');
    }

    if (commitment.studentId !== studentId) {
      throw new BadRequestException('Hợp đồng không thuộc về học sinh này');
    }

    // Verify that the student belongs to this parent
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { parentId: true },
    });

    if (!student || student.parentId !== parentId) {
      throw new BadRequestException('Bạn không có quyền xóa hợp đồng này');
    }

    // Check if commitment is being used in any class requests
    const classRequests = await this.prisma.studentClassRequest.findMany({
      where: { contractUploadId: commitmentId },
      select: { id: true },
    });

    if (classRequests.length > 0) {
      throw new BadRequestException(
        'Không thể xóa hợp đồng này vì đang được sử dụng trong yêu cầu tham gia lớp học',
      );
    }

    await this.prisma.contractUpload.delete({
      where: { id: commitmentId },
    });

    return { message: 'Xóa hợp đồng cam kết thành công' };
  }
}

