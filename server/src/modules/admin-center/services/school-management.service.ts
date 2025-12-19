import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateSchoolDto } from '../dto/school/create-school.dto';
import { UpdateSchoolDto } from '../dto/school/update-school.dto';

@Injectable()
export class SchoolManagementService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lấy danh sách tất cả trường học
   */
  async findAll() {
    try {
      const schools = await this.prisma.school.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
      });

      return schools.map((school) => ({
        id: school.id,
        name: school.name,
        address: school.address ?? null,
        phone: school.phone ?? null,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
        studentCount: school._count.students,
        teacherCount: school._count.teachers,
      }));
    } catch (error) {
      throw new HttpException(
        `Lỗi khi lấy danh sách trường học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thống kê tổng quan
   */
  async getStats() {
    try {
      const [totalSchools, totalStudents, totalTeachers] = await Promise.all([
        this.prisma.school.count(),
        this.prisma.student.count(),
        this.prisma.teacher.count(),
      ]);

      return {
        totalSchools,
        totalStudents,
        totalTeachers,
      };
    } catch (error) {
      throw new HttpException(
        `Lỗi khi lấy thống kê: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thông tin một trường học theo ID
   */
  async findOne(id: string) {
    try {
      const school = await this.prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        throw new HttpException('Không tìm thấy trường học', HttpStatus.NOT_FOUND);
      }

      return {
        id: school.id,
        name: school.name,
        address: school.address ?? null,
        phone: school.phone ?? null,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi lấy thông tin trường học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo trường học mới
   */
  async create(createSchoolDto: CreateSchoolDto) {
    try {
      // Kiểm tra tên trường đã tồn tại chưa
      const existingSchool = await this.prisma.school.findFirst({
        where: {
          name: {
            equals: createSchoolDto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existingSchool) {
        throw new HttpException(
          `Trường học với tên "${createSchoolDto.name}" đã tồn tại`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const school = await this.prisma.school.create({
        data: {
          name: createSchoolDto.name,
          address: createSchoolDto.address ?? null,
          phone: createSchoolDto.phone ?? null,
        },
      });

      return {
        id: school.id,
        name: school.name,
        address: school.address ?? null,
        phone: school.phone ?? null,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi tạo trường học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật thông tin trường học
   */
  async update(id: string, updateSchoolDto: UpdateSchoolDto) {
    try {
      // Kiểm tra trường học có tồn tại không
      const existingSchool = await this.prisma.school.findUnique({
        where: { id },
      });

      if (!existingSchool) {
        throw new HttpException('Không tìm thấy trường học', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra tên trường đã tồn tại chưa (nếu thay đổi tên)
      if (updateSchoolDto.name && updateSchoolDto.name !== existingSchool.name) {
        const duplicateSchool = await this.prisma.school.findFirst({
          where: {
            name: {
              equals: updateSchoolDto.name,
              mode: 'insensitive',
            },
            id: {
              not: id,
            },
          },
        });

        if (duplicateSchool) {
          throw new HttpException(
            `Trường học với tên "${updateSchoolDto.name}" đã tồn tại`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Tạo object data để update
      const updateData: any = {};
      if (updateSchoolDto.name !== undefined) updateData.name = updateSchoolDto.name;
      if (updateSchoolDto.address !== undefined) updateData.address = updateSchoolDto.address;
      if (updateSchoolDto.phone !== undefined) updateData.phone = updateSchoolDto.phone;

      const school = await this.prisma.school.update({
        where: { id },
        data: updateData,
      });

      return {
        id: school.id,
        name: school.name,
        address: school.address ?? null,
        phone: school.phone ?? null,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi cập nhật trường học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa trường học
   */
  async remove(id: string) {
    try {
      const existingSchool = await this.prisma.school.findUnique({
        where: { id },
        include: {
          students: true,
          teachers: true,
        },
      });

      if (!existingSchool) {
        throw new HttpException('Không tìm thấy trường học', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra trường có đang được sử dụng không
      if (existingSchool.students.length > 0 || existingSchool.teachers.length > 0) {
        throw new HttpException(
          'Không thể xóa trường học đang có học sinh hoặc giáo viên',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.school.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Xóa trường học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi xóa trường học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
