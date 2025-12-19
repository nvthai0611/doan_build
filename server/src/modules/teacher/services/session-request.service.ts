import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateSessionRequestDto } from '../dto/session-request/create-session-request.dto';
import { SessionRequestResponseDto } from '../dto/session-request/session-request-response.dto';
import { SessionRequestFiltersDto } from '../dto/session-request/session-request-filters.dto';

@Injectable()
export class SessionRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async createSessionRequest(teacherId: string, dto: CreateSessionRequestDto): Promise<SessionRequestResponseDto> {
    try {
      // Basic validation
      const startMinutes = this.parseTimeToMinutes(dto.startTime);
      const endMinutes = this.parseTimeToMinutes(dto.endTime);

      if (isNaN(startMinutes) || isNaN(endMinutes)) {
        throw new BadRequestException('Giờ bắt đầu/kết thúc không hợp lệ (HH:MM)');
      }

      if (endMinutes <= startMinutes) {
        throw new BadRequestException('Giờ kết thúc phải sau giờ bắt đầu');
      }

      if (!['makeup_session', 'extra_session'].includes(dto.requestType)) {
        throw new BadRequestException('Loại yêu cầu không hợp lệ');
      }

      const sessionDateObj = new Date(dto.sessionDate);
      if (isNaN(sessionDateObj.getTime())) {
        throw new BadRequestException('Ngày buổi học không hợp lệ');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionDateStart = new Date(sessionDateObj);
      sessionDateStart.setHours(0, 0, 0, 0);
      if (sessionDateStart < today) {
        throw new BadRequestException('Ngày buổi học không được ở quá khứ');
      }

      // Get teacher info to get userId
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { userId: true }
      });

      if (!teacher) {
        throw new NotFoundException('Không tìm thấy thông tin giáo viên');
      }

      // Verify teacher assignment to the class
      const classInfo = await this.prisma.class.findFirst({
        where: { id: dto.classId, teacherId: teacherId },
        select: {
          id: true,
          name: true,
          subject: { select: { name: true } },
          actualEndDate: true,
        }
      });

      if (!classInfo) {
        throw new NotFoundException('Bạn không được phân công lớp này hoặc lớp không hoạt động');
      }

      if (classInfo.actualEndDate) {
        const classEnd = new Date(classInfo.actualEndDate);
        if (sessionDateObj > classEnd) {
          throw new BadRequestException('Ngày buổi học vượt quá thời gian kết thúc lớp học');
        }
      }

      if (dto.roomId) {
        const room = await this.prisma.room.findUnique({
          where: { id: dto.roomId },
        });
        if (!room) {
          throw new BadRequestException('Phòng học không tồn tại');
        }
      }

      // Validate time range conflict: room conflict (if roomId)
      if (dto.roomId) {
        const conflictRoom = await this.prisma.classSession.findFirst({
          where: {
            roomId: dto.roomId,
            sessionDate: sessionDateObj,
            startTime: { lte: dto.endTime },
            endTime: { gte: dto.startTime },
          }
        });
        if (conflictRoom) {
          throw new BadRequestException('Phòng học đã được sử dụng trong khoảng thời gian này');
        }
      }

      // Validate teacher time conflict across classes
      const conflictTeacher = await this.prisma.classSession.findFirst({
        where: {
          sessionDate: sessionDateObj,
          startTime: { lte: dto.endTime },
          endTime: { gte: dto.startTime },
          teacherId: teacherId
        }
      });
      if (conflictTeacher) {
        throw new BadRequestException('Bạn đã có buổi dạy khác trùng khung giờ này');
      }

      // Check for existing session request (pending/approved) overlapping same time
      const existingRequest = await this.prisma.sessionRequest.findFirst({
        where: {
          teacherId: teacherId,
          sessionDate: sessionDateObj,
          status: { in: ['pending', 'approved'] },
          OR: [
            {
              AND: [
                { startTime: { lte: dto.startTime } },
                { endTime: { gt: dto.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: dto.endTime } },
                { endTime: { gte: dto.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: dto.startTime } },
                { endTime: { lte: dto.endTime } },
              ],
            },
          ],
        }
      });

      if (existingRequest) {
        throw new BadRequestException('Bạn đã có yêu cầu đang chờ duyệt');
      }

      // Create session request
      const sessionRequest = await this.prisma.sessionRequest.create({
        data: {
          requestType: dto.requestType,
          teacherId: teacherId,
          classId: dto.classId,
          sessionDate: new Date(dto.sessionDate),
          startTime: dto.startTime,
          endTime: dto.endTime,
          roomId: dto.roomId,
          reason: dto.reason,
          notes: dto.notes,
          status: 'pending',
          createdBy: teacher.userId, // Use userId instead of teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { id: true, name: true } },
          teacher: {
            include: {
              user: { select: { fullName: true } }
            }
          },
          createdByUser: { select: { id: true, fullName: true } },
          approvedByUser: { select: { id: true, fullName: true } }
        }
      });

