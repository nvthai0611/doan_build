import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { checkId } from 'src/utils/validate.util';

interface CreateShowcaseDto {
  title: string;
  description?: string;
  studentImage: string | Express.Multer.File; // Can be URL string or file
  achievement: string;
  featured?: boolean;
  order?: number;
  publishedAt?: Date;
}

interface UpdateShowcaseDto {
  title?: string;
  description?: string;
  studentImage?: string | Express.Multer.File; // Can be URL string or file
  achievement?: string;
  featured?: boolean;
  order?: number;
  publishedAt?: Date;
}

export interface ShowcaseResponse {
  data: any;
  message: string;
}

@Injectable()
export class ShowcaseManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Lấy danh sách showcases với filter và pagination
   */
  async getAllShowcases(params?: {
    page?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
  }): Promise<ShowcaseResponse> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (params?.search) {
        where.OR = [
          { title: { contains: params.search, mode: 'insensitive' } },
          { achievement: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.featured !== undefined) {
        where.featured = params.featured;
      }

      const [showcases, total] = await Promise.all([
        this.prisma.showcase.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { featured: 'desc' },
            { order: 'asc' },
            { publishedAt: 'desc' },
          ],
        }),
        this.prisma.showcase.count({ where }),
      ]);

      return {
        data: showcases,
        message: 'Lấy danh sách học sinh tiêu biểu thành công',
        success: true,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as any;
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy showcase theo ID
   */
  async getShowcaseById(id: string): Promise<ShowcaseResponse> {
    try {
      if (!checkId(id)) {
        throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      const showcase = await this.prisma.showcase.findUnique({
        where: { id },
      });

      if (!showcase) {
        throw new HttpException(
          'Không tìm thấy học sinh tiêu biểu',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: showcase,
        message: 'Lấy thông tin học sinh tiêu biểu thành công',
        success: true,
      } as any;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi lấy thông tin học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo showcase mới
   */
  async createShowcase(
    createShowcaseDto: CreateShowcaseDto,
  ): Promise<ShowcaseResponse> {
    try {
      // Validate required fields
      if (!createShowcaseDto.title) {
        throw new HttpException('Tiêu đề là bắt buộc', HttpStatus.BAD_REQUEST);
      }
      if (!createShowcaseDto.studentImage) {
        throw new HttpException(
          'Ảnh học sinh là bắt buộc',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!createShowcaseDto.achievement) {
        throw new HttpException(
          'Thành tích là bắt buộc',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Handle image upload if studentImage is a file
      let imageUrl: string;
      if (
        createShowcaseDto.studentImage &&
        typeof createShowcaseDto.studentImage !== 'string'
      ) {
        // Upload to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadImage(
          createShowcaseDto.studentImage as Express.Multer.File,
          'showcases',
        );
        imageUrl = uploadResult.secure_url;
      } else {
        // Use provided URL string
        imageUrl = createShowcaseDto.studentImage as string;
      }

      // Get max order if order is not provided
      if (createShowcaseDto.order === undefined) {
        const maxOrder = await this.prisma.showcase.aggregate({
          _max: { order: true },
        });
        createShowcaseDto.order = (maxOrder._max.order || 0) + 1;
      }

      const showcase = await this.prisma.showcase.create({
        data: {
          title: createShowcaseDto.title,
          description: createShowcaseDto.description,
          studentImage: imageUrl,
          achievement: createShowcaseDto.achievement,
          featured: createShowcaseDto.featured || false,
          order: createShowcaseDto.order,
          publishedAt: createShowcaseDto.publishedAt || new Date(),
        },
      });

      return {
        data: showcase,
        message: 'Tạo học sinh tiêu biểu thành công',
        success: true,
      } as any;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi tạo học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật showcase
   */
  async updateShowcase(
    id: string,
    updateShowcaseDto: UpdateShowcaseDto,
  ): Promise<ShowcaseResponse> {
    try {
      if (!checkId(id)) {
        throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      // Check if showcase exists
      const existingShowcase = await this.prisma.showcase.findUnique({
        where: { id },
      });

      if (!existingShowcase) {
        throw new HttpException(
          'Không tìm thấy học sinh tiêu biểu',
          HttpStatus.NOT_FOUND,
        );
      }

      // Handle image upload if studentImage is provided and is a file
      let imageUrl: string | undefined;
      if (updateShowcaseDto.studentImage) {
        if (typeof updateShowcaseDto.studentImage !== 'string') {
          // Upload to Cloudinary
          const uploadResult = await this.cloudinaryService.uploadImage(
            updateShowcaseDto.studentImage as Express.Multer.File,
            'showcases',
          );
          imageUrl = uploadResult.secure_url;
        } else {
          // Use provided URL string
          imageUrl = updateShowcaseDto.studentImage;
        }
      }

      const updateData: any = {
        ...(updateShowcaseDto.title && { title: updateShowcaseDto.title }),
        ...(updateShowcaseDto.description !== undefined && {
          description: updateShowcaseDto.description,
        }),
        ...(imageUrl && { studentImage: imageUrl }),
        ...(updateShowcaseDto.achievement && {
          achievement: updateShowcaseDto.achievement,
        }),
        ...(updateShowcaseDto.featured !== undefined && {
          featured: updateShowcaseDto.featured,
        }),
        ...(updateShowcaseDto.order !== undefined && {
          order: updateShowcaseDto.order,
        }),
        ...(updateShowcaseDto.publishedAt !== undefined && {
          publishedAt: updateShowcaseDto.publishedAt,
        }),
      };

      const showcase = await this.prisma.showcase.update({
        where: { id },
        data: updateData,
      });

      return {
        data: showcase,
        message: 'Cập nhật học sinh tiêu biểu thành công',
        success: true,
      } as any;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa showcase
   */
  async deleteShowcase(id: string): Promise<ShowcaseResponse> {
    try {
      if (!checkId(id)) {
        throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      // Check if showcase exists
      const existingShowcase = await this.prisma.showcase.findUnique({
        where: { id },
      });

      if (!existingShowcase) {
        throw new HttpException(
          'Không tìm thấy học sinh tiêu biểu',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.showcase.delete({
        where: { id },
      });

      return {
        data: null,
        message: 'Xóa học sinh tiêu biểu thành công',
        success: true,
      } as any;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi xóa học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

