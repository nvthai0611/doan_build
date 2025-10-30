import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { JoinClassByCodeDto, RequestJoinClassDto } from '../dto/request/join-class.dto';
import { AlertService } from '../../admin-center/services/alert.service';

@Injectable()
export class ClassJoinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
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
  async requestJoinClass(userId: string, dto: RequestJoinClassDto) {
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

    // Tạo request
    const request = await this.prisma.studentClassRequest.create({
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        message: dto.message || `Phụ huynh đăng ký lớp học cho ${student.user.fullName}`,
        commitmentImageUrl: dto.commitmentImageUrl,
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
}

