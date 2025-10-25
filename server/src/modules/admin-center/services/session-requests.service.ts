import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class SessionRequestsService {
  constructor(private prisma: PrismaService) {}

  async getSessionRequests(params: any) {
    const {
      teacherId,
      classId,
      status = 'all',
      requestType,
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
    if (classId) {
      where.classId = classId;
    }
    if (status !== 'all') {
      where.status = status;
    }
    if (requestType) {
      where.requestType = requestType;
    }
    if (search) {
      where.OR = [
        { requestType: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (fromDate || toDate) {
      where.sessionDate = {};
      if (fromDate) {
        where.sessionDate.gte = new Date(fromDate);
      }
      if (toDate) {
        where.sessionDate.lte = new Date(toDate);
      }
    } 
    
    const total = await this.prisma.sessionRequest.count({ where });
    
    const skip = (pageNum - 1) * limitNum;
    const data = await this.prisma.sessionRequest.findMany({
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
        class: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        },
        room: {
          select: {
            name: true,
            capacity: true
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
        requestType: item.requestType,
        teacherId: item.teacherId,
        classId: item.classId,
        sessionDate: item.sessionDate.toISOString().split('T')[0],
        startTime: item.startTime,
        endTime: item.endTime,
        roomId: item.roomId,
        reason: item.reason,
        notes: item.notes,
        status: item.status,
        createdAt: item.createdAt.toISOString().split('T')[0],
        approvedAt: item.approvedAt ? item.approvedAt.toISOString().split('T')[0] : null,
        teacher: item.teacher,
        class: item.class,
        room: item.room,
        approvedByUser: item.approvedByUser
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      },
      message: 'Lấy danh sách yêu cầu tạo buổi học thành công'
    };
  }

  async createSessionRequest(sessionRequestData: {
    teacherId: string;
    classId: string;
    requestType: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    roomId?: string;
    reason: string;
    notes?: string;
  }) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: sessionRequestData.teacherId }
    });

    if (!teacher) {
      throw new NotFoundException('Giáo viên không tồn tại');
    }

    // Validate class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: sessionRequestData.classId }
    });

    if (!classExists) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    // Validate room if provided
    if (sessionRequestData.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: sessionRequestData.roomId }
      });

      if (!room) {
        throw new NotFoundException('Phòng học không tồn tại');
      }
    }

    // Validate session date is in the future
    const sessionDate = new Date(sessionRequestData.sessionDate);
    if (sessionDate <= new Date()) {
      throw new BadRequestException('Ngày buổi học phải trong tương lai');
    }

    const sessionRequest = await this.prisma.sessionRequest.create({
      data: {
        teacherId: sessionRequestData.teacherId,
        classId: sessionRequestData.classId,
        requestType: sessionRequestData.requestType,
        sessionDate,
        startTime: sessionRequestData.startTime,
        endTime: sessionRequestData.endTime,
        roomId: sessionRequestData.roomId,
        reason: sessionRequestData.reason,
        notes: sessionRequestData.notes,
        status: 'pending',
        createdBy: sessionRequestData.teacherId
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
        class: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        },
        room: {
          select: {
            name: true,
            capacity: true
          }
        }
      }
    });

    return {
      data: {
        id: sessionRequest.id,
        requestType: sessionRequest.requestType,
        teacherId: sessionRequest.teacherId,
        classId: sessionRequest.classId,
        sessionDate: sessionRequest.sessionDate.toISOString().split('T')[0],
        startTime: sessionRequest.startTime,
        endTime: sessionRequest.endTime,
        roomId: sessionRequest.roomId,
        reason: sessionRequest.reason,
        notes: sessionRequest.notes,
        status: sessionRequest.status,
        createdAt: sessionRequest.createdAt.toISOString().split('T')[0],
        teacher: sessionRequest.teacher,
        class: sessionRequest.class,
        room: sessionRequest.room
      },
      message: 'Tạo yêu cầu tạo buổi học thành công'
    };
  }

  async approveSessionRequest(sessionRequestId: string, action: 'approve' | 'reject', approverId: string, notes?: string) {
    const existingRequest = await this.prisma.sessionRequest.findUnique({
      where: { id: sessionRequestId },
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
        class: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        },
        room: {
          select: {
            name: true,
            capacity: true
          }
        }
      }
    });

    if (!existingRequest) {
      throw new NotFoundException('Yêu cầu tạo buổi học không tồn tại');
    }

    if (existingRequest.status !== 'pending') {
      throw new BadRequestException('Yêu cầu này đã được xử lý');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Update session request status
      const updatedRequest = await tx.sessionRequest.update({
        where: { id: sessionRequestId },
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
          class: {
            include: {
              subject: {
                select: {
                  name: true
                }
              }
            }
          },
          room: {
            select: {
              name: true,
              capacity: true
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

      // If approved, create the class session
      if (action === 'approve') {
        await tx.classSession.create({
          data: {
            classId: existingRequest.classId,
            teacherId: existingRequest.teacherId,
            academicYear: new Date().getFullYear().toString(),
            sessionDate: existingRequest.sessionDate,
            startTime: existingRequest.startTime,
            endTime: existingRequest.endTime,
            roomId: existingRequest.roomId,
            status: 'scheduled',
            notes: `Tạo từ yêu cầu: ${existingRequest.reason}`
          }
        });
      }

      return updatedRequest;
    });

    return {
      data: {
        id: result.id,
        requestType: result.requestType,
        teacherId: result.teacherId,
        classId: result.classId,
        sessionDate: result.sessionDate.toISOString().split('T')[0],
        startTime: result.startTime,
        endTime: result.endTime,
        roomId: result.roomId,
        reason: result.reason,
        notes: result.notes,
        status: result.status,
        createdAt: result.createdAt.toISOString().split('T')[0],
        approvedAt: result.approvedAt ? result.approvedAt.toISOString().split('T')[0] : null,
        teacher: result.teacher,
        class: result.class,
        room: result.room,
        approvedByUser: result.approvedByUser
      },
      message: action === 'approve' ? 'Duyệt yêu cầu tạo buổi học thành công' : 'Từ chối yêu cầu tạo buổi học thành công'
    };
  }

  async getSessionRequestById(id: string) {
    const sessionRequest = await this.prisma.sessionRequest.findUnique({
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
        class: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        },
        room: {
          select: {
            name: true,
            capacity: true
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
    
    if (!sessionRequest) {
      throw new NotFoundException('Yêu cầu tạo buổi học không tồn tại');
    }

    return {
      data: {
        id: sessionRequest.id,
        requestType: sessionRequest.requestType,
        teacherId: sessionRequest.teacherId,
        classId: sessionRequest.classId,
        sessionDate: sessionRequest.sessionDate,
        startTime: sessionRequest.startTime,
        endTime: sessionRequest.endTime,
        roomId: sessionRequest.roomId,
        reason: sessionRequest.reason,
        notes: sessionRequest.notes,
        status: sessionRequest.status,
        createdAt: sessionRequest.createdAt,
        approvedAt: sessionRequest.approvedAt,
        teacher: sessionRequest.teacher,
        class: sessionRequest.class,
        room: sessionRequest.room,
        approvedByUser: sessionRequest.approvedByUser
      },
      message: 'Lấy chi tiết yêu cầu tạo buổi học thành công'
    };
  }
}