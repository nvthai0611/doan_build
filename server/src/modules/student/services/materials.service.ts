import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

export interface GetStudentMaterialsDto {
  classId?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMaterialsForStudent(studentId: string, dto: GetStudentMaterialsDto) {
    const { classId, category, page = 1, limit = 10, search } = dto || {};

    // Lấy danh sách lớp mà học sinh đã enroll (đang active)
    const enrolledClassIds = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'active',
        ...(classId ? { classId } : {}),
      },
      select: { classId: true },
    });

    const classIds = enrolledClassIds.map((e) => e.classId);

    if (classIds.length === 0) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit, totalPages: 0 },
        stats: { totalSize: 0, totalDownloads: 0, recentUploads: 0 },
      };
    }

    const where: any = {
      classId: { in: classIds },
    };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.material.count({ where });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const statsAgg = await this.prisma.material.aggregate({
      where,
      _sum: { fileSize: true },
    });
    const recentUploads = await this.prisma.material.count({
      where: { ...where, uploadedAt: { gte: weekAgo } },
    });

    const materials = await this.prisma.material.findMany({
      where,
      include: {
        class: { select: { name: true } },
        uploadedByTeacher: {
          select: { user: { select: { fullName: true } } },
        },
      },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = materials.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      fileName: m.fileName,
      fileType: m.fileType,
      fileSize: m.fileSize,
      category: m.category,
      fileUrl: m.fileUrl,
      uploadedAt: m.uploadedAt,
      classId: m.classId,
      className: (m as any).class?.name,
      teacherName: (m as any).uploadedByTeacher?.user?.fullName,
      downloads: m.downloads,
    }));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / (limit || 1)),
      },
      stats: {
        totalSize: Number(statsAgg._sum.fileSize || 0),
        recentUploads,
      },
    };
  }

  async incrementDownload(materialId: number) {
    await this.prisma.material.update({
      where: { id: Number(materialId) },
      data: { downloads: { increment: 1 } },
    });
  }
}
