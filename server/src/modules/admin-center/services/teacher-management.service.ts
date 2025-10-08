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
    console.log("Create teacher dto:", createTeacherDto)
    
    return await this.prisma.$transaction(async (prisma) => {
      // Check if email or username already exists
      const existingUser = await prisma.user.findFirst({
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
      const hashedPassword = await bcrypt.hash("123456", 10);

      // Handle school creation/finding
      let schoolId = null;
      if (createTeacherDto.schoolName) {
        // Tìm school đã tồn tại
        let school = await prisma.school.findFirst({
          where: {
            name: createTeacherDto.schoolName,
            address: createTeacherDto.schoolAddress || undefined
          }
        });

        // Nếu không tìm thấy, tạo school mới
        if (!school) {
          school = await prisma.school.create({
            data: {
              name: createTeacherDto.schoolName,
              address: createTeacherDto.schoolAddress || null,
              phone: null
            }
          });
        }
        schoolId = school.id;
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: createTeacherDto.email,
          password: hashedPassword,
          fullName: createTeacherDto.fullName,
          username: createTeacherDto.username,
          phone: createTeacherDto.phone,
          role: createTeacherDto.role,
          isActive: createTeacherDto.isActive ?? true,
          gender: createTeacherDto.gender ?? Gender.MALE,
          birthDate: createTeacherDto.birthDate ? new Date(createTeacherDto.birthDate) : null,
        }
      });

      // Create teacher record
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId: schoolId,
        },
        include: {
          user: true,
          school: true
        }
      });

      // Handle contract image upload if provided
      if (createTeacherDto.contractImage) {
        console.log("Contract image received:", createTeacherDto.contractImage);
        
        // Tạo templateId hợp lệ hoặc skip nếu không có
        const templateId = '00000000-0000-0000-0000-000000000000'; // UUID hợp lệ
        
        await prisma.contractUpload.create({
          data: {
            teacherId: teacher.id,
            templateId: templateId,
            contractType: 'teacher_contract',
            uploadedImageUrl: createTeacherDto.contractImage.filename || 'temp-filename',
            uploadedImageName: createTeacherDto.contractImage.originalname,
            uploadedAt: new Date(),
            isSigned: false,
            status: 'pending'
          }
        });
      }

      return this.formatTeacherResponse(teacher);
    });
  }


  async findAllTeachers(queryDto: any) {
    const {
      search,
      role,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      gender,
      birthYear
    } = queryDto;
    
    // Convert string parameters to numbers
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;
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
   
    // hireDate field has been removed from Teacher model
    // Filtering by hire date is no longer supported

    
    const total = await this.prisma.teacher.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    let orderBy: any = {};
    
      // Map frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      'name': 'fullName',
      'email': 'email',
      'phone': 'phone',
      'username': 'username',
      'createdAt': 'createdAt',
      'updatedAt': 'updatedAt',
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
    
    const teachers = await this.prisma.teacher.findMany({
      where,
      include: {
        user: true
      },
      orderBy,
      skip,
      take: limitNum
    });
    
    return {
      data: teachers.map(teacher => this.formatTeacherResponse(teacher)),
      meta: {
        page: pageNum,
        limit: limitNum,
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
        teacherClassAssignments: {
          include: {
            class: true
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



    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: teacher.userId },
        data: userUpdateData
      });
    }

    // Update teacher data
    const teacherUpdateData: any = {};
    if (updateTeacherDto.contractEnd) teacherUpdateData.contractEnd = new Date(updateTeacherDto.contractEnd);
    // if (updateTeacherDto.salary !== undefined) teacherUpdateData.salary = updateTeacherDto.salary;

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
        teacherClassAssignments: {
          include: {
            class: {
              include: {
                room: true,
                subject: true,
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
          } 
        }
      },
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Chuyển đổi dữ liệu thành format phù hợp với frontend
    const sessions = teacher.teacherClassAssignments.flatMap(assignment => 
      assignment.class.sessions.map(session => ({
        id: session.id,
        date: session.sessionDate,
        title: `Buổi ${assignment.class.name}`,
        time: `${session.startTime}-${session.endTime}`,
        subject: assignment.class.subject.name,
        class: assignment.class.name,
        room: assignment.class.room?.name || 'Chưa xác định',
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
      school: teacher.school ? {
        id: teacher.school.id,
        name: teacher.school.name,
        address: teacher.school.address
      } : null,
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