      return this.formatSessionRequestResponse(sessionRequest);
    } catch (error) {
      throw error;
    }
  }

  async getMySessionRequests(
    teacherId: string,
    filters: SessionRequestFiltersDto
  ): Promise<{ data: SessionRequestResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const { page = 1, limit = 10, status, requestType } = filters;
      const skip = (page - 1) * limit;

      const where: any = {
        teacherId: teacherId
      };

      if (status) {
        where.status = status;
      }

      if (requestType) {
        where.requestType = requestType;
      }

      const [sessionRequests, total] = await Promise.all([
        this.prisma.sessionRequest.findMany({
          where,
          include: {
            class: {
              include: {
                subject: { select: { name: true } }
              }
            },
            room: { select: { id: true, name: true } },
            teacher: {
              include: {
                user: { select: { fullName: true } }
              }
            },
            createdByUser: { select: { id: true, fullName: true } },
            approvedByUser: { select: { id: true, fullName: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.sessionRequest.count({ where })
      ]);

      return {
        data: sessionRequests.map(request => this.formatSessionRequestResponse(request)),
        total,
        page,
        limit
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách yêu cầu tạo buổi học: ${error.message}`);
    }
  }

  async getSessionRequestDetail(teacherId: string, requestId: string): Promise<SessionRequestResponseDto | null> {
    try {
      const sessionRequest = await this.prisma.sessionRequest.findFirst({
        where: {
          id: requestId,
          teacherId: teacherId
        },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { id: true, name: true } },
          teacher: {
            include: {
              user: { select: { fullName: true } }
            }
          },
          createdByUser: { select: { id: true, fullName: true } },
          approvedByUser: { select: { id: true, fullName: true } }
        }
      });

      if (!sessionRequest) {
        return null;
      }

      return this.formatSessionRequestResponse(sessionRequest);
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết yêu cầu tạo buổi học: ${error.message}`);
    }
  }

  async cancelSessionRequest(teacherId: string, requestId: string): Promise<SessionRequestResponseDto | null> {
    try {
      const sessionRequest = await this.prisma.sessionRequest.findFirst({
        where: {
          id: requestId,
          teacherId: teacherId,
          status: 'pending'
        }
      });

      if (!sessionRequest) {
        throw new Error('Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý');
      }

      const updatedRequest = await this.prisma.sessionRequest.update({
        where: { id: requestId },
        data: { status: 'cancelled' },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          },
          room: { select: { id: true, name: true } },
          teacher: {
            include: {
              user: { select: { fullName: true } }
            }
          },
          createdByUser: { select: { id: true, fullName: true } },
          approvedByUser: { select: { id: true, fullName: true } }
        }
      });

      return this.formatSessionRequestResponse(updatedRequest);
    } catch (error) {
      throw new Error(`Lỗi khi hủy yêu cầu tạo buổi học: ${error.message}`);
    }
  }

  private formatSessionRequestResponse(sessionRequest: any): SessionRequestResponseDto {
    return {
      id: sessionRequest.id,
      requestType: sessionRequest.requestType,
      sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
      startTime: sessionRequest.startTime,
      endTime: sessionRequest.endTime,
      reason: sessionRequest.reason,
      notes: sessionRequest.notes,
      status: sessionRequest.status,
      createdAt: sessionRequest.createdAt,
      approvedAt: sessionRequest.approvedAt,
      class: {
        id: sessionRequest.class.id,
        name: sessionRequest.class.name,
        subject: {
          name: sessionRequest.class.subject.name
        }
      },
      room: sessionRequest.room ? {
        id: sessionRequest.room.id,
        name: sessionRequest.room.name
      } : undefined,
      teacher: {
        id: sessionRequest.teacher.id,
        user: {
          fullName: sessionRequest.teacher.user.fullName
        }
      },
      createdByUser: {
        id: sessionRequest.createdByUser.id,
        fullName: sessionRequest.createdByUser.fullName
      },
      approvedByUser: sessionRequest.approvedByUser ? {
        id: sessionRequest.approvedByUser.id,
        fullName: sessionRequest.approvedByUser.fullName
      } : undefined
    };
  }

  private parseTimeToMinutes(time: string): number {
    const [h, m] = time.split(':').map((v) => parseInt(v, 10));
    if (isNaN(h) || isNaN(m)) return NaN;
    return h * 60 + m;
  }
}
