import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { checkId } from 'src/utils/validate.util';

@Injectable()
export class FinancialService {
    constructor(private readonly prisma: PrismaService){}

    async getAllFeeRecordsForParent (parentId: string, status: string){
        try {
           
            if(!checkId(parentId)){
                throw new HttpException({
                    message: 'ID phụ huynh không hợp lệ',
                }, 
            HttpStatus.BAD_REQUEST)
            }
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
                where: {
                    studentId: { in: studentIds },
                     status: status ? status : undefined 
                    },
                    include:{
                        class: {
                            include:{
                                sessions: {
                                    where: {
                                        status:'completed'
                                    }
                                }
                            }
                        },
                        feeStructure: true,
                        student:{
                            include:{
                                school: true,
                                user:{
                                    select:{
                                        fullName: true,
                                    }
                                },
                                attendances: {
                                    where: {
                                        status: {
                                            not: 'excused'
                                        },
                                        session: {
                                            status: 'completed'
                                        }
                                    },
                                    include: {
                                        session: true
                                    }
                                }
                            }
                        }
                    }
            })

            if(feeRecords.length === 0){
                throw new HttpException({
                    message: 'Không tìm thấy hồ sơ phí nào cho phụ huynh này',
                },
            HttpStatus.NOT_FOUND)
            }

            // Thêm thông tin số buổi học đã tham gia cho mỗi fee record
            const feeRecordsWithAttendanceCount = feeRecords.map(record => ({
                ...record,
                student: {
                    ...record.student,
                    attendedSessionsCount: record.student.attendances.length
                }
            }));

            return feeRecordsWithAttendanceCount;
        } catch (error) {
            if(error instanceof HttpException){
                throw error;
            }
            throw new HttpException({
                message: 'Lỗi khi lấy danh sách nộp học phí',
                error: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getPaymentHistoryForParent(parentId: string) {
        try {
            if (!checkId(parentId)) {
                throw new HttpException(
                    { message: 'ID phụ huynh không hợp lệ' },
                    HttpStatus.BAD_REQUEST
                )
            }

            const payments = await this.prisma.payment.findMany({
                where: { parentId },
                include: {
                    feeRecordPayments: {
                        include: {
                            feeRecord: {
                                include: {
                                    class: {
                                        select: {
                                            name: true,
                                            classCode: true,
                                        }
                                    },
                                    feeStructure: {
                                        select: {
                                            name: true,
                                        }
                                    },
                                    student: {
                                        include: {
                                            user: {
                                                select: { fullName: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { paidAt: 'desc' }
            })

            const formattedPayments = payments.map((payment: any) => ({
                id: payment.id,
                date: payment.paidAt?.toLocaleDateString('vi-VN'),
                amount: Number(payment.amount),
                method: payment.method || 'bank_transfer',
                status: payment.status,
                transactionCode: payment.transactionCode,
                reference: payment.reference,
                notes: payment.notes,
                allocations: (payment.feeRecordPayments || []).map((frp: any) => ({
                    feeRecordPaymentId: frp.id,
                    amount: Number(frp.amount),
                    feeRecordId: frp.feeRecordId,
                    studentId: frp.feeRecord?.studentId,
                    studentName: frp.feeRecord?.student?.user?.fullName,
                    className: frp.feeRecord?.class?.name,
                    classCode: frp.feeRecord?.class?.classCode,
                    feeName: frp.feeRecord?.feeStructure?.name,
                    notes: frp.notes,
                }))
            }))

            return formattedPayments
        } catch (error: any) {
            throw new HttpException(
                {
                    message: 'Lỗi khi lấy lịch sử thanh toán',
                    error: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
