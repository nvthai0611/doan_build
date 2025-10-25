import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  //Lấy danh sách học sinh theo ID buổi học
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
            mesage: 'Buổi học không tồn tại',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // Nếu lớp học chưa có ngày bắt đầu thực tế, sử dụng ngày hiện tại
    const classStartDate = checkExistSession.class.actualStartDate || new Date();
      //get list student in class session
      const result = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              enrollments: {
                where:{
                  status: 'studying',
                  enrolledAt: {
                    lte: classStartDate
                  }
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

  //Điểm danh học sinh theo buổi học
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

    // Lấy ngày hiện tại và ngày học (không tính giờ)
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
      // Chưa đến giờ bắt đầu lớp
      if (currentDate < sessionDate) {
        throw new HttpException(
          'Chưa đến giờ bắt đầu lớp, không thể điểm danh',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Đã đến giờ hoặc sau giờ học (nhưng vẫn trong ngày) -> cho phép điểm danh
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const upsertPromises = records.map((record) => {
          if (!checkId(record.studentId)) {
            throw new HttpException(`Invalid student ID: ${record.studentId}`, HttpStatus.BAD_REQUEST);
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
                connect: { id: teacherId }
              }
            },
            create: {
              status: record.status,
              note: record.note || '',
              recordedAt: new Date(),
              session: { 
                connect: { id: sessionId } 
              },
              student: { 
                connect: { id: record.studentId } 
              },
              recordedByTeacher: { 
                connect: { id: teacherId } 
              },
            },
          });
        });

        return Promise.all(upsertPromises);
      }, {
        maxWait: 10000, // chờ tối đa 10s để bắt đầu
        timeout: 20000, // 20 seconds
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
}
