import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { QueryTeacherDto } from '../dto/teacher/query-teacher.dto';
import * as bcrypt from 'bcrypt';
import { Gender } from 'src/common/constants';

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

  // Debug method to check database
  async debugTeachers() {
    const totalTeachers = await this.prisma.teacher.count();
    const sampleTeachers = await this.prisma.teacher.findMany({
      take: 5,
      include: { user: true }
    });
    
    return {
      totalTeachers,
      sampleTeachers: sampleTeachers.map(t => ({
        id: t.id,
        userId: t.userId,
        user: t.user ? {
          id: t.user.id,
          email: t.user.email,
          fullName: t.user.fullName,
          role: t.user.role,
          isActive: t.user.isActive
        } : null
      }))
    };
  }

  async findAllTeachers(queryDto: QueryTeacherDto) {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      gender,
      birthYear,
      hireDateFrom,
      hireDateTo
    } = queryDto;
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    const userWhere: any = {};

    // Add role filter
    if (role) {
      userWhere.role = role;
    }

    // Add search filter
    if (search) {
      userWhere.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      userWhere.isActive = status === 'active';
    }

    if (Object.keys(userWhere).length > 0) {
      where.user = userWhere;
    }
    if (gender) {
      where.gender = gender;
    }
    if (birthYear) {
      const year = parseInt(birthYear);
      if (!isNaN(year)) {
        where.birthDate = {
          gte: new Date(year, 0, 1), // Start of year
          lt: new Date(year + 1, 0, 1) // Start of next year
        };
      }
    }
   
    if (hireDateFrom || hireDateTo) {
      where.hireDate = {};
      if (hireDateFrom) {
        where.hireDate.gte = new Date(hireDateFrom);
      }
      if (hireDateTo) {
        where.hireDate.lte = new Date(hireDateTo);
      }
    }

    console.log("📡 Where:", JSON.stringify(where, null, 2));
    
    const totalTeachers = await this.prisma.teacher.count();
    console.log("📊 Total teachers in database:", totalTeachers);
    
    const teachersWithUser = await this.prisma.teacher.count();
    console.log("📊 Teachers with user relation:", teachersWithUser);
    
    const total = await this.prisma.teacher.count({ where });
    const totalPages = Math.ceil(total / limit);

    let orderBy: any = {};
    
      // Map frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      'name': 'fullName',
      'email': 'email',
      'phone': 'phone',
      'username': 'username',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
      'hireDate': 'hireDate',
      'contractEnd': 'contractEnd',
      'salary': 'salary'
    };

    const mappedSortBy = fieldMapping[sortBy] || sortBy;

    // Check if it's a user field
    if (['fullName', 'email', 'phone', 'username'].includes(mappedSortBy)) {
      orderBy = {
        user: {
          [mappedSortBy]: sortOrder
        }
      };
    } else {
      orderBy = {
        [mappedSortBy]: sortOrder
      };
    }

    console.log("📡 OrderBy:", JSON.stringify(orderBy, null, 2));
    const sampleTeachers = await this.prisma.teacher.findMany({
      take: 3,
      include: { user: true }
    });
    console.log("📊 Sample teachers:", JSON.stringify(sampleTeachers, null, 2));

    const teachers = await this.prisma.teacher.findMany({
      where,
      include: {
        user: true
      },
      orderBy,
      skip,
      take: limit
    });

    return {
      data: teachers.map(teacher => this.formatTeacherResponse(teacher)),
      meta: {
        page,
        limit,
        total,
        totalPages
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

  async getTeacherSchedule(id: string, year?: number, month?: number) {
    // Tìm teacher với các lớp học
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { 
        user: true,
        classes: {
          include: {
            subject: true,
            room: true,
            sessions: {
              where: year && month ? {
                sessionDate: {
                  gte: new Date(year, month - 1, 1),
                  lt: new Date(year, month, 1)
                }
              } : undefined,
              include: {
                attendances: {
                  include: {
                    student: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                sessionDate: 'asc'
              }
            }
          } 
        }
      },
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Chuyển đổi dữ liệu thành format phù hợp với frontend
    const sessions = teacher.classes.flatMap(cls => 
      cls.sessions.map(session => ({
        id: session.id,
        date: session.sessionDate,
        title: `Buổi ${cls.name}`,
        time: `${session.startTime}-${session.endTime}`,
        subject: cls.subject.name,
        class: cls.name,
        room: cls.room?.name || 'Chưa xác định',
        hasAlert: this.checkSessionAlerts(session),
        status: session.status as "scheduled" | "completed" | "cancelled",
        teacher: teacher.user.fullName || 'Chưa xác định',
        students: session.attendances.map(attendance => ({
          id: attendance.student.id,
          name: attendance.student.user.fullName || 'Chưa xác định',
          avatar: undefined,
          status: this.mapAttendanceStatus(attendance.status)
        })),
        attendanceWarnings: this.generateAttendanceWarnings(session),
        description: session.notes || 'Phương học: Chưa cập nhật',
        materials: [] // Có thể thêm materials sau
      }))
    );

    return {
      teacher: {
        id: teacher.id,
        name: teacher.user.fullName,
        email: teacher.user.email
      },
      sessions: sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
  }

  private checkSessionAlerts(session: any): boolean {
    // Kiểm tra các điều kiện cảnh báo
    const now = new Date();
    const sessionDate = new Date(session.sessionDate);
    const sessionTime = session.startTime.split(':');
    const sessionDateTime = new Date(sessionDate);
    sessionDateTime.setHours(parseInt(sessionTime[0]), parseInt(sessionTime[1]));

    // Cảnh báo nếu buổi học đã qua mà chưa hoàn thành
    if (sessionDateTime < now && session.status === 'scheduled') {
      return true;
    }

    // Cảnh báo nếu có học sinh vắng mặt
    const absentStudents = session.attendances.filter(att => att.status === 'absent').length;
    if (absentStudents > 0) {
      return true;
    }

    return false;
  }

  private mapAttendanceStatus(status: string): "present" | "absent" | "late" {
    switch (status) {
      case 'present':
        return 'present';
      case 'absent':
        return 'absent';
      case 'late':
        return 'late';
      default:
        return 'absent';
    }
  }

  private generateAttendanceWarnings(session: any): string[] {
    const warnings: string[] = [];
    
    const totalStudents = session.attendances.length;
    const presentStudents = session.attendances.filter(att => att.status === 'present').length;
    const absentStudents = session.attendances.filter(att => att.status === 'absent').length;
    const lateStudents = session.attendances.filter(att => att.status === 'late').length;

    if (absentStudents > 0) {
      warnings.push(`*Có ${absentStudents} học viên vắng mặt*`);
    }

    if (lateStudents > 0) {
      warnings.push(`*Có ${lateStudents} học viên đi muộn*`);
    }

    if (totalStudents === 0) {
      warnings.push('*Chưa có học viên nào đăng ký buổi học này*');
    }

    return warnings;
  }

  private formatTeacherResponse(teacher: any) {
    return {
      id: teacher.id,
      name: teacher.user.fullName,
      email: teacher.user.email,
      phone: teacher.user.phone,
      username: teacher.user.username,
      code: `***${teacher.id.slice(-4).toUpperCase()}A`,
      role: this.mapRoleToVietnamese(teacher.user.role),
      gender: teacher.gender === Gender.MALE ? 'Nam' : teacher.gender === Gender.FEMALE ? 'Nữ' : 'Khác',
      birthDate: teacher.birthDate ? this.formatDate(teacher.birthDate) : undefined,
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
