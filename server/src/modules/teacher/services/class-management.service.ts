import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}

    async getClassByTeacherId(
        teacherId: string, 
        status: string,
        page: number,
        limit: number,
        search?: string
    ) {
        try {
            if(status == 'all' || status == '' || !status){
                status = undefined;
            }

            // Log để debug
            console.log('Service - Filter params:', {
                teacherId,
                status,
                search,
                page,
                limit
            });

            // Tính offset cho phân trang
            const offset = (page - 1) * limit;

            // Xây dựng điều kiện where
            const whereCondition: any = {
                teacherId,
                ...(status && { status })
            };

            // Thêm điều kiện search (tìm kiếm theo tên lớp)
            if (search && search.trim() !== '') {
                const searchTerm = search.trim();
                whereCondition.OR = [
                    {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive' // Case insensitive search
                        }
                    }
                    // Note: Nếu có trường classCode thì uncomment dòng dưới
                    // {
                    //     classCode: {
                    //         contains: searchTerm,
                    //         mode: 'insensitive'
                    //     }
                    // }
                ];
            }



            console.log('Service - Final where condition:', JSON.stringify(whereCondition, null, 2));

            // Validate page và limit
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            if (limit > 100) limit = 100; // Giới hạn tối đa

            // Lấy tổng số record để tính tổng số trang
            const totalCount = await this.prisma.class.count({
                where: whereCondition
            });

            console.log('Service - Total count:', totalCount);
            
            // Lấy dữ liệu với phân trang
            const classes = await this.prisma.class.findMany({
                where: whereCondition,
                include: { 
                    room: true,
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true,
                        },
                    } 
                },
                skip: offset,
                take: limit,
                orderBy: [
                    { status: 'asc' }, // Sắp xếp theo status trước
                    { createdAt: 'desc' } // Rồi theo thời gian tạo
                ]
            });

            console.log('Service - Classes found:', classes.length);
            
            // Transform data để trả về format đẹp hơn
            const transformedClasses = classes.map(cls => ({
                ...cls,
                teacherName: cls.teacher?.user?.fullName || 'N/A',
                teacherEmail: cls.teacher?.user?.email || 'N/A',
                studentCount: cls._count.enrollments,
                // Parse recurring schedule nếu có
                schedule: cls.recurringSchedule ? 
                    (typeof cls.recurringSchedule === 'string' ? 
                        JSON.parse(cls.recurringSchedule) : 
                        cls.recurringSchedule) : null
            }));
            
            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const result = {
                data: transformedClasses,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    search: search || '',
                    status: status || ''
                }
            };

            console.log('Service - Final result:', {
                classCount: result.data.length,
                pagination: result.pagination,
                filters: result.filters
            });

            return result;
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
