import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateScholarshipDto } from '../dto/scholarship/create-scholarship.dto';
import { UpdateScholarshipDto } from '../dto/scholarship/update-scholarship.dto';
import { QueryScholarshipDto } from '../dto/scholarship/query-scholarship.dto';

@Injectable()
export class ScholarshipManagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách học bổng với pagination
   */
  async findAll(query: QueryScholarshipDto) {
    try {
      const { page = 1, limit = 10, search, isActive } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Get total count
      const total = await this.prisma.scholarship.count({ where });

      // Get scholarships
      const scholarships = await this.prisma.scholarship.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              student: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: scholarships.map((scholarship) => ({
          id: scholarship.id,
          name: scholarship.name,
          description: scholarship.description,
          percent: Number(scholarship.percent),
          criteria: scholarship.criteria,
          isActive: scholarship.isActive,
          createdAt: scholarship.createdAt,
          updatedAt: scholarship.updatedAt,
          studentCount: scholarship._count.student,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Lỗi khi lấy danh sách học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thông tin một học bổng theo ID
   */
  async findOne(id: string) {
    try {
      const scholarship = await this.prisma.scholarship.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              student: true,
            },
          },
        },
      });

      if (!scholarship) {
        throw new HttpException('Không tìm thấy học bổng', HttpStatus.NOT_FOUND);
      }

      return {
        id: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        percent: Number(scholarship.percent),
        criteria: scholarship.criteria,
        isActive: scholarship.isActive,
        createdAt: scholarship.createdAt,
        updatedAt: scholarship.updatedAt,
        studentCount: scholarship._count.student,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi lấy thông tin học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo học bổng mới
   */
  async create(createScholarshipDto: CreateScholarshipDto) {
    try {
      const scholarship = await this.prisma.scholarship.create({
        data: {
          name: createScholarshipDto.name,
          description: createScholarshipDto.description ?? null,
          percent: createScholarshipDto.percent,
          criteria: createScholarshipDto.criteria ?? null,
          isActive: createScholarshipDto.isActive ?? true,
        },
      });

      return {
        id: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        percent: Number(scholarship.percent),
        criteria: scholarship.criteria,
        isActive: scholarship.isActive,
        createdAt: scholarship.createdAt,
        updatedAt: scholarship.updatedAt,
      };
    } catch (error) {
      throw new HttpException(
        `Lỗi khi tạo học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật thông tin học bổng
   */
  async update(id: string, updateScholarshipDto: UpdateScholarshipDto) {
    try {
      // Kiểm tra học bổng có tồn tại không
      const existingScholarship = await this.prisma.scholarship.findUnique({
        where: { id },
      });

      if (!existingScholarship) {
        throw new HttpException('Không tìm thấy học bổng', HttpStatus.NOT_FOUND);
      }

      // Tạo object data để update
      const updateData: any = {};
      if (updateScholarshipDto.name !== undefined) updateData.name = updateScholarshipDto.name;
      if (updateScholarshipDto.description !== undefined)
        updateData.description = updateScholarshipDto.description;
      if (updateScholarshipDto.percent !== undefined)
        updateData.percent = updateScholarshipDto.percent;
      if (updateScholarshipDto.criteria !== undefined)
        updateData.criteria = updateScholarshipDto.criteria;
      if (updateScholarshipDto.isActive !== undefined)
        updateData.isActive = updateScholarshipDto.isActive;

      const scholarship = await this.prisma.scholarship.update({
        where: { id },
        data: updateData,
      });

      return {
        id: scholarship.id,
        name: scholarship.name,
        description: scholarship.description,
        percent: Number(scholarship.percent),
        criteria: scholarship.criteria,
        isActive: scholarship.isActive,
        createdAt: scholarship.createdAt,
        updatedAt: scholarship.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi cập nhật học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa học bổng
   */
  async remove(id: string) {
    try {
      const existingScholarship = await this.prisma.scholarship.findUnique({
        where: { id },
        include: {
          student: true,
        },
      });

      if (!existingScholarship) {
        throw new HttpException('Không tìm thấy học bổng', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra học bổng có đang được sử dụng không
      if (existingScholarship.student.length > 0) {
        throw new HttpException(
          'Không thể xóa học bổng đang được sử dụng bởi học sinh',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.scholarship.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Xóa học bổng thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi xóa học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gán hoặc gỡ học bổng cho học sinh
   */
  async assignToStudent(studentId: string, scholarshipId: string | null) {
    try {
      // Kiểm tra học sinh có tồn tại không
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        throw new HttpException('Không tìm thấy học sinh', HttpStatus.NOT_FOUND);
      }

      // Nếu có scholarshipId, kiểm tra học bổng có tồn tại không
      if (scholarshipId) {
        const scholarship = await this.prisma.scholarship.findUnique({
          where: { id: scholarshipId },
        });

        if (!scholarship) {
          throw new HttpException(
            'Không tìm thấy học bổng',
            HttpStatus.NOT_FOUND,
          );
        }

        if (!scholarship.isActive) {
          throw new HttpException(
            'Không thể gán học bổng không hoạt động',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Cập nhật scholarshipId cho học sinh
      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          scholarshipId: scholarshipId || null,
        },
        include: {
          user: true,
          scholarship: true,
        },
      });

      return {
        id: updatedStudent.id,
        studentCode: updatedStudent.studentCode,
        fullName: updatedStudent.user.fullName,
        scholarship: updatedStudent.scholarship
          ? {
              id: updatedStudent.scholarship.id,
              name: updatedStudent.scholarship.name,
              percent: Number(updatedStudent.scholarship.percent),
            }
          : null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi gán học bổng: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

