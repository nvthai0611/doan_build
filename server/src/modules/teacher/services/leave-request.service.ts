import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';
import { AffectedSessionCreateDto, LeaveRequestDto } from '../dto/leave-request/leave-request.dto';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async getAffectedSessions(
    teacherId: string,
    startDate: string,
    endDate: string,
  ) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    if (!startDate || !endDate) {
      throw new HttpException('Thiếu tham số ngày', HttpStatus.BAD_REQUEST);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException('Định dạng ngày không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    if (end < start) {
      throw new HttpException('Ngày kết thúc phải sau ngày bắt đầu', HttpStatus.BAD_REQUEST);
    }

    // Tìm các buổi dạy mà giáo viên có assignment trong khoảng ngày
    const sessions = await this.prisma.classSession.findMany({
      where: {
        sessionDate: {
          gte: start,
          lte: end,
        },
        teacherId: teacherId,
      },
      select: {
        id: true,
        sessionDate: true,
        startTime: true,
        endTime: true,
        class: {
          select: {
            name: true,
          },
        },
        room: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });

    return sessions.map((s) => ({
      id: s.id,
      date: s.sessionDate.toISOString().slice(0, 10),
      time: `${s.startTime} - ${s.endTime}`,
      className: s.class?.name || '',
      room: s.room?.name || '',
      selected: true,
    }));
  }

  async getReplacementTeachers(
    requestingTeacherId: string,
    sessionId: string,
    date: string,
    time: string,
  ) {
    // 1. Validate input
    if (!requestingTeacherId || !checkId(requestingTeacherId)) {
      throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    if (!sessionId || !checkId(sessionId)) {
      throw new HttpException('ID buổi học không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    if (!date || !time) {
      throw new HttpException('Thiếu tham số ngày hoặc giờ', HttpStatus.BAD_REQUEST);
    }

    // 2. Lấy thông tin buổi học và môn học
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            subject: true,
          }
        }
      }
    });

    if (!session) {
      throw new HttpException('Không tìm thấy buổi học', HttpStatus.NOT_FOUND);
    }

    // Kiểm tra xem session có thuộc về teacher đang request không
    if (session.teacherId !== requestingTeacherId) {
      throw new HttpException('Bạn không có quyền truy cập buổi học này', HttpStatus.FORBIDDEN);
    }

    const subjectName = session.class.subject.name;
    const [startTime, endTime] = time.split('-').map(t => t.trim());

    // 3. Tìm giáo viên có thể thay thế
    // Lấy tất cả giáo viên khác (trừ giáo viên đang xin nghỉ)
    const allTeachers = await this.prisma.teacher.findMany({
      where: {
        id: { not: requestingTeacherId },
        user: { isActive: true },
        subjects: { has: subjectName }, // Có thể dạy cùng môn
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          }
        },
        classes: {
          include: {
            subject: true
          }
        }
      }
    });

    // 4. Kiểm tra lịch trống cho từng giáo viên
    const availableTeachers = [];
    
    for (const teacher of allTeachers) {
      // Kiểm tra xem giáo viên có lịch trống trong khung giờ này không
      const hasConflict = await this.prisma.classSession.findFirst({
        where: {
          sessionDate: new Date(date),
          teacherId: teacher.id,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
              ]
            }
          ]
        }
      });

      if (!hasConflict) {
        availableTeachers.push(teacher);
      }
    }

    // 5. Tính điểm phù hợp và sắp xếp
    const replacementTeachers = availableTeachers.map(teacher => {
      const compatibilityScore = this.calculateCompatibilityScore(teacher, subjectName);
      const compatibilityReason = this.generateCompatibilityReason(teacher, subjectName);
      
      return {
        id: teacher.id,
        fullName: teacher.user.fullName || 'N/A',
        email: teacher.user.email,
        phone: teacher.user.phone,
        subjects: teacher.subjects,
        compatibilityScore,
        compatibilityReason,
        isAvailable: true,
        availabilityNote: 'Có thể dạy thay trong khung giờ này'
      };
    });

    // 6. Sắp xếp theo điểm phù hợp (cao nhất trước)
    return replacementTeachers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  private calculateCompatibilityScore(teacher: any, subjectName: string): number {
    let score = 0;
    
    // Điểm cơ bản nếu có thể dạy môn này
    if (teacher.subjects.includes(subjectName)) {
      score += 3;
    }
    
    // Điểm thêm nếu có kinh nghiệm dạy môn này
    const hasExperience = teacher.classes.some(
      (classItem: any) => classItem.subject.name === subjectName
    );
    if (hasExperience) {
      score += 2;
    }
    
    // Điểm thêm nếu có ít lịch dạy (linh hoạt hơn)
    const currentClasses = teacher.classes.length;
    if (currentClasses <= 2) {
      score += 1;
    }
    
    return Math.min(score, 5); // Tối đa 5 điểm
  }

  private generateCompatibilityReason(teacher: any, subjectName: string): string {
    const reasons = [];
    
    if (teacher.subjects.includes(subjectName)) {
      reasons.push(`Có thể dạy môn ${subjectName}`);
    }
    
    const hasExperience = teacher.classes.some(
      (classItem: any) => classItem.subject.name === subjectName
    );
    if (hasExperience) {
      reasons.push('Có kinh nghiệm dạy môn này');
    }
    
    const currentClasses = teacher.classes.length;
    if (currentClasses <= 2) {
      reasons.push('Lịch dạy linh hoạt');
    }
    
    return reasons.join(', ') || 'Có thể dạy thay';
  }


  async createLeaveRequest(teacherId: string, body: LeaveRequestDto, affectedSessions?: AffectedSessionCreateDto[], createdBy?: string) {

    // 2. Tạo leave request với affected sessions
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        teacherId,
        requestType: body.leaveType,
        reason: body.reason,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: 'pending',
        createdBy: createdBy,
        createdAt: new Date(),
        imageUrl: body.imageUrl || null,
        affectedSessions: {
          create:
            affectedSessions.map((session) => ({
              sessionId: session.id,
              replacementTeacherId: session.replacementTeacherId || null,
              notes: session.notes,
            })) || [],
        },
      },
      include: {
        affectedSessions: {
          include: {
            session: {
              include: {
                class: { include: { subject: true } },
                room: true,
              },
            },
            replacementTeacher: {
              include: { user: true },
            },
          },
        },
      },
    });

    return leaveRequest;
  }

  async getMyLeaveRequests(
    teacherId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      requestType?: string;
    }
  ) {
    const { page, limit, status, requestType } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      teacherId,
    };

    if (status) {
      where.status = status;
    }

    if (requestType) {
      where.requestType = requestType;
    }

    // Get total count
    const total = await this.prisma.leaveRequest.count({ where });

    // Get leave requests with pagination
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        requestType: true,
        reason: true,
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
        createdBy: true,
        createdByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
        approvedBy: true,
        approvedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
        affectedSessions: {
          select: {
            id: true,
            notes: true,
            session: {
              select: {
                id: true,
                sessionDate: true,
                startTime: true,
                endTime: true,
                notes: true,
                class: {
                  select: {
                    name: true,
                    subject: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                room: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            // replacementTeacher: {
            //   include: {
            //     user: {
            //       select: {
            //         fullName: true,
            //         email: true,
            //       },
            //     },
            //   },
            // },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: leaveRequests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Hủy đơn xin nghỉ (chỉ khi status = pending)
   */
  async cancelLeaveRequest(teacherId: string, leaveRequestId: string) {
    if (!teacherId || !checkId(teacherId)) {
      throw new HttpException(
        'ID giáo viên không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!leaveRequestId || !checkId(leaveRequestId)) {
      throw new HttpException(
        'ID đơn xin nghỉ không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find and verify ownership
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        teacher: true,
      },
    });

    if (!leaveRequest) {
      throw new HttpException(
        'Không tìm thấy đơn xin nghỉ',
        HttpStatus.NOT_FOUND,
      );
    }

    if (leaveRequest.teacherId !== teacherId) {
      throw new HttpException('Không có quyền hủy đơn này', HttpStatus.FORBIDDEN);
    }

    if (leaveRequest.status !== 'pending') {
      throw new HttpException(
        'Chỉ có thể hủy đơn đang chờ duyệt',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: 'cancelled',
      },
    });

    return { success: true };
  }
}
