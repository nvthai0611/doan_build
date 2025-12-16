import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}


  async getLeaveRequests(params: any) {
    const {
      teacherId,
      status = 'all',
      search = '',
      fromDate,
      toDate,
      page = 1,
      limit = 10
    } = params;
    
    // Convert string to number for pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const where: any = {};
    if (teacherId) {
      where.teacherId = teacherId;
    }
    if (status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { requestType: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (fromDate || toDate) {
      where.startDate = {};
      if (fromDate) {
        where.startDate.gte = new Date(fromDate);
      }
      if (toDate) {
        where.startDate.lte = new Date(toDate);
      }
    } 

    where.AND = [
      { requestType: { not: 'student_leave' } }
    ];
    
    const total = await this.prisma.leaveRequest.count({ where });
    
    const skip = (pageNum - 1) * limitNum;
    const data = await this.prisma.leaveRequest.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        approvedByUser: {
          select: {
            fullName: true,
            email: true
          }
        },
        affectedSessions: {
          include: {
            session: {
              
            }
          }
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(item => ({
        id: item.id,
        type: item.requestType,
        reason: item.reason,
        startDate: item.startDate.toISOString().split('T')[0],
        endDate: item.endDate.toISOString().split('T')[0],
        status: item.status,
        submittedDate: item.createdAt.toISOString().split('T')[0],
        approvedBy: item.approvedByUser?.fullName || null,
        approvedDate: item.approvedAt ? item.approvedAt.toISOString().split('T')[0] : null,
        notes: item.notes || null,
        teacherId: item.teacherId,
        teacherInfo: item.teacher?.user,
        affectedSessions: item.affectedSessions,
        createdAt: item.createdAt.toISOString().split('T')[0]
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      message: 'Lấy danh sách đơn xin nghỉ thành công'
    };
  }

  async createLeaveRequest(leaveRequestData: {
    teacherId: string;
    requestType: string;
    reason: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: leaveRequestData.teacherId }
    });

    if (!teacher) {
      throw new NotFoundException('Giáo viên không tồn tại');
    }

    // Validate dates
    const startDate = new Date(leaveRequestData.startDate);
    const endDate = new Date(leaveRequestData.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        teacherId: leaveRequestData.teacherId,
        requestType: leaveRequestData.requestType,
        reason: leaveRequestData.reason,
        startDate,
        endDate,
        status: 'pending',
        notes: leaveRequestData.notes,
        createdBy: leaveRequestData.teacherId
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return {
      data: {
        id: leaveRequest.id,
        type: leaveRequest.requestType,
        reason: leaveRequest.reason,
        startDate: leaveRequest.startDate.toISOString().split('T')[0],
        endDate: leaveRequest.endDate.toISOString().split('T')[0],
        status: leaveRequest.status,
        submittedDate: leaveRequest.createdAt.toISOString().split('T')[0],
        approvedBy: null,
        approvedDate: null,
        notes: leaveRequest.notes,
        teacherId: leaveRequest.teacherId
      },
      message: 'Tạo đơn xin nghỉ thành công'
    };
  }

  async updateLeaveRequest(leaveRequestId: string, updateData: {
    requestType?: string;
    reason?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) {
    const existingRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });

    if (!existingRequest) {
      throw new NotFoundException('Đơn xin nghỉ không tồn tại');
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể chỉnh sửa đơn đang chờ duyệt');
    }

    // Validate dates if they are being updated
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : existingRequest.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : existingRequest.endDate;
      
      if (endDate <= startDate) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: updateData,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return {
      data: {
        id: updatedRequest.id,
        type: updatedRequest.requestType,
        reason: updatedRequest.reason,
        startDate: updatedRequest.startDate.toISOString().split('T')[0],
        endDate: updatedRequest.endDate.toISOString().split('T')[0],
        status: updatedRequest.status,
        submittedDate: updatedRequest.createdAt.toISOString().split('T')[0],
        approvedBy: null,
        approvedDate: null,
        notes: updatedRequest.notes,
        teacherId: updatedRequest.teacherId
      },
      message: 'Cập nhật đơn xin nghỉ thành công'
    };
  }

  async deleteLeaveRequest(leaveRequestId: string) {
    const existingRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });

    if (!existingRequest) {
      throw new NotFoundException('Đơn xin nghỉ không tồn tại');
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể xóa đơn đang chờ duyệt');
    }

    await this.prisma.leaveRequest.delete({
      where: { id: leaveRequestId }
    });

    return {
      message: 'Xóa đơn xin nghỉ thành công'
    };
  }

  async approveLeaveRequest(
    leaveRequestId: string,
    action: 'approve' | 'reject',
    approverId: string,
    notes?: string,
    replacements?: { sessionId: string; replacementTeacherId?: string }[],
  ) {
    const existingRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        affectedSessions: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!existingRequest) {
      throw new NotFoundException('Đơn xin nghỉ không tồn tại');
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestException('Đơn này đã được xử lý');
    }

    // Map thông tin buổi học để dùng khi validate
    const sessionInfoMap = new Map<
      string,
      { date: Date; startTime: string; endTime: string }
    >();
    existingRequest.affectedSessions.forEach((as) => {
      if (as.sessionId && as.session) {
        sessionInfoMap.set(as.sessionId, {
          date: as.session.sessionDate,
          startTime: as.session.startTime,
          endTime: as.session.endTime,
        });
      }
    });

    // Map lựa chọn giáo viên thay thế theo sessionId
    const replacementsMap = new Map<string, string>();
    if (Array.isArray(replacements)) {
      for (const item of replacements) {
        if (item?.sessionId && item.replacementTeacherId) {
          replacementsMap.set(item.sessionId, item.replacementTeacherId);
        }
      }
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Update leave request status
      const updatedRequest = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          approvedBy: approverId,
          approvedAt: new Date(),
          notes: notes || existingRequest.notes,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          approvedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      // Nếu approve: hủy các buổi không có GV thay thế, gán substitute cho các buổi có replacementTeacherId
      if (action === 'approve' && existingRequest.affectedSessions.length > 0) {
        const allSessionIds = existingRequest.affectedSessions.map(
          (affected) => affected.sessionId,
        );

        const sessionsWithReplacement = new Set<string>();
        for (const sid of replacementsMap.keys()) {
          sessionsWithReplacement.add(sid);
        }

        // 1. Hủy buổi KHÔNG có giáo viên thay thế
        const sessionsToCancel = allSessionIds.filter(
          (sid) => sid && !sessionsWithReplacement.has(sid),
        );

        if (sessionsToCancel.length > 0) {
          await tx.classSession.updateMany({
            where: {
              id: { in: sessionsToCancel },
            },
            data: {
              status: 'cancelled',
            },
          });
        }

        // 2. Gán giáo viên dạy thay cho từng buổi có replacementTeacherId
        for (const [sessionId, replacementTeacherId] of replacementsMap) {
          if (!sessionId || !replacementTeacherId) continue;

          // Đảm bảo giáo viên tồn tại
          const teacher = await tx.teacher.findUnique({
            where: { id: replacementTeacherId },
          });

          if (!teacher) {
            throw new BadRequestException(
              `Giáo viên thay thế không tồn tại (sessionId: ${sessionId})`,
            );
          }

          const sessionInfo = sessionInfoMap.get(sessionId);

          // Nếu thiếu thông tin buổi học thì bỏ qua validate thời gian
          if (sessionInfo) {
            const { date, startTime, endTime } = sessionInfo;

            // Kiểm tra xung đột lịch cho giáo viên thay thế trong cùng ngày & khung giờ
            const conflict = await tx.classSession.findFirst({
              where: {
                sessionDate: date,
                teacherId: replacementTeacherId,
                id: {
                  not: sessionId,
                },
                OR: [
                  {
                    AND: [
                      { startTime: { lte: startTime } },
                      { endTime: { gt: startTime } },
                    ],
                  },
                  {
                    AND: [
                      { startTime: { lt: endTime } },
                      { endTime: { gte: endTime } },
                    ],
                  },
                ],
              },
            });

            if (conflict) {
              throw new BadRequestException(
                'Giáo viên thay thế đang có lịch dạy trùng thời gian với buổi học được gán.',
              );
            }
          }

          await tx.classSession.update({
            where: { id: sessionId },
            data: {
              substituteTeacherId: replacementTeacherId,
              substituteEndDate: sessionInfo?.date ?? undefined,
            },
          });
        }
      }

      return updatedRequest;
    });

    return {
      data: {
        id: result.id,
        type: result.requestType,
        reason: result.reason,
        startDate: result.startDate.toISOString().split('T')[0],
        endDate: result.endDate.toISOString().split('T')[0],
        status: result.status,
        submittedDate: result.createdAt.toISOString().split('T')[0],
        approvedBy: result.approvedByUser?.fullName || null,
        approvedDate: result.approvedAt
          ? result.approvedAt.toISOString().split('T')[0]
          : null,
        notes: result.notes,
        teacherId: result.teacherId,
      },
      message:
        action === 'approve'
          ? 'Duyệt đơn xin nghỉ thành công. Các buổi không có giáo viên thay thế sẽ được hủy, các buổi có giáo viên thay thế sẽ giữ lịch với giáo viên dạy thay.'
          : 'Từ chối đơn xin nghỉ thành công',
    };
  }

  async getLeaveRequestStats(teacherId: string) {
    const requests = await this.prisma.leaveRequest.findMany({
      where: { teacherId },
      select: {
        startDate: true,
        endDate: true,
        status: true
      }
    });

    const totalRequests = requests.length;
    
    const pendingRequests = requests.filter(req => req.status === 'pending').length;
    const approvedRequests = requests.filter(req => req.status === 'approved').length;
    const rejectedRequests = requests.filter(req => req.status === 'rejected').length;

    return {
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      },
      message: 'Lấy thống kê đơn xin nghỉ thành công'
    };
  }


  async getLeaveRequestById(id: string) {
    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        approvedByUser: {
          select: {
            fullName: true,
            email: true
          }
        },
        affectedSessions: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    subject: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
            }
          }
        }
      }
      }
    });
    
    return {
      data: {
        id: leaveRequest.id,
        type: leaveRequest.requestType,
        reason: leaveRequest.reason,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        status: leaveRequest.status,
        submittedDate: leaveRequest.createdAt,
        approvedBy: leaveRequest.approvedByUser?.fullName || null,
        approvedDate: leaveRequest.approvedAt ? leaveRequest.approvedAt : null,
        notes: leaveRequest.notes,
        teacherId: leaveRequest.teacherId,
        createdAt: leaveRequest.createdAt,
        teacherInfo: leaveRequest.teacher?.user,
        affectedSessions: leaveRequest.affectedSessions?.map((session) => ({
          id: session.id,
          sessionId: session.sessionId,
          sessionDate: session.session.sessionDate,
          startTime: session.session.startTime,
          endTime: session.session.endTime,
          class: session.session.class.name,
          subject: session.session.class.subject.name,
        }))
      },
      message: 'Lấy chi tiết đơn xin nghỉ thành công'
    };
  }
}