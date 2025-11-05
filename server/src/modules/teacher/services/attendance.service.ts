import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách học sinh của lớp theo ID buổi học
   * Chỉ hiển thị học sinh đã enrolled trước hoặc cùng ngày với buổi học
   * @param sessionId - ID của buổi học
   * @returns Thông tin buổi học kèm danh sách học sinh
   */
  async getListStudentBySessionId(sessionId: string) {
    try {
      if (!checkId(sessionId)) {
        throw new HttpException(
          'Id session không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }

      const session = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: { class: true },
      });

      if (!session) {
        throw new HttpException(
          'Buổi học không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      // Lấy danh sách học sinh đã enrolled trước hoặc cùng ngày với buổi học
      const result = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              enrollments: {
                where: {
                  status: 'studying',
                  enrolledAt: {
                    lte: session.sessionDate,
                  },
                },
                include: {
                  student: {
                    include: {
                      user: {
                        select: {
                          id: true,
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
      console.error('Error fetching student list by session:', error);
      throw new HttpException(
        'Lỗi khi lấy danh sách học sinh',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách điểm danh của buổi học
   * @param sessionId - ID của buổi học
   * @returns Danh sách bản ghi điểm danh
   */
  async getAttendanceBySessionId(sessionId: string) {
    if (!checkId(sessionId)) {
      throw new HttpException(
        'Id session không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.prisma.studentSessionAttendance.findMany({
        where: { sessionId },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
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
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return result;
    } catch (error) {
      console.error('Error fetching attendance by session:', error);
      throw new HttpException(
        'Lỗi khi lấy danh sách điểm danh',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách đơn xin nghỉ pending của học sinh trong ngày học
   * @param sessionId - ID của buổi học
   * @returns Danh sách đơn xin nghỉ chưa duyệt
   */
  async getLeaveRequestsBySessionId(sessionId: string) {
    try {
      if (!checkId(sessionId)) {
        throw new HttpException(
          'Id session không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }

      const session = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        select: { sessionDate: true },
      });

      if (!session) {
        throw new HttpException(
          'Buổi học không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      const getListExcused = this.prisma.leaveRequestAffectedSession.findMany({
        where:{
          sessionId: sessionId,
          leaveRequest: {
            status: 'pending',
          },
        },
        include:{
          leaveRequest: {
            include:{
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      avatar: true,
                      fullName: true,
                    },
                  },
                },
              },
              createdByUser: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        }
      })

      return getListExcused;
    } catch (error) {
      console.error('Error fetching leave requests by session:', error);
      throw new HttpException(
        'Lỗi khi lấy danh sách đơn xin nghỉ',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật trạng thái điểm danh cho học sinh
   * Tự động duyệt đơn xin nghỉ nếu trạng thái là "excused"
   */
  async attendanceStudentBySessionId(
    sessionId: string,
    records: any[],
    teacherId: string,
    userId: string,
  ): Promise<any> {
    if (!checkId(sessionId) || !checkId(teacherId)) {
      throw new HttpException(
        'Id session hoặc teacher không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!records || records.length === 0) {
      throw new HttpException(
        'Danh sách bản ghi điểm danh không được để trống',
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new HttpException(
        'Buổi học không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    this.validateAttendanceTime(session.sessionDate);

    try {
      console.log(`Processing attendance for ${records.length} students`, {
        sessionId,
        teacherId,
        recordsCount: records.length,
      });

      // Xử lý approve leave requests TRƯỚC transaction
      const excusedStudents = records
        .filter((r) => r.status === 'excused')
        .map((r) => r.studentId);

      if (excusedStudents.length > 0) {
        await this.approveLeaveRequestsForStudents(
          excusedStudents,
          sessionId,
          userId,
        );
      }

      // Upsert attendance records trong transaction với timeout cao hơn
      const result = await this.prisma.$transaction(
        async (prisma) => {
          // Batch records thành chunks để tránh transaction quá lâu
          const chunkSize = 10;
          const chunks = [];

          for (let i = 0; i < records.length; i += chunkSize) {
            chunks.push(records.slice(i, i + chunkSize));
          }

          const results = [];

          for (const chunk of chunks) {
            const chunkResults = await Promise.all(
              chunk.map((record) =>
                prisma.studentSessionAttendance.upsert({
                  where: {
                    sessionId_studentId: {
                      sessionId,
                      studentId: record.studentId,
                    },
                  },
                  update: {
                    status: record.status,
                    note: record.note || null,
                    recordedAt: new Date(),
                    recordedByTeacher: { connect: { id: teacherId } },
                  },
                  create: {
                    status: record.status,
                    note: record.note || null,
                    recordedAt: new Date(),
                    session: { connect: { id: sessionId } },
                    student: { connect: { id: record.studentId } },
                    recordedByTeacher: { connect: { id: teacherId } },
                  },
                }),
              ),
            );

            results.push(...chunkResults);
          }

          return results;
        },
        { maxWait: 5000, timeout: 30000 }, // Tăng timeout lên 30s
      );

      return {
        data: {
          updated: result.length,
          total: records.length,
        },
        message: `Cập nhật ${result.length} bản ghi điểm danh thành công`,
      };
    } catch (error: any) {
      console.error('Error updating attendance:', error.message);
      throw new HttpException(
        'Lỗi khi cập nhật điểm danh',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Duyệt đơn xin nghỉ cho nhiều học sinh
   * Batch update tất cả đơn trong một lần
   */
  private async approveLeaveRequestsForStudents(
    studentIds: string[],
    sessionId: string,
    userId: string,
  ): Promise<void> {
    if (!studentIds || studentIds.length === 0) {
      return;
    }

    try {
      console.log(
        `Approving leave requests for ${studentIds.length} students in session ${sessionId}`,
      );

      // Lấy tất cả đơn xin nghỉ pending
      const affectedSessions =
        await this.prisma.leaveRequestAffectedSession.findMany({
          where: {
            sessionId,
            leaveRequest: {
              studentId: { in: studentIds },
              status: 'pending',
            },
          },
          select: { leaveRequest: { select: { id: true } } },
        });

      if (affectedSessions.length === 0) {
        console.log(`No pending leave requests found for session ${sessionId}`);
        return;
      }

      // Extract unique leave request IDs
      const leaveRequestIds = [
        ...new Set(affectedSessions.map((as) => as.leaveRequest.id)),
      ];

      // Batch update tất cả trong một lần
      const updated = await this.prisma.leaveRequest.updateMany({
        where: {
          id: { in: leaveRequestIds },
          status: 'pending',
        },
        data: {
          status: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
        },
      });

      console.log(
        `Successfully approved ${updated.count} leave requests for session ${sessionId}`,
      );
    } catch (error: any) {
      console.error(
        `Error approving leave requests for session ${sessionId}:`,
        error.message,
      );
      // Không throw để không ảnh hưởng đến attendance update
    }
  }

  /**
   * Kiểm tra xem có thể điểm danh vào thời điểm hiện tại hay không
   */
  private validateAttendanceTime(sessionDate: Date): void {
    const currentDate = new Date();
    const sessionDateOnly = this.getDateStart(sessionDate);
    const currentDateOnly = this.getDateStart(currentDate);

    if (currentDateOnly < sessionDateOnly) {
      throw new HttpException(
        'Chưa đến ngày học, không thể điểm danh',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (currentDateOnly > sessionDateOnly) {
      throw new HttpException(
        'Đã qua ngày học, không thể điểm danh',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (currentDate < sessionDate) {
      throw new HttpException(
        'Chưa đến giờ bắt đầu lớp, không thể điểm danh',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Lấy đầu ngày (00:00:00)
   */
  private getDateStart(date: Date): Date {
    return new Date(new Date(date).toDateString());
  }

  /**
   * Lấy cuối ngày (00:00:00 ngày hôm sau)
   */
  private getDateEnd(dateStart: Date): Date {
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);
    return dateEnd;
  }
}
