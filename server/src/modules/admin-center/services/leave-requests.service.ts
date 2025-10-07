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
    console.log(where);
    
    const total = await this.prisma.leaveRequest.count({ where });
    console.log("total", total);
    
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
        teacherId: item.teacherId
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

  async approveLeaveRequest(leaveRequestId: string, action: 'approve' | 'reject', approverId: string, notes?: string) {
    const existingRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });

    if (!existingRequest) {
      throw new NotFoundException('Đơn xin nghỉ không tồn tại');
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestException('Đơn này đã được xử lý');
    }

    const updatedRequest = await this.prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: approverId,
        approvedAt: new Date(),
        notes: notes || existingRequest.notes
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
        },
        approvedByUser: {
          select: {
            fullName: true,
            email: true
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
        approvedBy: updatedRequest.approvedByUser?.fullName || null,
        approvedDate: updatedRequest.approvedAt ? updatedRequest.approvedAt.toISOString().split('T')[0] : null,
        notes: updatedRequest.notes,
        teacherId: updatedRequest.teacherId
      },
      message: action === 'approve' ? 'Duyệt đơn xin nghỉ thành công' : 'Từ chối đơn xin nghỉ thành công'
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
}