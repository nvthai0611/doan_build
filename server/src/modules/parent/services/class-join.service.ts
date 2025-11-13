import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { PrismaService } from '../../../db/prisma.service';
import { JoinClassByCodeDto, RequestJoinClassDto } from '../dto/request/join-class.dto';
import { AlertService } from '../../admin-center/services/alert.service';

@Injectable()
export class ClassJoinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Lấy thông tin lớp học từ classCode hoặc link
   */
  async getClassInfoByCodeOrLink(userId: string, dto: any) {
    // Tìm parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Parse classCode hoặc classId từ input
    let classCode: string | null = null;
    let classId: string | null = null;

    const input = dto.codeOrLink.trim();

    // Check nếu là link: /classes/{uuid}
    const linkPattern = /\/classes\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
    const linkMatch = input.match(linkPattern);

    if (linkMatch) {
      classId = linkMatch[1];
    } else {
      // Coi như là classCode
      classCode = input;
    }

    // Build where condition
    const whereCondition: any = {
      status: { in: ['ready', 'active'] },
    };

    if (classId) {
      whereCondition.id = classId;
    } else if (classCode) {
      whereCondition.classCode = classCode;
    }

    // Tìm class
    const classData = await this.prisma.class.findFirst({
      where: whereCondition,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            amount: true,
            period: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ['studying', 'not_been_updated'] },
              },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy lớp học hoặc lớp học không khả dụng' },
        HttpStatus.NOT_FOUND,
      );
    }

    // KHÔNG check password ở đây - chỉ xem thông tin
    // Password sẽ được check khi request join

    // Parse recurring schedule để hiển thị lịch học
    let scheduleText = 'Chưa có lịch học';
    if (classData.recurringSchedule) {
      try {
        const schedule = classData.recurringSchedule as any;
        if (Array.isArray(schedule) && schedule.length > 0) {
          const dayNames = {
            monday: 'Thứ Hai',
            tuesday: 'Thứ Ba',
            wednesday: 'Thứ Tư',
            thursday: 'Thứ Năm',
            friday: 'Thứ Sáu',
            saturday: 'Thứ Bảy',
            sunday: 'Chủ Nhật',
          };
          
          scheduleText = schedule
            .map((s: any) => `${dayNames[s.dayOfWeek] || s.dayOfWeek} ${s.startTime} → ${s.endTime}`)
            .join(', ');
        }
      } catch (error) {
        console.error('Error parsing recurring schedule:', error);
      }
    }

    // Format response
    const classInfo: any = classData;
    const response = {
      id: classInfo.id,
      name: classInfo.name,
      classCode: classInfo.classCode,
      description: classInfo.description,
      status: classInfo.status,
      requirePassword: !!classInfo.password,
      subject: classInfo.subject
        ? {
            id: classInfo.subject.id,
            name: classInfo.subject.name,
            code: classInfo.subject.code,
          }
        : null,
      grade: classInfo.grade
        ? {
            id: classInfo.grade.id,
            name: classInfo.grade.name,
            level: classInfo.grade.level,
          }
        : null,
      teacher: classInfo.teacher
        ? {
            id: classInfo.teacher.id,
            userId: classInfo.teacher.userId,
            fullName: classInfo.teacher.user?.fullName || 'Chưa có tên',
            avatar: classInfo.teacher.user?.avatar,
            phone: classInfo.teacher.user?.phone,
            email: classInfo.teacher.user?.email,
          }
        : null,
      expectedStartDate: classInfo.expectedStartDate?.toISOString().split('T')[0],
      actualStartDate: classInfo.actualStartDate?.toISOString().split('T')[0],
      actualEndDate: classInfo.actualEndDate?.toISOString().split('T')[0],
      maxStudents: classInfo.maxStudents,
      currentStudents: classInfo._count.enrollments,
      recurringSchedule: classInfo.recurringSchedule,
      scheduleText: scheduleText,
      feeStructure: classInfo.feeStructure
        ? {
            id: classInfo.feeStructure.id,
            name: classInfo.feeStructure.name,
            amount: Number(classInfo.feeStructure.amount),
            period: classInfo.feeStructure.period,
          }
        : null,
      feeAmount: classInfo.feeAmount ? Number(classInfo.feeAmount) : null,
      feePeriod: classInfo.feePeriod,
      feeCurrency: classInfo.feeCurrency,
      academicYear: classInfo.academicYear,
    };

    return {
      success: true,
      data: response,
      message: 'Lấy thông tin lớp học thành công',
    };
  }

  /**
   * Gửi yêu cầu tham gia lớp học
   */
  async requestJoinClass(userId: string, dto: RequestJoinClassDto, file?: Express.Multer.File) {
    // Tìm parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra student có thuộc về parent không
    const student = await this.prisma.student.findFirst({
      where: {
        id: dto.studentId,
        parentId: parent.id,
      },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!student) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy học sinh hoặc học sinh không thuộc quyền quản lý của bạn' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra class có tồn tại và đang khả dụng
    const classData = await this.prisma.class.findFirst({
      where: {
        id: dto.classId,
        status: { in: ['ready', 'active'] },
      },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: { in: ['studying', 'not_been_updated'] },
              },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy lớp học hoặc lớp học không khả dụng' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Kiểm tra password nếu lớp có password
    if (classData.password) {
      if (!dto.password) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp học này yêu cầu mật khẩu',
            requirePassword: true,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (classData.password !== dto.password) {
        throw new HttpException(
          {
            success: false,
            message: 'Mật khẩu không chính xác',
            requirePassword: true,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    // Kiểm tra lớp đã đầy chưa
    if (classData.maxStudents && classData._count.enrollments >= classData.maxStudents) {
      throw new HttpException(
        { success: false, message: 'Lớp học đã đầy, không thể gửi yêu cầu tham gia' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Bắt buộc phải có contractUploadId
    // if (!dto.contractUploadId) {
    //   throw new HttpException(
    //     { success: false, message: 'Vui lòng chọn hợp đồng cam kết học tập' },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // Nếu có contractUploadId thì mới tiến hành kiểm tra
    if (dto.contractUploadId) {
      // Validate contractUploadId: kiểm tra hợp đồng có tồn tại, thuộc về student, có môn học của lớp và chưa hết hạn
      let contractUpload: any = null;
      if (dto.contractUploadId) {
        contractUpload = await this.prisma.contractUpload.findUnique({
          where: { id: dto.contractUploadId },
          include: {
            student: {
              select: {
                id: true,
                parentId: true,
              },
            },
          },
        });

        if (!contractUpload) {
          throw new HttpException(
            { success: false, message: 'Không tìm thấy hợp đồng cam kết' },
            HttpStatus.NOT_FOUND,
          );
        }

        // Kiểm tra hợp đồng thuộc về student này
        if (contractUpload.studentId !== dto.studentId) {
          throw new HttpException(
            { success: false, message: 'Hợp đồng không thuộc về học sinh này' },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Kiểm tra hợp đồng thuộc về parent này
        if (contractUpload.student?.parentId !== parent.id) {
          throw new HttpException(
            { success: false, message: 'Bạn không có quyền sử dụng hợp đồng này' },
            HttpStatus.FORBIDDEN,
          );
        }

        // Lấy subject của lớp
        const classSubject = await this.prisma.class.findUnique({
          where: { id: dto.classId },
          select: {
            subjectId: true,
          },
        });

        if (!classSubject?.subjectId) {
          throw new HttpException(
            { success: false, message: 'Lớp học không có môn học' },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Kiểm tra hợp đồng có môn học của lớp không
        if (!contractUpload.subjectIds || !contractUpload.subjectIds.includes(classSubject.subjectId)) {
          throw new HttpException(
            { success: false, message: 'Hợp đồng cam kết không bao gồm môn học của lớp này' },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Kiểm tra hợp đồng chưa hết hạn
        const now = new Date();
        if (contractUpload.expiredAt && contractUpload.expiredAt < now) {
          throw new HttpException(
            { success: false, message: 'Hợp đồng cam kết đã hết hạn. Vui lòng upload hợp đồng mới' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Kiểm tra học sinh đã enrolled vào lớp này chưa
      const existingEnrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId: dto.studentId,
          classId: dto.classId,
          status: { in: ['studying', 'not_been_updated'] },
        },
      });

      if (existingEnrollment) {
        throw new HttpException(
          { success: false, message: 'Học sinh đã đăng ký lớp học này rồi' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra đã có request pending chưa
      const existingRequest = await this.prisma.studentClassRequest.findFirst({
        where: {
          studentId: dto.studentId,
          classId: dto.classId,
          status: 'pending',
        },
      });

      if (existingRequest) {
        throw new HttpException(
          { success: false, message: 'Đã có yêu cầu tham gia đang chờ xử lý' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra trùng lịch học với các lớp đã đăng ký
      const scheduleConflict = await this.checkScheduleConflict(
        dto.studentId,
        dto.classId,
        classData.recurringSchedule,
      );

      if (scheduleConflict.hasConflict) {
        throw new HttpException(
          {
            success: false,
            message: scheduleConflict.message,
            conflictDetails: scheduleConflict.conflictDetails,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tạo request - lưu cả commitmentImageUrl nếu có hợp đồng
      const request = await this.prisma.studentClassRequest.create({
        data: {
          studentId: dto.studentId,
          classId: dto.classId,
          message: dto.message || `Phụ huynh đăng ký lớp học cho ${student.user.fullName}`,
          ...(dto.contractUploadId && {
            contractUploadId: dto.contractUploadId,
            commitmentImageUrl: contractUpload?.uploadedImageUrl,
          }),
          status: 'pending',
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Tạo alert thông báo cho center owner/manager
      try {
        await this.alertService.createStudentClassRequestAlert({
          id: request.id,
          studentId: request.student.id,
          studentName: request.student.user.fullName,
          classId: request.class.id,
          className: request.class.name,
          subjectName: request.class.subject?.name || 'N/A',
          teacherId: request.class.teacher?.id,
          teacherName: request.class.teacher?.user?.fullName,
        });
      } catch (error) {
        // Log error nhưng không block request
        console.error('Failed to create alert for student class request:', error);
      }

      return {
        success: true,
        data: {
          id: request.id,
          studentId: request.studentId,
          classId: request.classId,
          message: request.message,
          status: request.status,
          createdAt: request.createdAt.toISOString(),
          student: {
            id: request.student.id,
            fullName: request.student.user.fullName,
            email: request.student.user.email,
          },
          class: {
            id: request.class.id,
            name: request.class.name,
            subject: request.class.subject?.name,
          },
        },
        message: 'Gửi yêu cầu tham gia lớp học thành công. Vui lòng đợi giáo viên/quản lý phê duyệt.',
      };
    } else {
      // Nếu không có contractUploadId, tạo request mà không có hợp đồng
      const request = await this.prisma.studentClassRequest.create({
        data: {
          studentId: dto.studentId,
          classId: dto.classId,
          message: dto.message || `Phụ huynh đăng ký lớp học cho ${student.user.fullName}`,
          status: 'pending',
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
              teacher: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Tạo alert thông báo cho center owner/manager
      try {
        await this.alertService.createStudentClassRequestAlert({
          id: request.id,
          studentId: request.student.id,
          studentName: request.student.user.fullName,
          classId: request.class.id,
          className: request.class.name,
          subjectName: request.class.subject?.name || 'N/A',
          teacherId: request.class.teacher?.id,
          teacherName: request.class.teacher?.user?.fullName,
        });
      } catch (error) {
        // Log error nhưng không block request
        console.error('Failed to create alert for student class request:', error);
      }

      return {
        success: true,
        data: {
          id: request.id,
          studentId: request.studentId,
          classId: request.classId,
          message: request.message,
          status: request.status,
          createdAt: request.createdAt.toISOString(),
          student: {
            id: request.student.id,
            fullName: request.student.user.fullName,
            email: request.student.user.email,
          },
          class: {
            id: request.class.id,
            name: request.class.name,
            subject: request.class.subject?.name,
          },
        },
        message: 'Gửi yêu cầu tham gia lớp học thành công. Vui lòng đợi giáo viên/quản lý phê duyệt.',
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu tham gia lớp của parent
   */
  async getMyClassRequests(userId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!parent) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Lấy danh sách student của parent
    const students = await this.prisma.student.findMany({
      where: { parentId: parent.id },
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);

    if (studentIds.length === 0) {
      return {
        success: true,
        data: [],
        message: 'Không có yêu cầu nào',
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(100, filters?.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      studentId: { in: studentIds },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.studentClassRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          class: {
            include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.studentClassRequest.count({ where }),
    ]);

    const data = requests.map((req) => ({
      id: req.id,
      studentId: req.studentId,
      classId: req.classId,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      processedAt: req.processedAt?.toISOString(),
      student: {
        id: req.student.id,
        fullName: req.student.user.fullName,
        avatar: req.student.user.avatar,
      },
      class: {
        id: req.class.id,
        name: req.class.name,
        classCode: req.class.classCode,
        subject: req.class.subject?.name,
        teacher: req.class.teacher?.user?.fullName || 'Chưa có giáo viên',
      },
    }));

    return {
      success: true,
      data,
      message: 'Lấy danh sách yêu cầu thành công',
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Kiểm tra xung đột lịch học giữa lớp mới và các lớp đã đăng ký của học sinh
   */
  private async checkScheduleConflict(
    studentId: string,
    newClassId: string,
    newClassSchedule: any,
  ): Promise<{ hasConflict: boolean; message: string; conflictDetails?: any[] }> {
    // Nếu lớp mới không có lịch học thì không cần kiểm tra
    if (!newClassSchedule) {
      return { hasConflict: false, message: '' };
    }

    // Lấy danh sách các lớp mà học sinh đã enrolled (status: studying hoặc not_been_updated)
    const enrolledClasses = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        status: { in: ['studying', 'not_been_updated'] },
        class: {
          status: { in: ['ready', 'active'] },
          id: { not: newClassId }, // Loại trừ lớp đang muốn join
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            recurringSchedule: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (enrolledClasses.length === 0) {
      return { hasConflict: false, message: '' };
    }

    // Parse lịch học của lớp mới
    const newSchedules = this.parseRecurringSchedule(newClassSchedule);
    if (newSchedules.length === 0) {
      return { hasConflict: false, message: '' };
    }

    // Kiểm tra xung đột với từng lớp đã enrolled
    const conflicts: any[] = [];

    for (const enrollment of enrolledClasses) {
      const enrolledClass = enrollment.class;
      if (!enrolledClass.recurringSchedule) {
        continue;
      }

      const enrolledSchedules = this.parseRecurringSchedule(enrolledClass.recurringSchedule);

      // So sánh từng slot lịch học của lớp mới với từng slot của lớp đã enrolled
      for (const newSchedule of newSchedules) {
        for (const enrolledSchedule of enrolledSchedules) {
          // Kiểm tra cùng ngày trong tuần
          if (this.normalizeDayOfWeek(newSchedule.day) === this.normalizeDayOfWeek(enrolledSchedule.day)) {
            // Kiểm tra overlap thời gian
            if (this.isTimeOverlapping(newSchedule.startTime, newSchedule.endTime, enrolledSchedule.startTime, enrolledSchedule.endTime)) {
              conflicts.push({
                enrolledClass: {
                  id: enrolledClass.id,
                  name: enrolledClass.name,
                  classCode: enrolledClass.classCode,
                  subject: enrolledClass.subject?.name || 'N/A',
                },
                conflictDay: this.getDayName(newSchedule.day),
                conflictTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                enrolledTime: `${enrolledSchedule.startTime} - ${enrolledSchedule.endTime}`,
              });
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      // Tạo message chi tiết
      const conflictMessages = conflicts.map(
        (c) =>
          `Lớp "${c.enrolledClass.name}" (${c.enrolledClass.subject}) - ${c.conflictDay}: ${c.conflictTime}`,
      );
      const message = `Lịch học của lớp này trùng với các lớp đã đăng ký:\n${conflictMessages.join('\n')}`;

      return {
        hasConflict: true,
        message,
        conflictDetails: conflicts,
      };
    }

    return { hasConflict: false, message: '' };
  }

  /**
   * Parse recurringSchedule từ nhiều định dạng khác nhau
   * 
   * Hỗ trợ các format:
   * 1. Object có property schedules (format chính):
   *    { schedules: [{ day: "monday", startTime: "18:00", endTime: "20:00" }, ...] }
   * 2. Array trực tiếp:
   *    [{ day: "monday", startTime: "18:00", endTime: "20:00" }, ...]
   */
  private parseRecurringSchedule(schedule: any): Array<{ day: string; startTime: string; endTime: string }> {
    if (!schedule) {
      return [];
    }

    // Trường hợp 1: Object có property schedules (format chính)
    // Format: { schedules: [{ day: "monday", startTime: "18:00", endTime: "20:00" }, ...] }
    if (typeof schedule === 'object' && schedule.schedules && Array.isArray(schedule.schedules)) {
      return schedule.schedules.map((s: any) => ({
        day: s.day || s.dayOfWeek || '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
      }));
    }

    // Trường hợp 2: Array trực tiếp (backward compatibility)
    // Format: [{ day: "monday", startTime: "18:00", endTime: "20:00" }, ...]
    if (Array.isArray(schedule)) {
      return schedule.map((s: any) => ({
        day: s.day || s.dayOfWeek || '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
      }));
    }

    return [];
  }

  /**
   * Chuẩn hóa dayOfWeek về cùng format (lowercase)
   */
  private normalizeDayOfWeek(day: string): string {
    if (!day) return '';
    return day.toLowerCase().trim();
  }

  /**
   * Kiểm tra hai khoảng thời gian có overlap (trùng) không
   * 
   * Công thức: start1 < end2 && end1 > start2
   * 
   * Giải thích:
   * - Hai khoảng thời gian overlap khi chúng có phần chung
   * - Điều kiện 1: start1 < end2 → Khoảng 1 bắt đầu trước khi khoảng 2 kết thúc
   * - Điều kiện 2: end1 > start2 → Khoảng 1 kết thúc sau khi khoảng 2 bắt đầu
   * - Cả hai điều kiện đều đúng → OVERLAP
   * 
   * Ví dụ:
   * 1. Khoảng 1: 08:00-10:00, Khoảng 2: 09:00-11:00
   *    → 08:00 < 11:00 (true) && 10:00 > 09:00 (true) → OVERLAP 
   * 
   * 2. Khoảng 1: 08:00-10:00, Khoảng 2: 10:00-12:00
   *    → 08:00 < 12:00 (true) && 10:00 > 10:00 (false) → KHÔNG OVERLAP 
   *    (Tiếp giáp nhau, không overlap)
   * 
   * 3. Khoảng 1: 08:00-10:00, Khoảng 2: 11:00-13:00
   *    → 08:00 < 13:00 (true) && 10:00 > 11:00 (false) → KHÔNG OVERLAP 
   *    (Tách biệt, không overlap)
   * 
   * 4. Khoảng 1: 08:00-12:00, Khoảng 2: 09:00-11:00
   *    → 08:00 < 11:00 (true) && 12:00 > 09:00 (true) → OVERLAP 
   *    (Khoảng 2 nằm trong khoảng 1)
   */
  private isTimeOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    // Convert time string (HH:mm) to minutes for comparison
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };

    const start1Min = toMinutes(start1);
    const end1Min = toMinutes(end1);
    const start2Min = toMinutes(start2);
    const end2Min = toMinutes(end2);

    // Overlap condition: start1 < end2 && end1 > start2
    // Hai khoảng overlap khi: khoảng 1 bắt đầu trước khi khoảng 2 kết thúc
    // VÀ khoảng 1 kết thúc sau khi khoảng 2 bắt đầu
    return start1Min < end2Min && end1Min > start2Min;
  }

  /**
   * Lấy tên ngày tiếng Việt
   */
  private getDayName(day: string): string {
    const dayNames: { [key: string]: string } = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật',
    };

    const normalizedDay = this.normalizeDayOfWeek(day);
    return dayNames[normalizedDay] || day;
  }

  /**
   * Hủy yêu cầu tham gia lớp học
   */
  async cancelClassRequest(userId: string, requestId: string) {
    // Verify parent owns this request
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          select: { id: true },
        },
      },
    });

    if (!parent) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
        HttpStatus.NOT_FOUND,
      );
    }

    const studentIds = parent.students.map((s) => s.id);

    // Find the request
    const request = await this.prisma.studentClassRequest.findUnique({
      where: { id: requestId },
      include: {
        student: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!request) {
      throw new HttpException(
        { success: false, message: 'Không tìm thấy yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify this request belongs to this parent's student
    if (!studentIds.includes(request.studentId)) {
      throw new HttpException(
        { success: false, message: 'Bạn không có quyền hủy yêu cầu này' },
        HttpStatus.FORBIDDEN,
      );
    }

    // Only allow canceling pending or under_review requests
    if (!['pending', 'under_review'].includes(request.status)) {
      throw new HttpException(
        {
          success: false,
          message: `Không thể hủy yêu cầu có trạng thái "${request.status}"`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update request status to cancelled
    const updatedRequest = await this.prisma.studentClassRequest.update({
      where: { id: requestId },
      data: {
        status: 'cancelled',
        processedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Đã hủy yêu cầu tham gia lớp "${request.class.name}" cho ${request.student.user?.fullName || 'học sinh'}`,
      data: updatedRequest,
    };
  }
}

