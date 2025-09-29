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

            // Validate page và limit
            if (page < 1) page = 1;
            if (limit < 1) limit = 10;
            if (limit > 100) limit = 100; // Giới hạn tối đa

            // Lấy tổng số record để tính tổng số trang
            const totalCount = await this.prisma.class.count({
                where: whereCondition
            });

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

            if (!classes.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học',
                    HttpStatus.NOT_FOUND
                );
            }

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
            
            if (!countByStatus.length) {
                throw new HttpException(
                    'Không tìm thấy lớp học nào cho giáo viên này',
                    HttpStatus.NOT_FOUND
                );
            }
            
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
            
            // Còn lại là lỗi từ Prisma hoặc runtime khác
            throw new HttpException(
                'Có lỗi xảy ra khi lấy số lượng lớp học theo trạng thái',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );           
        }
    }

    async getClassDetail(teacherId: string, classId: string){
        try {
            if(!checkId(teacherId) || !checkId(classId)){
                throw new HttpException(
                    'ID không hợp lệ',
                    HttpStatus.BAD_REQUEST
                );
            }
            
            const result = await this.prisma.class.findFirst({
                where:{teacherId, id: classId},
                include:{
                    room: true,
                    subject: true,
                    teacher: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    email: true,
                            }   
                        }
                    }
                }
            }})

            if(!result){
                throw new HttpException(
                    'Lớp học không tồn tại hoặc bạn không có quyền truy cập',
                    HttpStatus.NOT_FOUND
                );
            }
            
            return result;
        } catch (error) {
            if(error instanceof HttpException) throw error;

            throw new HttpException(
                'Có lỗi xảy ra khi lấy chi tiết lớp học',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
