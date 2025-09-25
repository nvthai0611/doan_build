import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { QueryTeacherDto } from '../dto/teacher/query-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherManagementService {
  constructor(private prisma: PrismaService) {}

  async createTeacher(createTeacherDto: CreateTeacherDto) {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createTeacherDto.email },
          { username: createTeacherDto.username }
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('Email hoặc username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);

    // Create user first
    const user = await this.prisma.user.create({
      data: {
        email: createTeacherDto.email,
        password: hashedPassword,
        fullName: createTeacherDto.fullName,
        username: createTeacherDto.username,
        phone: createTeacherDto.phone,
        role: createTeacherDto.role,
        isActive: createTeacherDto.isActive ?? true,
      }
    });

    // Create teacher record
    const teacher = await this.prisma.teacher.create({
      data: {
        userId: user.id,
        hireDate: createTeacherDto.hireDate ? new Date(createTeacherDto.hireDate) : null,
        contractEnd: createTeacherDto.contractEnd ? new Date(createTeacherDto.contractEnd) : null,
        subjects: createTeacherDto.subjects || [],
        salary: createTeacherDto.salary ? createTeacherDto.salary : null,
      },
      include: {
        user: true
      }
    });

    return this.formatTeacherResponse(teacher);
  }

  async findAllTeachers(queryDto: QueryTeacherDto) {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      user: {
        role: role || undefined
      }
    };

    // Add search filter
    if (search) {
      where.user.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.user.isActive = status === 'active';
    }
    // Get all teachers (no pagination for now)
    const teachers = await this.prisma.teacher.findMany({
      where,
      include: {
        user: true
      },
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    return {
      data: teachers.map(teacher => this.formatTeacherResponse(teacher)),
      meta: {
        page: 1,
        limit: teachers.length,
        total: teachers.length,
        totalPages: 1
      },
      message: 'Lấy danh sách giáo viên thành công'
    };
  }

  async findOneTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        classes: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    return this.formatTeacherResponse(teacher);
  }

  async updateTeacher(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    // Check if email or username already exists (excluding current user)
    if (updateTeacherDto.email || updateTeacherDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: teacher.userId } },
            {
              OR: [
                updateTeacherDto.email ? { email: updateTeacherDto.email } : {},
                updateTeacherDto.username ? { username: updateTeacherDto.username } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          ]
        }
      });

      if (existingUser) {
        throw new BadRequestException('Email hoặc username đã tồn tại');
      }
    }

    // Update user data
    const userUpdateData: any = {};
    if (updateTeacherDto.email) userUpdateData.email = updateTeacherDto.email;
    if (updateTeacherDto.fullName) userUpdateData.fullName = updateTeacherDto.fullName;
    if (updateTeacherDto.username) userUpdateData.username = updateTeacherDto.username;
    if (updateTeacherDto.phone) userUpdateData.phone = updateTeacherDto.phone;
    if (updateTeacherDto.role) userUpdateData.role = updateTeacherDto.role;
    if (updateTeacherDto.isActive !== undefined) userUpdateData.isActive = updateTeacherDto.isActive;

    if (updateTeacherDto.password) {
      userUpdateData.password = await bcrypt.hash(updateTeacherDto.password, 10);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: teacher.userId },
        data: userUpdateData
      });
    }

    // Update teacher data
    const teacherUpdateData: any = {};
    if (updateTeacherDto.hireDate) teacherUpdateData.hireDate = new Date(updateTeacherDto.hireDate);
    if (updateTeacherDto.contractEnd) teacherUpdateData.contractEnd = new Date(updateTeacherDto.contractEnd);
    if (updateTeacherDto.subjects) teacherUpdateData.subjects = updateTeacherDto.subjects;
    if (updateTeacherDto.salary !== undefined) teacherUpdateData.salary = updateTeacherDto.salary;

    if (Object.keys(teacherUpdateData).length > 0) {
      await this.prisma.teacher.update({
        where: { id },
        data: teacherUpdateData
      });
    }

    // Return updated teacher
    return this.findOneTeacher(id);
  }

  async removeTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    // Delete teacher (this will cascade to user due to onDelete: Cascade)
    await this.prisma.teacher.delete({
      where: { id }
    });

    return { message: 'Xóa giáo viên thành công' };
  }

  async toggleTeacherStatus(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: !teacher.user.isActive }
    });

    return this.formatTeacherResponse({ ...teacher, user: updatedUser });
  }

  private formatTeacherResponse(teacher: any) {
    return {
      id: teacher.id,
      name: teacher.user.fullName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      username: teacher.user.username,
      code: `***${teacher.id.slice(-4).toUpperCase()}A`, // Generate code from ID
      role: this.mapRoleToVietnamese(teacher.user.role),
      gender: 'Nam', // Default, can be added to User model later
      birthDate: teacher.user.dateOfBirth ? this.formatDate(teacher.user.dateOfBirth) : undefined,
      status: teacher.user.isActive,
      hireDate: teacher.hireDate ? this.formatDate(teacher.hireDate) : undefined,
      contractEnd: teacher.contractEnd ? this.formatDate(teacher.contractEnd) : undefined,
      subjects: teacher.subjects || [],
      salary: teacher.salary,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    };
  }

  private mapRoleToVietnamese(role: string): string {
    const roleMap = {
      'teacher': 'Giáo viên',
      'admin': 'Giáo vụ',
      'center_owner': 'Chủ trung tâm'
    };
    return roleMap[role] || 'Giáo viên';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN');
  }
}
