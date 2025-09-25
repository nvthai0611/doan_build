import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class ClassManagementService {
    constructor(private prisma: PrismaService) {}

    async getClassByTeacherId(teacherId: string) {
        // Logic to get classes by teacher ID
        try {
            if (!checkId(teacherId)) {
                        throw new HttpException(
                            {
                                success: false,
                                message: 'ID giáo viên không hợp lệ'
                            },
                            HttpStatus.BAD_REQUEST
                        );
                    }
        const classes = await this.prisma.class.findMany({
            where: { teacherId },
            include:{
                room: true,             
            }
        })
        if (!classes || classes.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học nào'
                    },
                    HttpStatus.NOT_FOUND
                );
            }
        return classes;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
    }
    }
}
