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

    async getPaymentForParentByStatus(parentId: string, status: string) {
        try {
            if (!checkId(parentId)) {
                throw new HttpException(
                    { message: 'ID phụ huynh không hợp lệ' },
                    HttpStatus.BAD_REQUEST
                )
            }

            const payments = await this.prisma.payment.findMany({
                where: { parentId, status: status ? status : undefined },
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


    async getPaymentDetails(paymentId: string, parentId: string) {
        try {
            if (!checkId(paymentId) || !checkId(parentId)) {
                throw new HttpException(
                    { message: 'ID không hợp lệ' },
                    HttpStatus.BAD_REQUEST
                )
            }
            const payment = await this.prisma.payment.findFirst({
                where: { id: paymentId, parentId },
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
                                    student:{
                                        include: {
                                            user:{
                                                select:{ fullName: true }
                                            }
                                        }
                                    }

                                }
                            },
                        }
                    }
                }
            })
            if (!payment) {
                throw new HttpException(
                    { message: 'Không tìm thấy payment' },
                    HttpStatus.NOT_FOUND
                )
            }
            return payment
        }
        catch (error) {

        }
    }

    async createPaymentForFeeRecords(parentId: string, feeRecordIds: string[]) {
        try {
            if (!checkId(parentId)) {
                throw new HttpException({ message: 'ID phụ huynh không hợp lệ' }, HttpStatus.BAD_REQUEST);
            }
            if (!feeRecordIds || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
                throw new HttpException({ message: 'Vui lòng chọn ít nhất một hóa đơn' }, HttpStatus.BAD_REQUEST);
            }

            // Lấy các FeeRecord hợp lệ
            const feeRecords = await this.prisma.feeRecord.findMany({
                where: {
                    id: { in: feeRecordIds },
                    status: 'pending',
                    student: { parentId }
                },
                include: { student: true }
            });

            if (feeRecords.length !== feeRecordIds.length) {
                throw new HttpException({ message: 'Một số hóa đơn không hợp lệ' }, HttpStatus.BAD_REQUEST);
            }

            // Tính tổng tiền
            const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
            
            const orderCode = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}` // Ví dụ sinh mã đơn hàng duy nhất
            const expirationDate = new Date(feeRecords[0].dueDate);
            // Tạo Payment (status: pending)
            const payment = await this.prisma.payment.create({
      data: {
        parentId,
        amount: totalAmount,
        status: 'pending',
        transactionCode: orderCode,
        createdAt: new Date(),
        exprirationDate: expirationDate,
        method: 'bank_transfer',
        feeRecordPayments: {
          create: feeRecords.map(fr => ({
            feeRecordId: fr.id
          }))
        }
      },
      include: { feeRecordPayments: true }
    })
    //Tạo payment xong thì set status của fee record thành 'processing'
    for (const fr of feeRecords) {
      await this.prisma.feeRecord.update({
        where: { id: fr.id },
        data: { status: 'processing' }
      });
    }

            return { data: payment, message: 'Tạo payment thành công' };
        } catch (error) {
            throw new HttpException(
                { message: 'Lỗi khi tạo payment', error: error.message },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updatePaymentFeeRecords(paymentId: string, feeRecordIds: string[], parentId: string) {
  try {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { feeRecordPayments: true }
    });
    if (!payment || payment.status !== 'pending') {
      throw new HttpException({ message: 'Không thể cập nhật payment này' }, HttpStatus.BAD_REQUEST);
    }
    // Kiểm tra feeRecordIds mới hợp lệ
    if (!feeRecordIds || feeRecordIds.length === 0) {
      throw new HttpException({ message: 'Phải có ít nhất 1 hóa đơn' }, HttpStatus.BAD_REQUEST);
    }
    // Xóa các FeeRecordPayment không còn trong feeRecordIds
    await this.prisma.feeRecordPayment.deleteMany({
      where: {
        paymentId,
        feeRecordId: { notIn: feeRecordIds }
      }
    });
    // Thêm FeeRecordPayment mới nếu có FeeRecord mới
    const existingIds = payment.feeRecordPayments.map(frp => frp.feeRecordId);
    const toAdd = feeRecordIds.filter(id => !existingIds.includes(id));
    for (const frId of toAdd) {
      await this.prisma.feeRecordPayment.create({
        data: { paymentId, feeRecordId: frId }
      });
    }
    // Cập nhật lại tổng tiền
    const feeRecords = await this.prisma.feeRecord.findMany({
      where: { id: { in: feeRecordIds } }
    });
    const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { amount: totalAmount }
    });
    return { data: true, message: 'Cập nhật payment thành công' };
  } catch (error) {
    throw new HttpException(
      { message: 'Lỗi khi cập nhật payment', error: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
}
