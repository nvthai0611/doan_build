import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateScheduleChangeDto } from '../dto/schedule-change/create-schedule-change.dto';
import { ScheduleChangeResponseDto } from '../dto/schedule-change/schedule-change-response.dto';
import { ScheduleChangeFiltersDto } from '../dto/schedule-change/schedule-change-filters.dto';

@Injectable()
export class ScheduleChangeService {
  constructor(private readonly prisma: PrismaService) {}

  // Create schedule change request
  async createScheduleChange(
    createDto: CreateScheduleChangeDto,
    teacherId: string,
  ): Promise<ScheduleChangeResponseDto> {
    // Validate class exists and teacher has access
    const classData = await this.prisma.class.findFirst({
      where: {
        id: createDto.classId.toString(),
        teacherId: teacherId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Lớp học không tồn tại hoặc bạn không có quyền truy cập');
    }

    // Validate session exists
    const session = await this.prisma.classSession.findFirst({
      where: {
        id: createDto.sessionId.toString(),
        classId: createDto.classId.toString(),
      },
    });

    if (!session) {
      throw new NotFoundException('Buổi học không tồn tại');
    }

    // Check for conflicts if rescheduling
    if (createDto.changeType === 'reschedule' && createDto.newDate && createDto.newStartTime) {
      const conflictCheck = await this.checkScheduleConflict(
        createDto.newDate,
        createDto.newStartTime,
        createDto.newEndTime || session.endTime,
        createDto.newRoomId?.toString(),
        teacherId,
      );

      if (conflictCheck.hasConflict) {
        throw new BadRequestException(conflictCheck.message);
      }
    }

    // Create schedule change request
    const scheduleChange = await this.prisma.scheduleChange.create({
      data: {
        classId: createDto.classId.toString(),
        originalDate: session.sessionDate,
        originalTime: session.startTime,
        newDate: createDto.newDate ? new Date(createDto.newDate) : session.sessionDate,
        newTime: createDto.newStartTime || session.startTime,
        newRoomId: createDto.newRoomId?.toString(),
        reason: createDto.reason,
        status: 'pending',
        requestedBy: teacherId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        newRoom: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
      },
    });

    return this.mapToResponseDto(scheduleChange, classData.teacher);
  }

  // Get my schedule change requests
  async getMyScheduleChanges(
    teacherId: string,
    filters: ScheduleChangeFiltersDto,
  ): Promise<{ data: ScheduleChangeResponseDto[]; meta: any }> {
    const { page = 1, limit = 10, status, changeType, classId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      requestedBy: teacherId,
    };

    if (status) {
      where.status = status;
    }

    if (classId) {
      where.classId = classId.toString();
    }

    const [scheduleChanges, total] = await Promise.all([
      this.prisma.scheduleChange.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          requestedAt: 'desc',
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          newRoom: {
            select: {
              id: true,
              name: true,
              capacity: true,
            },
          },
        },
      }),
      this.prisma.scheduleChange.count({ where }),
    ]);

    // Get teacher info for mapping
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const data = scheduleChanges.map((sc) => this.mapToResponseDto(sc, teacher));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get schedule change detail
  async getScheduleChangeDetail(
    id: string,
    teacherId: string,
  ): Promise<ScheduleChangeResponseDto> {
    const scheduleChange = await this.prisma.scheduleChange.findFirst({
      where: {
        id,
        requestedBy: teacherId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        newRoom: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
      },
    });

    if (!scheduleChange) {
      throw new NotFoundException('Yêu cầu dời lịch không tồn tại');
    }

    // Get teacher info
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return this.mapToResponseDto(scheduleChange, teacher);
  }

  // Cancel schedule change request
  async cancelScheduleChange(id: string, teacherId: string): Promise<void> {
    const scheduleChange = await this.prisma.scheduleChange.findFirst({
      where: {
        id,
        requestedBy: teacherId,
        status: 'pending',
      },
    });

    if (!scheduleChange) {
      throw new NotFoundException('Yêu cầu dời lịch không tồn tại hoặc không thể hủy');
    }

    await this.prisma.scheduleChange.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  // Helper: Check for schedule conflicts
  private async checkScheduleConflict(
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    newRoomId?: string,
    teacherId?: string,
  ): Promise<{ hasConflict: boolean; message: string }> {
    // Check room availability
    if (newRoomId) {
      const roomConflict = await this.prisma.classSession.findFirst({
        where: {
          roomId: newRoomId,
          sessionDate: new Date(newDate),
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (roomConflict) {
        return {
          hasConflict: true,
          message: 'Phòng học đã được sử dụng trong khoảng thời gian này',
        };
      }
    }

    // Check teacher availability
    if (teacherId) {
      const teacherConflict = await this.prisma.classSession.findFirst({
        where: {
          class: {
            teacherId: teacherId,
          },
          sessionDate: new Date(newDate),
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (teacherConflict) {
        return {
          hasConflict: true,
          message: 'Bạn đã có lớp học khác trong khoảng thời gian này',
        };
      }
    }

    return { hasConflict: false, message: '' };
  }

  // Helper: Map database result to response DTO
  private mapToResponseDto(scheduleChange: any, teacher: any): ScheduleChangeResponseDto {
    return {
      id: parseInt(scheduleChange.id),
      classId: parseInt(scheduleChange.classId),
      class: {
        id: parseInt(scheduleChange.class.id),
        name: scheduleChange.class.name,
        description: scheduleChange.class.description,
      },
      sessionId: 0, // Not available in current schema
      session: {
        id: 0,
        sessionDate: scheduleChange.originalDate,
        startTime: scheduleChange.originalTime,
        endTime: scheduleChange.newTime,
      },
      changeType: 'reschedule', // Default based on schema
      newDate: scheduleChange.newDate,
      newStartTime: scheduleChange.newTime,
      newEndTime: scheduleChange.newTime,
      newRoomId: scheduleChange.newRoomId ? parseInt(scheduleChange.newRoomId) : undefined,
      newRoom: scheduleChange.newRoom ? {
        id: parseInt(scheduleChange.newRoom.id),
        name: scheduleChange.newRoom.name,
        capacity: scheduleChange.newRoom.capacity,
      } : undefined,
      reason: scheduleChange.reason,
      notes: undefined,
      status: scheduleChange.status,
      teacherId: parseInt(teacher.id),
      teacher: {
        id: parseInt(teacher.id),
        userId: teacher.userId,
        user: teacher.user,
      },
      createdBy: parseInt(teacher.id),
      approvedBy: undefined,
      approvedAt: scheduleChange.processedAt,
      createdAt: scheduleChange.requestedAt,
      updatedAt: scheduleChange.requestedAt,
    };
  }
}