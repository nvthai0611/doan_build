import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}

    async getClassByTeacherId(teacherId: string, status: string) {
    try {
        if(status == 'all' || status == '' || !status){
        status = undefined;
        }
      const classes = await this.prisma.class.findMany({
        where: { teacherId, status  },
        include: { room: true,
             teacher: true,
              _count: {
            select: {
                enrollments: true,
            },
        } },
      });

      if (!classes.length) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học nào',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return classes;
    } catch (error) {
      // Nếu đã là HttpException thì ném lại
      if (error instanceof HttpException) throw error;

      // Còn lại là lỗi từ Prisma hoặc runtime khác
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
          error: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    }

    async getCountByStatus(teacherId: string){
        try {
            const countByStatus = await this.prisma.class.groupBy({
                by: ['status'],
                where: { teacherId },
                _count: {
                    status: true
                }
            });

            // Khởi tạo object với tất cả trạng thái = 0
            const result = {
                total: 0,
                active: 0,
                completed: 0,
                draft: 0,
                cancelled: 0
            };

            // Tính tổng và phân loại theo status
            countByStatus.forEach(item => {
                const count = item._count.status;
                result.total += count;
                
                // Map status từ database sang key trong result
                if (item.status === 'active') {
                    result.active = count;
                } else if (item.status === 'completed') {
                    result.completed = count;
                } else if (item.status === 'draft') {
                    result.draft = count;
                } else if (item.status === 'cancelled') {
                    result.cancelled = count;
                }
            });

            return result;

        } catch (error) {
            // Nếu đã là HttpException thì ném lại
            if (error instanceof HttpException) throw error;
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy số lượng lớp học theo trạng thái',
                    error: error?.message || error,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
