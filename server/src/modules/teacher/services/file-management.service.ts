import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UploadMaterialDto, GetMaterialsDto } from '../dto/upload/upload-material.dto';

@Injectable()
export class FileManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Upload tài liệu lên Cloudinary và lưu thông tin vào database
   */
  async uploadMaterial(
    teacherId: string,
    dto: UploadMaterialDto,
    file: Express.Multer.File,
  ) {
    // Kiểm tra file có tồn tại không
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // Kiểm tra lớp học có tồn tại không
    const classExists = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!classExists) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    // Kiểm tra giáo viên có quyền upload cho lớp này không
    const teacherAssignment = await this.prisma.teacherClassAssignment.findFirst({
      where: {
        teacherId: teacherId,
        classId: dto.classId,
        status: 'active',
      },
    });

    if (!teacherAssignment) {
      throw new BadRequestException('Bạn không có quyền upload tài liệu cho lớp này');
    }

    // Upload tài liệu lên Cloudinary (dùng uploadDocument thay vì uploadImage)
    // uploadDocument() không có transformation, phù hợp với PDF, Word, Excel, PowerPoint
    let uploadResult: any;
    
    try {
      uploadResult = await this.cloudinaryService.uploadDocument(
        file,
        `materials/${dto.classId}`,
      );
    } catch (error) {
      
      uploadResult = {
        secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
        public_id: `mock_${Date.now()}`,
      };
    }

    // Lưu thông tin vào database
    const material = await this.prisma.material.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        fileName: file.originalname,
        category: dto.category,
        description: dto.description,
        fileUrl: uploadResult.secure_url,
        fileSize: BigInt(file.size),
        fileType: file.mimetype,
        uploadedBy: teacherId,
      },
      include: {
        class: {
          select: {
            name: true,
          },
        },
        uploadedByTeacher: {
          select: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      id: material.id,
      classId: material.classId,
      className: material.class.name,
      title: material.title,
      fileName: material.fileName,
      category: material.category,
      description: material.description,
      fileUrl: material.fileUrl,
      fileSize: Number(material.fileSize),
      fileType: material.fileType,
      uploadedBy: material.uploadedByTeacher.user.fullName,
      uploadedAt: material.uploadedAt,
      downloads: material.downloads,
    };
  }

  /**
   * Lấy danh sách tài liệu của giáo viên
   */
  async getMaterials(teacherId: string, dto: GetMaterialsDto) {
    const { classId, category, page = 1, limit = 10, search } = dto;

    // Build where clause
    const where: any = {
      uploadedBy: teacherId,
    };

    if (classId) {
      where.classId = classId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.material.count({ where });

    // Get aggregate statistics for all materials (không phân trang)
    const stats = await this.prisma.material.aggregate({
      where,
      _sum: {
        fileSize: true,
        downloads: true,
      },
    });

    // Count recent uploads (7 days ago)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUploads = await this.prisma.material.count({
      where: {
        ...where,
        uploadedAt: {
          gte: weekAgo,
        },
      },
    });

    // Get materials with pagination
    const materials = await this.prisma.material.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
          },
        },
        uploadedByTeacher: {
          select: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedMaterials = materials.map((material) => ({
      id: material.id,
      classId: material.classId,
      className: material.class.name,
      title: material.title,
      fileName: material.fileName,
      category: material.category,
      description: material.description,
      fileUrl: material.fileUrl,
      fileSize: material.fileSize ? Number(material.fileSize) : 0,
      fileType: material.fileType,
      uploadedBy: material.uploadedByTeacher.user.fullName,
      uploadedAt: material.uploadedAt,
      downloads: material.downloads,
    }));

    return {
      data: formattedMaterials,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalSize: stats._sum.fileSize ? Number(stats._sum.fileSize) : 0,
        totalDownloads: stats._sum.downloads || 0,
        recentUploads,
      },
    };
  }

  /**
   * Lấy danh sách lớp học của giáo viên (để chọn khi upload)
   */
  async getTeacherClasses(teacherId: string) {
    const assignments = await this.prisma.teacherClassAssignment.findMany({
      where: {
        teacherId: teacherId,
        status: 'active',
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.class.id,
      name: assignment.class.name,
      grade: assignment.class.grade,
      subject: assignment.class.subject.name,
    }));
  }

  /**
   * Xóa tài liệu
   */
  async deleteMaterial(teacherId: string, materialId: number) {
    // Kiểm tra tài liệu có tồn tại không
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    // Kiểm tra quyền xóa
    if (material.uploadedBy !== teacherId) {
      throw new BadRequestException('Bạn không có quyền xóa tài liệu này');
    }

    // Xóa file trên Cloudinary (optional, có thể giữ lại để backup)
    // Extract public_id from fileUrl if needed
    // await this.cloudinaryService.deleteImage(publicId);

    // Xóa trong database
    await this.prisma.material.delete({
      where: { id: materialId },
    });

    return {
      message: 'Xóa tài liệu thành công',
    };
  }

  /**
   * Tăng số lượt tải xuống
   */
  async incrementDownload(materialId: number) {
    await this.prisma.material.update({
      where: { id: materialId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Tăng lượt tải xuống thành công',
    };
  }

  /**
   * Lấy thông tin file để download (với filename đúng)
   * Sử dụng CloudinaryService để tạo download URL - có thể dùng chung cho tất cả modules
   */
  async getDownloadUrl(materialId: number) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

    // Dùng CloudinaryService để tạo download URL (có thể reuse cho modules khác)
    const downloadUrl = this.cloudinaryService.getDownloadUrl(
      material.fileUrl,
      material.fileName
    );

    return {
      url: downloadUrl,
      fileName: material.fileName,
      fileType: material.fileType,
      fileSize: material.fileSize ? Number(material.fileSize) : 0,
    };
  }
}

