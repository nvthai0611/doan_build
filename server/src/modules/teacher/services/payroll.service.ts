import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

interface GetTeacherPayrollParams {
  teacherId: string;
  month?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface GetPayrollDetailParams {
  payrollId: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface PayrollResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message: string;
}

interface PayrollDetailResponse {
  payroll: any;
  sessions: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  summary: {
    totalSessions: number;
    totalPayout: number;
    regularSessions: number;
    substituteSessions: number;
  };
  message: string;
}

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

async getTeacherPayroll(
  params: GetTeacherPayrollParams,
): Promise<PayrollResponse> {
  try {
    const { teacherId, month, status, page = 1, limit = 10 } = params;
    
    const where: any = {
      teacherId,
      status: { not: 'pending' },
    };

    if (status && status !== 'all') {  
      where.status = status;
    }
    

    // ✅ Nếu có month → lấy 1 bảng lương của tháng đó
    if (month && month.match(/^\d{4}-\d{2}$/)) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum) - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999));

      where.adminPublishedAt = {
        gte: startDate,
        lte: endDate,
      };

      const payroll = await this.prisma.payroll.findFirst({
        where,
        include: {
          payoutDetails: {
            include: {
              session: {
                include: {
                  class: {
                    select: {
                      id: true,
                      name: true,
                      classCode: true,
                    },
                  },
                },
              },
            },
          },
          teacher: {
            select: {
              id: true,
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
        orderBy: [{ adminPublishedAt: 'desc' }, { id: 'desc' }],
      });

      return {
        data: payroll ? [payroll] : [],
        pagination: {
          currentPage: 1,
          totalPages: payroll ? 1 : 0,
          totalItems: payroll ? 1 : 0,
          itemsPerPage: 1,
        },
        message: 'Lấy bảng lương thành công',
      };
    }

    // ✅ Không có month → lấy danh sách tất cả bảng lương (có phân trang)
    const skip = (page - 1) * limit;
    const take = limit;
        
    const [payrolls, totalItems] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({
        where,
        include: {
          payoutDetails: {
            include: {
              session: {
                include: {
                  class: {
                    select: {
                      id: true,
                      name: true,
                      classCode: true,
                    },
                  },
                },
              },
            },
          },
          teacher: {
            select: {
              id: true,
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
        orderBy: [{ adminPublishedAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      this.prisma.payroll.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    if(payrolls.length ===0){
      throw new HttpException('Không có dữ liệu bảng lương', 404);
    }
    return {
      data: payrolls,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      message: 'Lấy danh sách lương thành công',
    };
  } catch (error) {
    console.error('Error getting teacher payroll:', error);
    throw error;
  }
}

  async getPayrollDetail(
    params: GetPayrollDetailParams,
  ): Promise<PayrollDetailResponse> {
    try {
      const {
        payrollId,
        classId,
        startDate,
        endDate,
        page,
        limit,
      } = params;

      // ✅ Lấy thông tin payroll cơ bản
      const payroll = await this.prisma.payroll.findUnique({
        where: { id: BigInt(payrollId) },
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

      if (!payroll) {
        throw new Error('Payroll không tìm thấy');
      }

      // ✅ Xây dựng điều kiện filter cho sessions
      const sessionWhere: any = {
        payrollId: BigInt(payrollId),
      };

      // ✅ Filter theo classId
      if (classId) {
        sessionWhere.session = {
          classId,
        };
      }

      // ✅ Filter theo date range
      if (startDate || endDate) {
        sessionWhere.session = {
          ...sessionWhere.session,
          sessionDate: {},
        };

        if (startDate) {
          sessionWhere.session.sessionDate.gte = new Date(startDate);
        }

        if (endDate) {
          sessionWhere.session.sessionDate.lte = new Date(endDate);
        }
      }

      // ✅ Đếm tổng số sessions
      const totalSessions = await this.prisma.teacherSessionPayout.count({
        where: sessionWhere,
      });

      // ✅ Lấy sessions với phân trang
      const skip = (page - 1) * limit;
      const sessions = await this.prisma.teacherSessionPayout.findMany({
        where: sessionWhere,
        include: {
          session: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  classCode: true,
                },
              },
            },
          },
        },
        orderBy: [{ session: { sessionDate: 'desc' } }],
        skip,
        take: limit,
      });

      // ✅ Tính toán summary - SỬA LẠI: Lấy isSubstitute từ ClassSession
      const allSessions = await this.prisma.teacherSessionPayout.findMany({
        where: sessionWhere,
        select: {
          teacherPayout: true,
          session: {
            select: {
              substituteTeacherId: true, // ✅ Lấy substituteTeacherId từ ClassSession
              teacherId: true, // ✅ Lấy teacherId chính thức
            },
          },
        },
      });

      const summary = {
        totalSessions: allSessions.length,
        totalPayout: allSessions.reduce(
          (sum, s) => sum + Number(s.teacherPayout),
          0,
        ),
        // ✅ Buổi học chính thức: teacherId = giáo viên trong payroll VÀ KHÔNG có substituteTeacherId
        regularSessions: allSessions.filter(
          (s) =>
            s.session.teacherId === payroll.teacherId &&
            !s.session.substituteTeacherId,
        ).length,
        // ✅ Buổi dạy thay: substituteTeacherId = giáo viên trong payroll
        substituteSessions: allSessions.filter(
          (s) => s.session.substituteTeacherId === payroll.teacherId,
        ).length,
      };

      const totalPages = Math.ceil(totalSessions / limit);

      return {
        payroll,
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalSessions,
          itemsPerPage: limit,
        },
        summary,
        message: 'Lấy chi tiết lương thành công',
      };
    } catch (error) {
      console.error('Error getting payroll detail:', error);
      throw error;
    }
  }

  async approvePayroll(teacherId: string, payrollId: string) {
    try {
      const findTeacher = await this.prisma.teacher.findUnique({
        where: {id: teacherId},
        include:{
          user: true
        }
      })
      const checkStatus = await this.prisma.payroll.findUnique({
        where: { teacherId: teacherId, id: BigInt(payrollId) },
      });
      if (!checkStatus) {
        throw new HttpException('Bảng lương không tồn tại', 404);
      }
      if (checkStatus?.status != 'waiting_teacher_approval') {
        throw new HttpException(
          'Chỉ có thể duyệt bảng lương ở trạng thái chờ duyệt',
          400,
        );
      }
      const result = await this.prisma.payroll.update({
        where: { id: BigInt(payrollId) },
        data: { status: 'approved_by_teacher' },
      });
      await this.prisma.alert.create({
        data:{
          alertType: 'payroll_approved',
          title: `Giáo viên ${findTeacher?.user.fullName} đã duyệt bảng lương`,
          message: `Giáo viên ${findTeacher?.user.fullName} đã duyệt bảng lương kỳ từ ${checkStatus?.periodStart.toLocaleDateString('vi-VN')} đến ${  checkStatus?.periodEnd.toLocaleDateString('vi-VN')}.`,
          isRead: false,
          processed: false,
        }}
      )

      return result;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw error;
    }
  }
  async rejectPayroll(teacherId: string, payrollId: string, rejectionReason: string) {
    try {
      const findTeacher = await this.prisma.teacher.findUnique({
        where: {id: teacherId},
        include:{
          user: true
        }
      })
      // Kiểm tra payroll có tồn tại và thuộc về giáo viên này không
      const checkStatus = await this.prisma.payroll.findUnique({
        where: { 
          teacherId: teacherId, 
          id: BigInt(payrollId) 
        },
      });
      
      if (!checkStatus) {
        throw new HttpException('Bảng lương không tồn tại', 404);
      }
      
      // Chỉ cho phép từ chối khi đang ở trạng thái chờ duyệt
      if (checkStatus.status !== 'waiting_teacher_approval') {
        throw new HttpException(
          'Chỉ có thể từ chối bảng lương ở trạng thái chờ duyệt',
          400,
        );
      }

      // Kiểm tra lý do từ chối
      if (!rejectionReason || rejectionReason.trim().length < 10) {
        throw new HttpException(
          'Lý do từ chối phải có ít nhất 10 ký tự',
          400,
        );
      }

      // Cập nhật trạng thái payroll
      const result = await this.prisma.payroll.update({
        where: { id: BigInt(payrollId) },
        data: { 
          status: 'rejected_by_teacher',
          teacherRejectionReason: rejectionReason.trim(),
          teacherActionAt: new Date()
        },
      });

      await this.prisma.alert.create({
        data:{
          alertType: 'payroll_rejected',
          processed: false,
          message: `Giáo viên ${findTeacher?.user.fullName} đã khiếu nại bảng lương kỳ từ ${checkStatus?.periodStart.toLocaleDateString('vi-VN')} đến ${  checkStatus?.periodEnd.toLocaleDateString('vi-VN')}. Lý do: ${rejectionReason.trim()}`,
          isRead: false,
          title: `Giáo viên ${findTeacher?.user.fullName} đã khiếu nại bảng lương`,
        }
      })

      return {
        data: result,
        message: 'Đã từ chối bảng lương thành công'
      };
    } catch (error) {
      console.error('Error rejecting payroll:', error);
      throw error;
    }
  }
}
