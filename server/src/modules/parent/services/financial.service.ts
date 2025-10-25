import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class FinancialService {
    constructor(private readonly prisma: PrismaService){}

    async getAllFeeRecordsForParent (parentId: string, status){
        try {
            const getStudents = await this.prisma.student.findMany({
                where: {parentId: parentId},
            })
            if(getStudents.length === 0){
                throw new HttpException({
                    message: 'Không tìm thấy học sinh nào cho phụ huynh này',
                },
            HttpStatus.NOT_FOUND)
            }
            const studentIds = getStudents.map(student => student.id);
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: {studentId: { in: studentIds }, status: status ? status : undefined },
            })

            if(feeRecords.length === 0){
                throw new HttpException({
                    message: 'Không tìm thấy hồ sơ phí nào cho phụ huynh này',
                },
            HttpStatus.NOT_FOUND)
            }
            return feeRecords;
        } catch (error) {
            throw new HttpException({
                message: 'Lỗi khi lấy danh sách nộp học phí',
                error: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
