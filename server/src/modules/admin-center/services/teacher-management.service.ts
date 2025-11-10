import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { QueryTeacherDto } from '../dto/teacher/query-teacher.dto';
import { Gender } from 'src/common/constants';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { generateQNCode } from '../../../utils/function.util';
import Hash from '../../../utils/hasing.util';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

@Injectable()
export class TeacherManagementService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private emailNotificationService: EmailNotificationService
  ) { }

  async createTeacher(createTeacherDto: CreateTeacherDto) {
    return await this.prisma.$transaction(async (prisma) => {
      // Check if email or username already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: createTeacherDto.email },
            { username: createTeacherDto.username },
          ],
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email hoặc username đã tồn tại');
      }


      // Hash password
      const passwordData = await Hash.generateRandomPassword();
      const defaultPassword = passwordData.rawPassword; // Lưu password gốc để gửi email
      const hashedPassword = passwordData.hashedPassword;

      // Handle school creation/finding
      let schoolId = null;
      if (createTeacherDto.schoolName) {
        // Tìm school đã tồn tại
        let school = await prisma.school.findFirst({
          where: {
            name: createTeacherDto.schoolName,
            address: createTeacherDto.schoolAddress || undefined,
          },
        });

        // Nếu không tìm thấy, tạo school mới
        if (!school) {
          school = await prisma.school.create({
            data: {
              name: createTeacherDto.schoolName,
              address: createTeacherDto.schoolAddress || null,
              phone: null,
            },
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
          gender: createTeacherDto.gender,
          birthDate: createTeacherDto.birthDate
            ? this.parseDateString(createTeacherDto.birthDate)
            : null,
        },
      });

      // Generate unique teacher code
      let teacherCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        teacherCode = generateQNCode('teacher');
        const existingTeacher = await prisma.teacher.findUnique({
          where: { teacherCode },
        });

        if (!existingTeacher) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new HttpException(
          {
            success: false,
            message: 'Không thể tạo mã giáo viên duy nhất sau nhiều lần thử',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Create teacher record
      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId: schoolId,
          teacherCode: teacherCode,
          subjects: createTeacherDto.subjects,
        },
        include: {
          user: true,
          school: true,
        },
      });

      // Handle contract image upload if provided
      if (createTeacherDto.contractImage) {
        try {
          // Upload image to Cloudinary
          const uploadResult = await this.cloudinaryService.uploadImage(
            createTeacherDto.contractImage,
            'teachers',
          );
          await prisma.contractUpload.create({
            data: {
              teacherId: teacher.id,
              contractType: 'teacher_contract',
              uploadedImageUrl: uploadResult.secure_url, // Save Cloudinary URL
              uploadedImageName: createTeacherDto.contractImage.originalname,
            },
          });
        } catch (error) {
          await prisma.contractUpload.create({
            data: {
              teacherId: teacher.id,
              contractType: 'teacher_contract',
              uploadedImageUrl:
                createTeacherDto.contractImage.filename || 'temp-filename',
              uploadedImageName: createTeacherDto.contractImage.originalname,
            },
          });
        }
      }

      // Gửi email thông báo tài khoản cho giáo viên
      try {
        await this.emailNotificationService.sendTeacherAccountEmail(
          teacher.id,
          user.fullName,
          user.username,
          user.email,
          defaultPassword,
          teacherCode
        );
      } catch (emailError) {
        // Không throw error, vì teacher đã được tạo thành công
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
      birthYear,
      subject, // Thêm filter theo môn học
    } = queryDto;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;
    const where: any = { AND: [] };
    const userWhere: any = {};

    if (role) {
      userWhere.role = role;
    }

    // Add status filter
    if (status && status !== 'all') {
      userWhere.isActive = status === 'active';
    }

    // Add gender filter to userWhere
    if (gender) {
      userWhere.gender = gender;
    }

    // Add birthYear filter to userWhere
    if (birthYear) {
      const year = parseInt(birthYear);
      if (!isNaN(year)) {
        userWhere.birthDate = {
          gte: new Date(year, 0, 1), // Start of year
          lt: new Date(year + 1, 0, 1), // Start of next year
        };
      }
    }

    // Add user filters to AND conditions
    if (Object.keys(userWhere).length > 0) {
      where.AND.push({ user: userWhere });
    }

    // Add subject filter - chỉ lấy giáo viên có chuyên môn phù hợp
    if (subject) {
      where.AND.push({
        subjects: {
          has: subject,
        },
      });
    }

    // Add search - search in user fields and teacher code
    if (search) {
      where.AND.push({
        OR: [
          {
            user: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          { teacherCode: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // If no AND conditions, remove it to avoid empty AND
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // hireDate field has been removed from Teacher model
    // Filtering by hire date is no longer supported

    const total = await this.prisma.teacher.count({ where });
    const totalPages = Math.ceil(total / limitNum);

    let orderBy: any = {};

    // Map frontend field names to database field names
    const fieldMapping: { [key: string]: string } = {
      name: 'fullName',
      email: 'email',
      phone: 'phone',
      username: 'username',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const mappedSortBy = fieldMapping[sortBy] || sortBy;

    // Check if it's a user field
    if (['fullName', 'email', 'phone', 'username'].includes(mappedSortBy)) {
      orderBy = {
        user: {
          [mappedSortBy]: sortOrder,
        },
      };
    } else {
      orderBy = {
        [mappedSortBy]: sortOrder,
      };
    }

    const teachers = await this.prisma.teacher.findMany({
      where,
      include: {
        user: true,
      },
      orderBy,
      skip,
      take: limitNum,
    });


    return {
      data: teachers.map((teacher) => this.formatTeacherResponse(teacher)),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      message: 'Lấy danh sách giáo viên thành công',
    };
  }

  async findOneTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        school: true,
        contractUploads: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        classes: {
          include: {
            subject: true,
            grade: true,
            room: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    return this.formatTeacherResponse(teacher);
  }

  async updateTeacher(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
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
                updateTeacherDto.username
                  ? { username: updateTeacherDto.username }
                  : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email hoặc username đã tồn tại');
      }
    }

    // Update user data (KHÔNG cho phép update role)
    const userUpdateData: any = {};
    if (updateTeacherDto.email) userUpdateData.email = updateTeacherDto.email;
    if (updateTeacherDto.fullName)
      userUpdateData.fullName = updateTeacherDto.fullName;
    if (updateTeacherDto.username)
      userUpdateData.username = updateTeacherDto.username;
    if (updateTeacherDto.phone) userUpdateData.phone = updateTeacherDto.phone;
    if (updateTeacherDto.isActive !== undefined)
      userUpdateData.isActive = updateTeacherDto.isActive;
    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: teacher.userId },
        data: userUpdateData,
      });
    }

    // Update teacher data
    const teacherUpdateData: any = {};
    if (updateTeacherDto.contractEnd)
      teacherUpdateData.contractEnd = new Date(updateTeacherDto.contractEnd);
    // if (updateTeacherDto.salary !== undefined) teacherUpdateData.salary = updateTeacherDto.salary;

    // Handle school update if schoolName provided
    if (updateTeacherDto.schoolName) {
      // Find or create school
      let school = await this.prisma.school.findFirst({
        where: { name: updateTeacherDto.schoolName },
      });

      if (!school) {
        school = await this.prisma.school.create({
          data: {
            name: updateTeacherDto.schoolName,
            address: updateTeacherDto.schoolAddress || null,
          },
        });
      }

      teacherUpdateData.schoolId = school.id;
    }
    if (updateTeacherDto.subjects)
      teacherUpdateData.subjects = updateTeacherDto.subjects;

    if (Object.keys(teacherUpdateData).length > 0) {
      await this.prisma.teacher.update({
        where: { id },
        data: teacherUpdateData,
      });
    }

    // Handle contract image upload - save to ContractUpload table
    if (updateTeacherDto.contractImage) {
      try {
        const cloudinaryResult = await this.cloudinaryService.uploadImage(
          updateTeacherDto.contractImage,
          'teachers',
        );

        // Create new contract upload record
        await this.prisma.contractUpload.create({
          data: {
            teacherId: id,
            contractType: 'teacher_contract',
            uploadedImageUrl: cloudinaryResult.secure_url,
            uploadedImageName: updateTeacherDto.contractImage.originalname,
          },
        });
      } catch (uploadError) {
        throw new BadRequestException('Không thể upload ảnh hợp đồng');
      }
    }

    // Return updated teacher
    return this.findOneTeacher(id);
  }

  async removeTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    // Delete teacher (this will cascade to user due to onDelete: Cascade)
    await this.prisma.teacher.delete({
      where: { id },
    });

    return { message: 'Xóa giáo viên thành công' };
  }

  async toggleTeacherStatus(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: !teacher.user.isActive },
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
            room: true,
            subject: true,
            sessions: {
              where:
                year && month
                  ? {
                    sessionDate: {
                      gte: new Date(year, month - 1, 1),
                      lt: new Date(year, month, 1),
                    },
                  }
                  : undefined,
              include: {
                teacher: {
                  include: {
                    user: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
                substituteTeacher: {
                  include: {
                    user: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
                attendances: {
                  include: {
                    student: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                sessionDate: 'asc',
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const dateFilter = year && month
      ? {
        sessionDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      }
      : undefined;

    // Bước 1: Lấy tất cả TeacherClassTransfer liên quan đến giáo viên này
    // - Khi giáo viên bị thay thế (teacherId = id): Lấy transfers có substituteEndDate (dạy thay tạm thời)
    // - Khi giáo viên thay thế (replacementTeacherId = id): Lấy transfers có substituteEndDate
    const [transfersAsOriginalTeacher, transfersAsReplacementTeacher] = await Promise.all([
      // Giáo viên bị thay thế (người được thay thế)
      this.prisma.teacherClassTransfer.findMany({
        where: {
          teacherId: id,
          status: { in: ['approved', 'completed'] },
          substituteEndDate: { not: null }, // Chỉ lấy dạy thay tạm thời
        },
        include: {
          replacementTeacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          fromClass: {
            select: {
              id: true,
            },
          },
        },
      }),
      // Giáo viên thay thế (người dạy thay)
      this.prisma.teacherClassTransfer.findMany({
        where: {
          replacementTeacherId: id,
          status: { in: ['approved', 'completed'] },
          substituteEndDate: { not: null }, // Chỉ lấy dạy thay tạm thời
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          fromClass: {
            select: {
              id: true,
            },
          },
        },
      }),
    ]);

    // Tạo map để lookup nhanh: classId -> transfer info
    // Map 1: Khi giáo viên này bị thay thế (teacherId = id)
    const transfersAsOriginalMap = new Map<
      string,
      {
        effectiveDate: Date;
        substituteEndDate: Date;
        replacementTeacherName: string;
      }
    >();
    transfersAsOriginalTeacher.forEach((transfer) => {
      if (
        transfer.fromClassId &&
        transfer.effectiveDate &&
        transfer.substituteEndDate
      ) {
        transfersAsOriginalMap.set(transfer.fromClassId, {
          effectiveDate: new Date(transfer.effectiveDate),
          substituteEndDate: new Date(transfer.substituteEndDate),
          replacementTeacherName:
            transfer.replacementTeacher?.user?.fullName ||
            'Chưa xác định',
        });
      }
    });

    // Map 2: Khi giáo viên này thay thế (replacementTeacherId = id)
    const transfersAsReplacementMap = new Map<
      string,
      {
        effectiveDate: Date;
        substituteEndDate: Date;
        originalTeacherName: string;
      }
    >();
    transfersAsReplacementTeacher.forEach((transfer) => {
      if (
        transfer.fromClassId &&
        transfer.effectiveDate &&
        transfer.substituteEndDate
      ) {
        transfersAsReplacementMap.set(transfer.fromClassId, {
          effectiveDate: new Date(transfer.effectiveDate),
          substituteEndDate: new Date(transfer.substituteEndDate),
          originalTeacherName:
            transfer.teacher?.user?.fullName || 'Chưa xác định',
        });
      }
    });

    // Bước 2: Lấy tất cả sessions của các lớp mà giáo viên này có thể dạy thay
    const classesToCheck = new Set<string>();
    transfersAsReplacementTeacher.forEach((transfer) => {
      if (transfer.fromClassId) {
        classesToCheck.add(transfer.fromClassId);
      }
    });

    // Query sessions của các lớp mà giáo viên này đang dạy thay
    const substituteSessionsWhere: any = {
      classId: { in: Array.from(classesToCheck) },
      ...(dateFilter ? dateFilter : {}),
    };

    const substituteSessions = await this.prisma.classSession.findMany({
      where: substituteSessionsWhere,
      include: {
        class: {
          include: {
            room: true,
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        substituteTeacher: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        attendances: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        sessionDate: 'asc',
      },
    });

    // Helper function: Kiểm tra session có nằm trong khoảng thời gian dạy thay không
    const isSessionInSubstitutePeriod = (
      sessionDate: Date,
      effectiveDate: Date,
      substituteEndDate: Date,
    ): boolean => {
      const sd = new Date(sessionDate);
      const ed = new Date(effectiveDate);
      const sed = new Date(substituteEndDate);
      sd.setHours(0, 0, 0, 0);
      ed.setHours(0, 0, 0, 0);
      sed.setHours(0, 0, 0, 0);
      return sd >= ed && sd <= sed;
    };

    // Bước 3: Xử lý sessions của các lớp học chính (teacher.classes)
    const mainSessions = teacher.classes.flatMap((cls) =>
      cls.sessions.map((session) => {
        const sessionDate = new Date(session.sessionDate);
        const transferInfo = transfersAsOriginalMap.get(cls.id);

        // Kiểm tra xem session này có nằm trong khoảng thời gian dạy thay không
        let isSubstitute = false;
        let substituteTeacherName: string | null = null;
        let originalTeacherName: string | null = null;
        let substituteStartDate: Date | null = null;
        let substituteEndDate: Date | null = null;

        if (
          transferInfo &&
          isSessionInSubstitutePeriod(
            sessionDate,
            transferInfo.effectiveDate,
            transferInfo.substituteEndDate,
          )
        ) {
          // Giáo viên này bị thay thế trong khoảng thời gian này
          isSubstitute = true;
          originalTeacherName =
            session.teacher?.user?.fullName ||
            teacher.user.fullName ||
            'Chưa xác định';
          substituteTeacherName = transferInfo.replacementTeacherName;
          substituteStartDate = transferInfo.effectiveDate;
          substituteEndDate = transferInfo.substituteEndDate;
        } else {
          // Giáo viên này là giáo viên chính (không bị thay thế)
          originalTeacherName =
            session.teacher?.user?.fullName ||
            teacher.user.fullName ||
            'Chưa xác định';
          substituteTeacherName = null;
        }

        return {
          id: session.id,
          classId: cls.id,
          date: session.sessionDate,
          title: `Buổi ${cls.name}`,
          time: `${session.startTime}-${session.endTime}`,
          subject: cls.subject.name,
          class: cls.name,
          room: cls.room?.name || 'Chưa xác định',
          hasAlert: this.checkSessionAlerts(session),
          status: session.status as
            | 'happening'
            | 'end'
            | 'has_not_happened'
            | 'day_off',
          teacher: isSubstitute
            ? substituteTeacherName || 'Chưa xác định'
            : originalTeacherName,
          originalTeacher: originalTeacherName,
          substituteTeacher: substituteTeacherName,
          isSubstitute: isSubstitute,
          substituteStartDate: substituteStartDate
            ? this.formatDateYYYYMMDD(new Date(substituteStartDate))
            : null,
          substituteEndDate: substituteEndDate
            ? this.formatDateYYYYMMDD(new Date(substituteEndDate))
            : null,
          students: session.attendances.map((attendance) => ({
            id: attendance.student.id,
            name:
              attendance.student.user.fullName || 'Chưa xác định',
            avatar: undefined,
            status: this.mapAttendanceStatus(attendance.status),
          })),
          attendanceWarnings: this.generateAttendanceWarnings(session),
          description: session.notes || 'Phương học: Chưa cập nhật',
          materials: [],
          cancellationReason: session.cancellationReason,
        };
      }),
    );

    // Bước 4: Xử lý sessions mà giáo viên này đang dạy thay
    const substituteSessionsFormatted = substituteSessions
      .filter((session) => {
        const transferInfo = transfersAsReplacementMap.get(session.classId);
        if (!transferInfo) {
          return false;
        }
        const sessionDate = new Date(session.sessionDate);
        return isSessionInSubstitutePeriod(
          sessionDate,
          transferInfo.effectiveDate,
          transferInfo.substituteEndDate,
        );
      })
      .map((session) => {
        const transferInfo = transfersAsReplacementMap.get(session.classId);
        const originalTeacherName =
          transferInfo?.originalTeacherName ||
          session.teacher?.user?.fullName ||
          session.class.teacher?.user?.fullName ||
          'Chưa xác định';
        const substituteTeacherName =
          teacher.user.fullName || 'Chưa xác định';

        return {
          id: session.id,
          classId: session.classId,
          date: session.sessionDate,
          title: `Buổi ${session.class.name}`,
          time: `${session.startTime}-${session.endTime}`,
          subject: session.class.subject.name,
          class: session.class.name,
          room: session.class.room?.name || 'Chưa xác định',
          hasAlert: this.checkSessionAlerts(session),
          status: session.status as
            | 'happening'
            | 'end'
            | 'has_not_happened'
            | 'day_off',
          teacher: substituteTeacherName,
          originalTeacher: originalTeacherName,
          substituteTeacher: substituteTeacherName,
          isSubstitute: true, // Đánh dấu đây là buổi học thay thế
          substituteStartDate: transferInfo
            ? this.formatDateYYYYMMDD(new Date(transferInfo.effectiveDate))
            : null,
          substituteEndDate: transferInfo
            ? this.formatDateYYYYMMDD(new Date(transferInfo.substituteEndDate))
            : null,
          students: session.attendances.map((attendance) => ({
            id: attendance.student.id,
            name:
              attendance.student.user.fullName || 'Chưa xác định',
            avatar: undefined,
            status: this.mapAttendanceStatus(attendance.status),
          })),
          attendanceWarnings: this.generateAttendanceWarnings(session),
          description: session.notes || 'Phương học: Chưa cập nhật',
          materials: [],
          cancellationReason: session.cancellationReason,
        };
      });

    // Bước 5: Merge và loại bỏ duplicate (nếu một session vừa là chính vừa là thay thế)
    const allSessions = [...mainSessions, ...substituteSessionsFormatted];
    const uniqueSessions = allSessions.filter(
      (session, index, self) =>
        index === self.findIndex((s) => s.id === session.id),
    );

    return {
      teacher: {
        id: teacher.id,
        name: teacher.user.fullName,
        email: teacher.user.email,
      },
      sessions: uniqueSessions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    };
  }

  private checkSessionAlerts(session: any): boolean {
    // Kiểm tra các điều kiện cảnh báo
    const now = new Date();
    const sessionDate = new Date(session.sessionDate);
    const sessionTime = session.startTime.split(':');
    const sessionDateTime = new Date(sessionDate);
    sessionDateTime.setHours(
      parseInt(sessionTime[0]),
      parseInt(sessionTime[1]),
    );

    // Cảnh báo nếu buổi học đã qua mà chưa hoàn thành
    if (sessionDateTime < now && session.status === 'scheduled') {
      return true;
    }

    // Cảnh báo nếu có học sinh vắng mặt
    const absentStudents = session.attendances.filter(
      (att) => att.status === 'absent',
    ).length;
    if (absentStudents > 0) {
      return true;
    }

    return false;
  }

  private mapAttendanceStatus(status: string): 'present' | 'absent' | 'excused' {
    switch (status) {
      case 'present':
        return 'present';
      case 'absent':
        return 'absent';
      case 'excused':
        return 'excused';
      default:
        return 'absent';
    }
  }

  private generateAttendanceWarnings(session: any): string[] {
    const warnings: string[] = [];

    const totalStudents = session.attendances.length;
    const presentStudents = session.attendances.filter(
      (att) => att.status === 'present',
    ).length;
    const absentStudents = session.attendances.filter(
      (att) => att.status === 'absent',
    ).length;
    const excusedStudents = session.attendances.filter(
      (att) => att.status === 'excused',
    ).length;

    if (absentStudents > 0) {
      warnings.push(`*Có ${absentStudents} học viên vắng mặt*`);
    }

    if (excusedStudents > 0) {
      warnings.push(`*Có ${excusedStudents} học viên có phép*`);
    }

    if (totalStudents === 0) {
      warnings.push('*Chưa có học viên nào điểm danh buổi học này*');
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
      code: teacher.teacherCode,
      avatar: teacher.user.avatar || null,
      role: this.mapRoleToVietnamese(teacher.user.role),
      gender:
        teacher.user.gender === Gender.MALE
          ? 'Nam'
          : teacher.user.gender === Gender.FEMALE
            ? 'Nữ'
            : 'Khác',
      birthDate: teacher.user.birthDate
        ? this.formatDate(teacher.user.birthDate)
        : undefined,
      status: teacher.user.isActive,
      schoolName: teacher.school?.name,
      schoolAddress: teacher.school?.address,
      school: teacher.school
        ? {
          id: teacher.school.id,
          name: teacher.school.name,
          address: teacher.school.address,
        }
        : null,
      contractUploads: teacher.contractUploads || [],
      subjects: teacher.subjects || [],
      notes: teacher.notes,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  private mapRoleToVietnamese(role: string): string {
    const roleMap = {
      teacher: 'Giáo viên',
      // 'admin': 'Giáo vụ',
      center_owner: 'Chủ trung tâm',
    };
    return roleMap[role] || 'Giáo viên';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN');
  }

  // Format date to YYYY-MM-DD without timezone issues
  private formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async validateTeachersData(teachersData: any[]) {
    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as any[],
      warnings: [] as any[],
    };

    for (let i = 0; i < teachersData.length; i++) {
      const teacherData = teachersData[i];
      const rowNumber = i + 2; // +2 vì row 1 là header, index từ 0

      try {
        // Validate required fields
        if (!teacherData.email || !teacherData.name || !teacherData.username) {
          results.errors.push({
            row: rowNumber,
            field: 'required',
            message: 'Thiếu thông tin bắt buộc: email, name, username',
            value: '',
          });
          results.errorCount++;
          continue;
        }

        // Check if email or username already exists
        const existingUser = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email: teacherData.email },
              { username: teacherData.username },
              { phone: teacherData.phone },
            ],
          },
        });

        if (existingUser) {
          results.errors.push({
            row: rowNumber,
            field: 'duplicate',
            message: 'Email hoặc username đã tồn tại',
            value: `${teacherData.email} / ${teacherData.username}`,
          });
          results.errorCount++;
          continue;
        }

        // Nếu không có lỗi
        results.successCount++;
      } catch (error: any) {
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Lỗi không xác định',
          value: '',
        });
        results.errorCount++;
      }
    }

    return {
      ...results,
      message:
        results.errorCount === 0
          ? `Validation thành công: ${results.successCount} giáo viên hợp lệ`
          : `Validation thất bại: ${results.errorCount} lỗi`,
    };
  }

  private parseDateString(dateStr: string): Date {
    // Handle DD/MM/YYYY format
    const ddMMyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (ddMMyyyyRegex.test(dateStr)) {
      const [, day, month, year] = dateStr.match(ddMMyyyyRegex)!;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Handle YYYY-MM-DD format
    const yyyyMMddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    if (yyyyMMddRegex.test(dateStr)) {
      const [, year, month, day] = dateStr.match(yyyyMMddRegex)!;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback to default Date parsing
    return new Date(dateStr);
  }

  async bulkImportTeachers(teachersData: any[]) {
    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as any[],
      warnings: [] as any[],
    };

    for (let i = 0; i < teachersData.length; i++) {
      const teacherData = teachersData[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!teacherData.email || !teacherData.name || !teacherData.username) {
          results.errors.push({
            row: rowNumber,
            field: 'required',
            message: 'Thiếu thông tin bắt buộc: email, name, username',
            value: JSON.stringify(teacherData),
          });
          results.errorCount++;
          continue;
        }

        // Check if email or username already exists
        const existingUser = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email: teacherData.email },
              { username: teacherData.username },
            ],
          },
        });

        if (existingUser) {
          results.errors.push({
            row: rowNumber,
            field: 'duplicate',
            message: 'Email hoặc username đã tồn tại',
            value: `${teacherData.email} / ${teacherData.username}`,
          });
          results.errorCount++;
          continue;
        }

        // Create teacher
        await this.createTeacher({
          email: teacherData.email,
          fullName: teacherData.name,
          username: teacherData.username,
          phone: teacherData.phone || '',
          role: teacherData.role || 'teacher',
          isActive: true,
          gender:
            teacherData.gender === 'MALE'
              ? Gender.MALE
              : teacherData.gender === 'FEMALE'
                ? Gender.FEMALE
                : Gender.OTHER,
          birthDate: teacherData.birthDate || null,
          schoolName: teacherData.schoolName,
          schoolAddress: teacherData.schoolAddress,
          notes: teacherData.notes,
        });

        results.successCount++;

        // Add warnings for optional fields
        if (!teacherData.schoolName) {
          results.warnings.push({
            row: rowNumber,
            field: 'schoolName',
            message: 'Không có thông tin trường học',
            value: '',
          });
        }
      } catch (error: any) {
        results.errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message || 'Lỗi không xác định',
          value: JSON.stringify(teacherData),
        });
        results.errorCount++;
      }
    }

    return {
      ...results,
      message: `Import hoàn thành: ${results.successCount} thành công, ${results.errorCount} lỗi`,
    };
  }

  async getTeacherContracts(teacherId: string) {

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    // Get all contracts for this teacher
    const contractUploads = await this.prisma.contractUpload.findMany({
      where: {
        teacherId: teacherId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const contracts = contractUploads.map((u) => {
      let status = 'active';
      if (u.expiredAt) {
        if (u.expiredAt < now) {
          status = 'expired';
        } else if (u.expiredAt <= thirtyDaysFromNow) {
          status = 'expiring_soon';
        }
      }

      return {
        id: u.id,
        contractType: u.contractType,
        uploadedImageUrl: u.uploadedImageUrl,
        uploadedImageName: u.uploadedImageName,
        uploadedAt: u.uploadedAt,
        startDate: u.startDate,
        expiryDate: u.expiredAt,
        teacherSalaryPercent: u.teacherSalaryPercent,
        notes: u.note,
        status,
      };
    });

    return {
      contractUploads: contracts,
      message: 'Lấy danh sách hợp đồng thành công',
    };
  }

  async uploadContractForTeacher(
    teacherId: string,
    file: Express.Multer.File,
    contractType: string,
    startDate?: string,
    expiryDate?: string,
    notes?: string,
    teacherSalaryPercent?: number
  ) {
    if (!file) {
      throw new BadRequestException('File là bắt buộc');
    }

    if (!startDate) {
      throw new BadRequestException('Ngày bắt đầu là bắt buộc');
    }

    if (!expiryDate) {
      throw new BadRequestException('Ngày hết hạn là bắt buộc');
    }

    if (teacherSalaryPercent === undefined || teacherSalaryPercent === null) {
      throw new BadRequestException('teacherSalaryPercent là bắt buộc');
    }

    if (teacherSalaryPercent < 0 || teacherSalaryPercent > 100) {
      throw new BadRequestException('teacherSalaryPercent phải từ 0 đến 100');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    // Upload file to Cloudinary
    let uploadResult: any;
    try {
      uploadResult = await this.cloudinaryService.uploadDocument(
        file,
        `contracts/teacher/${teacherId}`
      );
    } catch (err) {
      uploadResult = {
        secure_url: `http://localhost:9999/uploads/mock-${file.originalname}`,
        public_id: `mock_${Date.now()}`,
      };
    }

    // Calculate status based on expiry date
    const expiredAt = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let status = 'active';
    if (expiredAt < now) {
      status = 'expired';
    } else if (expiredAt <= thirtyDaysFromNow) {
      status = 'expiring_soon';
    }

    const startDateObj = new Date(startDate);

    // Create contract record
    const created = await this.prisma.contractUpload.create({
      data: {
        teacherId,
        contractType: contractType || 'other',
        uploadedImageUrl: uploadResult.secure_url,
        uploadedImageName: file.originalname,
        startDate: startDateObj,
        expiredAt,
        note: notes || null,
        status,
        teacherSalaryPercent,
      },
    });

    return {
      success: true,
      data: {
        id: created.id,
        contractType: created.contractType,
        uploadedImageUrl: created.uploadedImageUrl,
        uploadedImageName: created.uploadedImageName,
        uploadedAt: created.uploadedAt,
        expiryDate: created.expiredAt,
        notes: created.note,
        status: created.status,
      },
      message: 'Tải lên hợp đồng thành công',
    };
  }

  async deleteTeacherContract(teacherId: string, contractId: string) {
    try {
      // Verify teacher exists
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Không tìm thấy giáo viên');
      }

      // Verify contract exists and belongs to this teacher
      const contract = await this.prisma.contractUpload.findFirst({
        where: {
          id: contractId,
          teacherId: teacherId,
        },
      });

      if (!contract) {
        throw new NotFoundException('Không tìm thấy hợp đồng hoặc hợp đồng không thuộc về giáo viên này');
      }

      // Delete the contract
      await this.prisma.contractUpload.delete({
        where: {
          id: contractId,
        },
      });

      return {
        success: true,
        message: 'Xóa hợp đồng thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
