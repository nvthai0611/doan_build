import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class PublicShowcasesService {
  constructor(private readonly prisma: PrismaService) {}

  async getShowcases(query?: { featured?: boolean }) {
    const where: any = {};

    // Nếu có query featured, lọc theo featured
    if (query?.featured !== undefined) {
      where.featured = query.featured;
    }

    const showcases = await this.prisma.showcase.findMany({
      where,
      orderBy: [
        { featured: 'desc' }, // Featured trước
        { order: 'asc' }, // Sắp xếp theo order
        { publishedAt: 'desc' }, // Sau đó theo ngày publish
      ],
      select: {
        id: true,
        title: true,
        description: true,
        studentImage: true,
        achievement: true,
        featured: true,
        order: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: showcases,
      message: 'Lấy danh sách học sinh tiêu biểu thành công',
    };
  }
}

