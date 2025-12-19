import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class ScheduleConflictService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách các buổi học bị trùng phòng
   *
   * @param query - Object chứa:
   *   - startDate: Ngày bắt đầu (optional, default: hôm nay)
   *   - endDate: Ngày kết thúc (optional, default: 7 ngày sau)
   *   - roomId: Lọc theo phòng (optional)
   *
   * @returns Danh sách các buổi học bị conflict
   */
  async getRoomConflicts(query: any = {}) {
    try {
      const startDate = query.startDate
        ? new Date(query.startDate)
        : new Date();
      const endDate = query.endDate
        ? new Date(query.endDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày sau

      const where: any = {
        sessionDate: {
          gte: startDate,
          lte: endDate,
        },
        roomId: {
          not: null,
        },
        status: {
          notIn: ['cancelled', 'day_off'],
        },
        class: {
          status: {
            in: ['active', 'suspended'],
          },
        },
      };

      if (query.roomId) {
        where.roomId = query.roomId;
      }

      // Lấy tất cả sessions trong khoảng thời gian
      const sessions = await this.prisma.classSession.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              //   code: true,
            },
          },
          room: {
            select: {
              id: true,
              name: true,
              //   code: true,
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
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      });

      // Group sessions theo phòng + thời gian để tìm conflicts
      const conflictGroups: any[] = [];
      const processedIds = new Set<string>();

      for (let i = 0; i < sessions.length; i++) {
        if (processedIds.has(sessions[i].id)) continue;

        const currentSession = sessions[i];
        const conflicts: any[] = [currentSession];

        // Tìm các session khác cùng phòng, cùng ngày, trùng thời gian
        for (let j = i + 1; j < sessions.length; j++) {
          if (processedIds.has(sessions[j].id)) continue;

          const otherSession = sessions[j];

          // Check cùng phòng, cùng ngày
          if (
            currentSession.roomId === otherSession.roomId &&
            currentSession.sessionDate.getTime() ===
              otherSession.sessionDate.getTime()
          ) {
            // Check trùng thời gian
            if (
              this.isTimeOverlap(
                currentSession.startTime,
                currentSession.endTime,
                otherSession.startTime,
                otherSession.endTime,
              )
            ) {
              conflicts.push(otherSession);
              processedIds.add(otherSession.id);
            }
          }
        }

        // Nếu có conflict (>1 session cùng slot)
        if (conflicts.length > 1) {
          processedIds.add(currentSession.id);

          conflictGroups.push({
            roomId: currentSession.roomId,
            roomName: currentSession.room?.name || 'N/A',
            date: currentSession.sessionDate,
            startTime: currentSession.startTime,
            endTime: currentSession.endTime,
            conflictCount: conflicts.length,
            sessions: conflicts.map((s) => ({
              id: s.id,
              classId: s.classId,
              className: s.class?.name || 'N/A',
              classCode: s.class?.code || 'N/A',
              teacherId: s.substituteTeacherId || s.teacherId,
              teacherName:
                s.substituteTeacher?.user?.fullName ||
                s.teacher?.user?.fullName ||
                'N/A',
              isSubstitute: !!s.substituteTeacherId,
              startTime: s.startTime,
              endTime: s.endTime,
              status: s.status,
            })),
          });
        }
      }

      return {
        success: true,
        message: `Tìm thấy ${conflictGroups.length} nhóm conflict`,
        data: conflictGroups,
        meta: {
          startDate,
          endDate,
          totalConflicts: conflictGroups.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách conflicts',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy các time slots mà giáo viên đang rảnh
   *
   * @param teacherId - ID của giáo viên
   * @param query - Object chứa:
   *   - startDate: Ngày bắt đầu
   *   - endDate: Ngày kết thúc
   *
   * @returns Danh sách các slots rảnh
   */
  async getTeacherAvailableSlots(teacherId: string, query: any = {}) {
    try {
      // Validate teacher exists
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });

      if (!teacher) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy giáo viên',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const startDate = query.startDate
        ? new Date(query.startDate)
        : new Date();
      const endDate = query.endDate
        ? new Date(query.endDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Lấy tất cả sessions của giáo viên (bao gồm cả dạy thay)
      const busySessions = await this.prisma.classSession.findMany({
        where: {
          sessionDate: {
            gte: startDate,
            lte: endDate,
          },
          OR: [{ teacherId }, { substituteTeacherId: teacherId }],
          status: {
            notIn: ['cancelled'],
          },
        },
        select: {
          sessionDate: true,
          startTime: true,
          endTime: true,
          classId: true,
          class: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      });

      // Group theo ngày
      const busySlotsByDate: Record<string, any[]> = {};
      busySessions.forEach((session) => {
        const dateKey = session.sessionDate.toISOString().split('T')[0];
        if (!busySlotsByDate[dateKey]) {
          busySlotsByDate[dateKey] = [];
        }
        busySlotsByDate[dateKey].push({
          startTime: session.startTime,
          endTime: session.endTime,
          className: session.class?.name || 'N/A',
        });
      });

      return {
        success: true,
        message: 'Lấy lịch giáo viên thành công',
        data: {
          teacherId,
          teacherName: teacher.user?.fullName || 'N/A',
          busySlots: busySlotsByDate,
        },
        meta: {
          startDate,
          endDate,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy lịch giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Thêm buổi học mới với auto-check conflicts
   *
   * @param body - Object chứa:
   *   - classId: ID lớp học
   *   - sessionDate: Ngày học
   *   - startTime: Giờ bắt đầu
   *   - endTime: Giờ kết thúc
   *   - teacherId: ID giáo viên (optional, mặc định lấy từ class)
   *   - roomId: ID phòng (optional, mặc định lấy từ class)
   *   - notes: Ghi chú (optional)
   *
   * @returns Session đã tạo hoặc conflicts
   */
  async addSession(body: any) {
    try {
      // Validate required fields
      if (
        !body.classId ||
        !body.sessionDate ||
        !body.startTime ||
        !body.endTime
      ) {
        throw new HttpException(
          {
            success: false,
            message: 'classId, sessionDate, startTime, endTime là bắt buộc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate time logic
      if (body.startTime >= body.endTime) {
        throw new HttpException(
          {
            success: false,
            message: 'Giờ kết thúc phải sau giờ bắt đầu',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get class info
      const classInfo = await this.prisma.class.findUnique({
        where: { id: body.classId },
        select: {
          id: true,
          name: true,
          teacherId: true,
          roomId: true,
          academicYear: true,
        },
      });

      if (!classInfo) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Determine teacher and room
      const teacherId = body.teacherId || classInfo.teacherId;
      const roomId = body.roomId || classInfo.roomId;

      if (!teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp chưa có giáo viên, vui lòng chỉ định teacherId',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const sessionDate = new Date(body.sessionDate);

      // Check conflicts
      const conflicts: any = {
        teacher: [],
        room: [],
      };

      // Check teacher conflicts
      const teacherConflicts = await this.prisma.classSession.findMany({
        where: {
          sessionDate,
          OR: [{ teacherId }, { substituteTeacherId: teacherId }],
          status: {
            notIn: ['cancelled'],
          },
        },
        include: {
          class: {
            select: {
              name: true,
            },
          },
        },
      });

      teacherConflicts.forEach((session) => {
        if (
          this.isTimeOverlap(
            body.startTime,
            body.endTime,
            session.startTime,
            session.endTime,
          )
        ) {
          conflicts.teacher.push({
            className: session.class?.name || 'N/A',
            startTime: session.startTime,
            endTime: session.endTime,
          });
        }
      });

      // Check room conflicts (nếu có roomId)
      if (roomId) {
        const roomConflicts = await this.prisma.classSession.findMany({
          where: {
            sessionDate,
            roomId,
            status: {
              notIn: ['cancelled'],
            },
          },
          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        });

        roomConflicts.forEach((session) => {
          if (
            this.isTimeOverlap(
              body.startTime,
              body.endTime,
              session.startTime,
              session.endTime,
            )
          ) {
            conflicts.room.push({
              className: session.class?.name || 'N/A',
              startTime: session.startTime,
              endTime: session.endTime,
            });
          }
        });
      }

      // Nếu có conflicts, return conflicts
      if (conflicts.teacher.length > 0 || conflicts.room.length > 0) {
        return {
          success: false,
          message: 'Có xung đột lịch học',
          conflicts,
        };
      }

      // Nếu không có roomId, suggest available rooms
      let suggestedRoomId = roomId;
      if (!suggestedRoomId) {
        const availableRooms = await this.prisma.room.findMany({
          where: {
            isActive: true,
          },
        });

        // Check từng phòng xem có trống không
        for (const room of availableRooms) {
          const roomBusy = await this.prisma.classSession.findFirst({
            where: {
              sessionDate,
              roomId: room.id,
              status: {
                notIn: ['cancelled'],
              },
            },
          });

          const hasConflict =
            roomBusy &&
            this.isTimeOverlap(
              body.startTime,
              body.endTime,
              roomBusy.startTime,
              roomBusy.endTime,
            );

          if (!hasConflict) {
            suggestedRoomId = room.id;
            break;
          }
        }
      }

      // Create session
      const newSession = await this.prisma.classSession.create({
        data: {
          classId: body.classId,
          sessionDate,
          startTime: body.startTime,
          endTime: body.endTime,
          teacherId: teacherId,
          roomId: suggestedRoomId,
          notes: body.notes || null,
          status: 'has_not_happened',
          academicYear: classInfo.academicYear,
        },
        include: {
          class: {
            select: {
              name: true,
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
          room: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Thêm buổi học thành công',
        data: newSession,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi thêm buổi học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Helper: Check time overlap
   */
  private isTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    return startA < endB && startB < endA;
  }
}
