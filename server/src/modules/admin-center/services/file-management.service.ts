import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

interface GetMaterialsDto {
  classId?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class FileManagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tài liệu của trung tâm
   */
  async getMaterials(dto: GetMaterialsDto) {
    const { classId, category, page = 1, limit = 10, search } = dto;
    // Build where clause
    const where: any = {};

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
   * Lấy danh sách lớp học của trung tâm (để chọn khi filter)
   */
  async getCenterClasses() {
    const classes = await this.prisma.class.findMany({
      include: {
        grade: {
          select: {
            name: true,
            level: true,
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
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
        createdAt: 'desc',
      },
    });

    return classes.map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      grade: classItem.grade?.name || 'N/A',
      gradeLevel: classItem.grade?.level || null,
      subject: classItem.subject.name,
      teacherName: classItem.teacher?.user.fullName || 'Chưa có giáo viên',
    }));
  }

  /**
   * Xóa tài liệu (center owner có quyền xóa mọi tài liệu)
   */
  async deleteMaterial(materialId: number) {
    // Kiểm tra tài liệu có tồn tại không
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

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
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }

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
}

