import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

export interface GetParentMaterialsDto {
  childId: string; // bắt buộc để xác định học sinh của phụ huynh
  classId?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMaterialsForChild(parentUserId: string, dto: GetParentMaterialsDto) {
    const { childId, classId, category, page = 1, limit = 10, search } = dto || ({} as GetParentMaterialsDto);

    // Xác thực quyền: tìm parent theo userId và xác nhận child thuộc parent này
    const parent = await this.prisma.parent.findUnique({ where: { userId: parentUserId }, select: { id: true } });
    if (!parent) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit, totalPages: 0 },
        stats: { totalSize: 0, recentUploads: 0 },
      } as any;
    }

    const student = await this.prisma.student.findFirst({ where: { id: childId, parentId: parent.id }, select: { id: true } });
    if (!student) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit, totalPages: 0 },
        stats: { totalSize: 0, recentUploads: 0 },
      } as any;
    }

    // Xây dựng where clause
    const where: any = {
      class: {
        enrollments: {
          some: {
            studentId: student.id,
            status: { in: ['active', 'studying'] },
          },
        },
      },
    };

    // Nếu có classId, kiểm tra enrollment và chỉ lấy materials của lớp đó
    if (classId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          classId,
          status: { in: ['active', 'studying'] },
        },
      });

      if (!enrollment) {
        // Học sinh không enroll vào lớp này
        return {
          items: [],
          meta: { total: 0, page: 1, limit, totalPages: 0 },
          stats: { totalSize: 0, recentUploads: 0 },
        } as any;
      }

      // Chỉ lấy materials của lớp này
      where.classId = classId;
    }

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

    const statsAgg = await this.prisma.material.aggregate({ where, _sum: { fileSize: true } });
    const recentUploads = await this.prisma.material.count({ where: { ...where, uploadedAt: { gte: weekAgo } } });

    const materials = await this.prisma.material.findMany({
      where,
      include: {
        class: { select: { name: true } },
        uploadedByTeacher: { select: { user: { select: { fullName: true } } } },
      },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = materials.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description || undefined,
      fileName: m.fileName,
      fileType: (m as any).fileType,
      fileSize: (m as any).fileSize,
      category: (m as any).category,
      fileUrl: (m as any).fileUrl,
      uploadedAt: (m as any).uploadedAt as any,
      classId: m.classId,
      className: (m as any).class?.name,
      teacherName: (m as any).uploadedByTeacher?.user?.fullName,
      downloads: (m as any).downloads ?? 0,
    }));

    // Tính tổng lượt tải nếu cần hiển thị
    const totalDownloadsAgg = await this.prisma.material.aggregate({ where, _sum: { downloads: true } });

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / (limit || 1)) },
      stats: { totalSize: Number(statsAgg._sum.fileSize || 0), recentUploads, totalDownloads: Number(totalDownloadsAgg._sum.downloads || 0) } as any,
    };
  }

  async incrementDownload(materialId: number) {
    await this.prisma.material.update({ where: { id: Number(materialId) }, data: { downloads: { increment: 1 } } });
  }
}
