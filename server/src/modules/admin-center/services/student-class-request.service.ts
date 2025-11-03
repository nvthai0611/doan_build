import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { AlertService } from './alert.service';
import { AlertSeverity } from '../dto/alert.dto';
import { EmailNotificationService } from '../../shared/services/email-notification.service';

@Injectable()
export class StudentClassRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  /**
   * Lấy danh sách tất cả student class requests (cho manager/center owner)
   */
  async getAllRequests(filters?: {
    status?: string;
    classId?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.classId) {
        where.classId = filters.classId;
      }

      if (filters?.studentId) {
        where.studentId = filters.studentId;
      }

      // Get total count
      const total = await this.prisma.studentClassRequest.count({ where });

      // Get requests
      const requests = await this.prisma.studentClassRequest.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
              parent: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });

      const pendingCount = await this.prisma.studentClassRequest.count({
        where: { ...where },
      });

      return {
        success: true,
        data: requests.map((req) => ({
          id: req.id,
          studentId: req.studentId,
          classId: req.classId,
          message: req.message,
          status: req.status,
          createdAt: req.createdAt.toISOString(),
          processedAt: req.processedAt?.toISOString(),
          commitmentImageUrl: req.commitmentImageUrl,
          student: {
            id: req.student.id,
            fullName: req.student.user.fullName,
            email: req.student.user.email,
            phone: req.student.user.phone,
          },
          parent: req.student.parent
            ? {
                id: req.student.parent.id,
                fullName: req.student.parent.user.fullName,
                email: req.student.parent.user.email,
                phone: req.student.parent.user.phone,
              }
            : null,
          class: {
            id: req.class.id,
            name: req.class.name,
            subject: req.class.subject?.name,
            teacher: req.class.teacher
              ? {
                  id: req.class.teacher.id,
                  fullName: req.class.teacher.user.fullName,
                }
              : null,
          },
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          pendingCount: pendingCount,
        },
        message: 'Lấy danh sách yêu cầu thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Approve student class request
   */
  async approveRequest(requestId: string, overrideCapacity = false) {
    try {
      // Get request details
      const request = await this.prisma.studentClassRequest.findUnique({
        where: { id: requestId },

        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  username: true,
                },
              },
              parent: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
              teacher: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  enrollments: {
                    where: {
                      status: { in: ['studying', 'not_been_updated'] },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!request) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy yêu cầu' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (request.status !== 'pending') {
        throw new HttpException(
          {
            success: false,
            message: `Yêu cầu đã được xử lý với trạng thái: ${request.status}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('request', request);
      

      // // Kiểm tra lớp có còn chỗ không (chỉ check nếu không override)
      if (!overrideCapacity) {
        if (
          request.class.maxStudents &&
          request.class._count.enrollments >= request.class.maxStudents
        ) {
          throw new HttpException(
            {
              success: false,
              message: 'Lớp học đã đầy, không thể chấp nhận thêm học sinh',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Kiểm tra học sinh đã enrolled chưa
      const existingEnrollment = await this.prisma.enrollment.findFirst({
        where: {
          studentId: request.studentId,
          classId: request.classId,
          status: { in: ['studying', 'not_been_updated'] },
        },
      });

      if (existingEnrollment) {
        throw new HttpException(
          {
            success: false,
            message: 'Học sinh đã được ghi danh vào lớp này rồi',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Sử dụng transaction để đảm bảo tính nhất quán
      const result = await this.prisma.$transaction(async (tx) => {
        // Cập nhật request status
        const updatedRequest = await tx.studentClassRequest.update({
          where: { id: requestId },
          data: {
            status: 'approved',
            processedAt: new Date(),
          },
        });
        const relatedAlert = await tx.alert.findFirst({
          where: {
            payload: {
              path: ['requestId'],
              equals: requestId,
            },
            processed: false,
          },
        });
        if (relatedAlert) {
          await tx.alert.update({
            where: { id: relatedAlert.id },
            data: { processed: true },
          });
        }

        // Tạo enrollment
        const enrollment = await tx.enrollment.create({
          data: {
            studentId: request.studentId,
            classId: request.classId,
            status: 'studying',
            enrolledAt: new Date(),
          },
        });
        let contractUpload = null;
        if (request.commitmentImageUrl) {
          const fileName =
            request.commitmentImageUrl.split('/').pop() || 'commitment_image';

          contractUpload = await tx.contractUpload.create({
            data: {
              enrollmentId: enrollment.id,
              parentId: request.student.parent?.id || null,
              contractType: 'student_commitment', // Loại hợp đồng: cam kết học tập
              uploadedImageUrl: request.commitmentImageUrl,
              uploadedImageName: fileName,
              uploadedAt: new Date(),
              status: 'active',
            },
          });
        }
        return { updatedRequest, enrollment, contractUpload };
      });


      // Gửi email thông báo chấp nhận
      if (request.student.parent?.user?.email) {
        const parentEmail = request.student.parent.user.email;
        const parentName = request.student.parent.user.fullName;
        
        // Format start date
        const startDate = request.class.expectedStartDate 
          ? new Date(request.class.expectedStartDate).toLocaleDateString('vi-VN') 
          : undefined;
        
        await this.emailNotificationService.sendClassRequestApprovalEmail(
          requestId,
          request.studentId,
          request.classId,
          parentEmail,
          parentName,
          request.student.user.fullName,
          request.class.name,
          request.class.subject?.name || 'N/A',
          request.class.teacher?.user?.fullName,
          startDate,
          request.class.recurringSchedule,
          request.student.user.username,
          '123456' // Mật khẩu mặc định
        );
      }

      return {
        success: true,
        data: {
          request: {
            id: result.updatedRequest.id,
            status: result.updatedRequest.status,
            processedAt: result.updatedRequest.processedAt.toISOString(),
          },
          enrollment: {
            id: result.enrollment.id,
            studentId: result.enrollment.studentId,
            classId: result.enrollment.classId,
            status: result.enrollment.status,
            enrolledAt: result.enrollment.enrolledAt.toISOString(),
          },
          contractUpload: result.contractUpload
            ? {
                id: result.contractUpload.id,
                contractType: result.contractUpload.contractType,
                uploadedImageUrl: result.contractUpload.uploadedImageUrl,
                uploadedAt: result.contractUpload.uploadedAt.toISOString(),
              }
            : null,
        },
        message: 'Đã chấp nhận yêu cầu và ghi danh học sinh vào lớp thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xử lý yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reject student class request
   */
  async rejectRequest(requestId: string, reason?: string) {
    try {
      // Get request details
      const request = await this.prisma.studentClassRequest.findUnique({
        where: { id: requestId },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
              parent: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!request) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy yêu cầu' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (request.status !== 'pending') {
        throw new HttpException(
          {
            success: false,
            message: `Yêu cầu đã được xử lý với trạng thái: ${request.status}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Cập nhật request status
      const updatedRequest = await this.prisma.studentClassRequest.update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          processedAt: new Date(),
          message: reason
            ? `${request.message || ''}\n---\nLý do từ chối: ${reason}`
            : request.message,
        },
      });

      const relatedAlert = await this.prisma.alert.findFirst({
        where: {
          payload: {
            path: ['requestId'],
            equals: requestId,
          },
          processed: false,
        },
      });
      if (relatedAlert) {
        await this.prisma.alert.update({
          where: { id: relatedAlert.id },
          data: { processed: true },
        });
      }


      // Gửi email thông báo từ chối
      if (request.student.parent?.user?.email) {
        const parentEmail = request.student.parent.user.email;
        const parentName = request.student.parent.user.fullName;
        
        await this.emailNotificationService.sendClassRequestRejectionEmail(
          requestId,
          request.studentId,
          request.classId,
          parentEmail,
          parentName,
          request.student.user.fullName,
          request.class.name,
          request.class.subject?.name || 'N/A',
          reason
        );
      }

      return {
        success: true,
        data: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          processedAt: updatedRequest.processedAt.toISOString(),
        },
        message: 'Đã từ chối yêu cầu tham gia lớp',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi từ chối yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết một request
   */
  async getRequestById(requestId: string) {
    try {
      const request = await this.prisma.studentClassRequest.findUnique({
        where: { id: requestId },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  birthDate: true,
                },
              },
              parent: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          class: {
            include: {
              subject: true,
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
              _count: {
                select: {
                  enrollments: {
                    where: {
                      status: { in: ['studying', 'not_been_updated'] },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!request) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy yêu cầu' },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: {
          id: request.id,
          studentId: request.studentId,
          classId: request.classId,
          message: request.message,
          status: request.status,
          createdAt: request.createdAt.toISOString(),
          processedAt: request.processedAt?.toISOString(),
          commitmentImageUrl: request.commitmentImageUrl,
          student: {
            id: request.student.id,
            fullName: request.student.user.fullName,
            email: request.student.user.email,
            phone: request.student.user.phone,
            birthDate: request.student.user.birthDate?.toISOString(),
          },
          parent: request.student.parent
            ? {
                id: request.student.parent.id,
                fullName: request.student.parent.user.fullName,
                email: request.student.parent.user.email,
                phone: request.student.parent.user.phone,
              }
            : null,
          class: {
            id: request.class.id,
            name: request.class.name,
            subject: request.class.subject?.name,
            maxStudents: request.class.maxStudents,
            currentStudents: request.class._count.enrollments,
            teacher: request.class.teacher
              ? {
                  id: request.class.teacher.id,
                  fullName: request.class.teacher.user.fullName,
                  email: request.class.teacher.user.email,
                }
              : null,
          },
        },
        message: 'Lấy thông tin yêu cầu thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin yêu cầu',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
