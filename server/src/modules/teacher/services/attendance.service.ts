import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // Lấy danh sách học sinh theo ID buổi học
  async getListStudentBySessionId(sessionId: string) {
    try {
      if (!checkId(sessionId)) {
        throw new HttpException(
          {
            message: 'Id session không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const checkExistSession = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: true,
        },
      });

      if (!checkExistSession) {
        throw new HttpException(
          {
            message: 'Buổi học không tồn tại',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const classStartDate = checkExistSession.class.actualStartDate || new Date();

      const result = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              enrollments: {
                where: {
                  status: 'studying',
                  enrolledAt: {
                    lte: classStartDate,
                  },
                },
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
                },
              },
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Lỗi khi lấy danh sách học sinh',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAttendanceBySessionId(sessionId: string) {
    if (!checkId(sessionId)) {
      throw new HttpException('Invalid session ID', HttpStatus.BAD_REQUEST);
    }

    const result = await this.prisma.studentSessionAttendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                avatar: true,
                fullName: true,
              },
            },
          },
        },
        session: {
          include: {
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return result;
  }

  // Lấy danh sách đơn xin nghỉ của học sinh trong ngày học
  async getLeaveRequestsBySessionId(sessionId: string) {
    try {
      if (!checkId(sessionId)) {
        throw new HttpException('Invalid session ID', HttpStatus.BAD_REQUEST);
      }

      const session = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        select: { sessionDate: true },
      });

      if (!session) {
        throw new HttpException('Session không tồn tại', HttpStatus.NOT_FOUND);
      }

      const sessionDate = new Date(session.sessionDate);
      const sessionDateStart = new Date(sessionDate.toDateString());
      const sessionDateEnd = new Date(sessionDateStart);
      sessionDateEnd.setDate(sessionDateEnd.getDate() + 1);

      // Lấy các đơn xin nghỉ chưa approve trong ngày học
      const leaveRequests = await this.prisma.leaveRequest.findMany({
        where: {
          studentId: { not: null },
          status: 'pending',
          startDate: { gte: sessionDateStart },
          endDate: { lt: sessionDateEnd },
        },
        include: {
          student: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          createdByUser: {
            select: {
              fullName: true,
            },
          },
        },
      });

      return leaveRequests;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Lỗi khi lấy danh sách đơn xin nghỉ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Điểm danh học sinh theo buổi học
  // Chỉ update status cho các học sinh đã có
  async attendanceStudentBySessionId(
    sessionId: string,
    records: any[],
    teacherId: string,
  ) {
    if (!checkId(sessionId) || !checkId(teacherId)) {
      throw new HttpException('Invalid session or teacher ID', HttpStatus.BAD_REQUEST);
    }

    const findSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!findSession) {
      throw new HttpException('Buổi học không tồn tại', HttpStatus.NOT_FOUND);
    }

    const sessionDate = new Date(findSession.sessionDate);
    const currentDate = new Date();

    const sessionDateOnly = new Date(sessionDate.toDateString());
    const currentDateOnly = new Date(currentDate.toDateString());

    // 1. Kiểm tra chưa đến ngày học
    if (currentDateOnly < sessionDateOnly) {
      throw new HttpException(
        'Chưa đến ngày học, không thể điểm danh',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Kiểm tra đã qua ngày học (sau 00h ngày hôm sau)
    if (currentDateOnly > sessionDateOnly) {
      throw new HttpException(
        'Đã qua ngày học, không thể điểm danh',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Đúng ngày học - kiểm tra giờ
    if (currentDateOnly.getTime() === sessionDateOnly.getTime()) {
      if (currentDate < sessionDate) {
        throw new HttpException(
          'Chưa đến giờ bắt đầu lớp, không thể điểm danh',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const upsertPromises = records.map(async (record) => {
          if (!checkId(record.studentId)) {
            throw new HttpException(`Invalid student ID: ${record.studentId}`, HttpStatus.BAD_REQUEST);
          }

          // Nếu status là "excused", duyệt đơn xin nghỉ
          if (record.status === 'excused') {
            await this.approveLeaveRequestForStudent(
              record.studentId,
              sessionId,
              teacherId,
              prisma,
            );
          }

          return prisma.studentSessionAttendance.upsert({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: record.studentId,
              },
            },
            update: {
              status: record.status,
              note: record.note || '',
              recordedAt: new Date(),
              recordedByTeacher: {
                connect: { id: teacherId },
              },
            },
            create: {
              status: record.status,
              note: record.note || '',
              recordedAt: new Date(),
              session: {
                connect: { id: sessionId },
              },
              student: {
                connect: { id: record.studentId },
              },
              recordedByTeacher: {
                connect: { id: teacherId },
              },
            },
          });
        });

        return Promise.all(upsertPromises);
      }, {
        maxWait: 10000,
        timeout: 20000,
      });

      return {
        data: {
          updated: result.length,
          total: records.length,
        },
        message: `Cập nhật ${result.length} bản ghi điểm danh thành công`,
      };
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw new HttpException(
        'Lỗi khi cập nhật điểm danh',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper method: Duyệt đơn xin nghỉ của học sinh trong ngày
  private async approveLeaveRequestForStudent(
    studentId: string,
    sessionId: string,
    teacherId: string,
    prisma: any,
  ) {
    try {
      const session = await prisma.classSession.findUnique({
        where: { id: sessionId },
        select: { sessionDate: true },
      });

      if (!session) return;

      const sessionDate = new Date(session.sessionDate);
      const sessionDateStart = new Date(sessionDate.toDateString());
      const sessionDateEnd = new Date(sessionDateStart);
      sessionDateEnd.setDate(sessionDateEnd.getDate() + 1);

      // Tìm đơn xin nghỉ pending trong ngày
      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: {
          studentId,
          status: 'pending',
          startDate: { gte: sessionDateStart },
          endDate: { lt: sessionDateEnd },
        },
      });

      if (leaveRequest) {
        // Duyệt đơn xin nghỉ
        await prisma.leaveRequest.update({
          where: { id: leaveRequest.id },
          data: {
            status: 'approved',
            approvedBy: teacherId,
            approvedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      // Không throw error, chỉ log để không ảnh hưởng đến điểm danh
    }
  }

  async getRequestAttendance() {
    try {
    } catch (error) {
    }
  }
}
