import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/db/prisma.service';
import { FeeRecordPaymentInfo } from '../dto/create-payment-qr.dto';
import { paymentSuccessEmailTemplate } from 'src/modules/shared/template-email/template-notification';
import emailUtil from 'src/utils/email.util';

export interface SepayTransaction {
  id: string;
  gateway: string;
  transaction_date: string;
  account_number: string;
  sub_account: string;
  amount_in: number;
  amount_out: number;
  accumulated: number;
  code: string;
  transaction_content: string;
  reference_number: string;
  body: string;
  bank_brand_name: string;
  bank_account_id: string;
}

export interface CreatePaymentQRDto {
  feeRecordId: string;
  amount: number;
  parentId?: string;
}

/**
 * Interface cho webhook data từ Sepay (theo format thực tế)
 */
export interface SepayWebhookDto {
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string;
  code: string | null;
  content: string;
  transferType: string;
  description: string;
  transferAmount: number;
  referenceCode: string;
  accumulated: number;
  id: number;
}

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);
  private readonly baseURL = 'https://my.sepay.vn/userapi';
  private readonly apiKey: string;
  private readonly accountNumber: string;
  private readonly bankCode: string;
  private readonly bankAccountName: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('SEPAY_API_KEY');
    this.accountNumber =
      this.configService.get<string>('SEPAY_ACCOUNT_VA') || '9624716YAW';
    this.bankCode = this.configService.get<string>('SEPAY_BANK_NAME') || 'BIDV';
    this.bankAccountName =
      this.configService.get<string>('SEPAY_BANK_ACCOUNT_NAME') ||
      'TRUNG TAM GIAO DUC';
  }

  /**
   * Tạo mã QR thanh toán cho hóa đơn
   * KHÔNG lưu vào Payment, chỉ trả về thông tin QR
   */

  /**
   * Tạo mã QR thanh toán cho nhiều hóa đơn (nhiều học sinh)
   * KHÔNG lưu vào Payment, chỉ trả về thông tin QR
   */
  async createPaymentQR(dto: any) {
    try {
      // 1. Kiểm tra ít nhất có 1 feeRecord
      if (!dto.feeRecordIds || dto.feeRecordIds.length === 0) {
        throw new BadRequestException(
          'Vui lòng chọn ít nhất một hóa đơn để thanh toán',
        );
      }

      // 2. Lấy tất cả FeeRecord
      const feeRecords = await this.prisma.feeRecord.findMany({
        where: {
          id: {
            in: dto.feeRecordIds,
          },
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      if (feeRecords.length === 0) {
        throw new BadRequestException('Không tìm thấy hóa đơn học phí');
      }

      if (feeRecords.length !== dto.feeRecordIds.length) {
        throw new BadRequestException('Một số hóa đơn không tồn tại');
      }

      // 3. Tính tổng số tiền và chuẩn bị thông tin
      let totalAmount = 0;
      const paymentInfos: FeeRecordPaymentInfo[] = [];
      const studentCodes: string[] = [];

      for (const feeRecord of feeRecords) {
        const remainingAmount =
          Number(feeRecord.totalAmount) - Number(feeRecord.paidAmount);

        if (remainingAmount <= 0) {
          throw new BadRequestException(
            `Hóa đơn của học sinh ${feeRecord.student.user.fullName} đã được thanh toán đủ`,
          );
        }

        totalAmount += remainingAmount;
        studentCodes.push(feeRecord.student.studentCode);

        paymentInfos.push({
          feeRecordId: feeRecord.id,
          studentId: feeRecord.studentId,
          studentCode: feeRecord.student.studentCode,
          studentName: feeRecord.student.user.fullName,
          amount: remainingAmount,
          remainingAmount: remainingAmount,
        });
      }

      // 4. Tạo mã giao dịch duy nhất
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      let orderCode = `HP${timestamp}${random}`;

      // Kiểm tra code có tồn tại chưa
      let existingPayment = await this.prisma.payment.findFirst({
        where: { transactionCode: orderCode },
      });

      while (existingPayment) {
        orderCode = `HP${Date.now()}${Math.floor(Math.random() * 1000)}`;
        existingPayment = await this.prisma.payment.findFirst({
          where: { transactionCode: orderCode },
        });
      }

      // 5. Tạo nội dung chuyển khoản
      // Format: HP{timestamp}{random} STU001,STU002,STU003
      const studentsCodeStr = studentCodes.join(',');
      const content = `${orderCode} ${studentsCodeStr}`;

      // 6. Tạo QR Code URL theo chuẩn VietQR
      const qrCodeUrl = this.generateVietQRContent({
        accountNumber: this.accountNumber,
        bankCode: this.bankCode,
        amount: totalAmount,
        content: content,
        bankAccountName: this.bankAccountName,
      });

      // 7. Trả về thông tin QR
      return {
        data: {
          orderCode,
          qrCodeUrl,
          totalAmount,
          content,
          accountNumber: this.accountNumber,
          bankCode: this.bankCode,
          bankName: this.getBankName(this.bankCode),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          paymentInfos, // Thông tin chi tiết từng học sinh
          summary: {
            totalStudents: feeRecords.length,
            studentNames: paymentInfos.map((p) => p.studentName).join(', '),
            studentCodes: studentsCodeStr,
          },
        },
        message: 'Tạo mã QR thanh toán thành công',
      };
    } catch (error) {
      this.logger.error('Failed to create payment QR', error);
      throw error;
    }
  }

  /**
   * Lấy tên ngân hàng từ mã
   */
  private getBankName(bankCode: string): string {
    const bankNames = {
      MB: 'MB Bank',
      VCB: 'Vietcombank',
      TCB: 'Techcombank',
      ACB: 'ACB',
      VPB: 'VPBank',
      TPB: 'TPBank',
      STB: 'Sacombank',
      BIDV: 'BIDV',
    };
    return bankNames[bankCode] || bankCode;
  }

  /**
   * Lấy danh sách giao dịch từ Sepay
   */
  async getTransactions(limit = 50): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseURL}/transactions/list`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          params: {
            limit,
            account_number: this.accountNumber,
          },
        }),
      );

      return response.data.transactions || [];
    } catch (error) {
      this.logger.error('Failed to get Sepay transactions', error);
      throw error;
    }
  }

  /**
   * Xử lý webhook từ Sepay khi có giao dịch mới
   * Hỗ trợ thanh toán nhiều học sinh
   */
  async handleWebhook(webhookData: SepayWebhookDto) {
    try {
      this.logger.log(`Received Sepay webhook: ${JSON.stringify(webhookData)}`);

      // 1. Kiểm tra giao dịch là tiền vào
      if (!webhookData.transferAmount || webhookData.transferAmount <= 0) {
        this.logger.warn(
          'Transaction amount is invalid or not incoming payment',
        );
        return { success: false, message: 'Invalid transaction amount' };
      }

      if (webhookData.transferType !== 'in') {
        this.logger.warn('Transaction is not incoming payment');
        return { success: false, message: 'Not incoming payment' };
      }

      // 2. Kiểm tra content tồn tại
      if (!webhookData.content) {
        this.logger.warn('Transaction content is empty');
        return { success: false, message: 'Transaction content is empty' };
      }

      // 3. Trích xuất mã đơn hàng từ nội dung giao dịch
      const orderCode = this.extractOrderCode(webhookData.content);
      if (!orderCode) {
        this.logger.warn(
          `Order code not found in transaction content: ${webhookData.content}`,
        );
        return { success: false, message: 'Order code not found' };
      }

      this.logger.log(`Extracted order code: ${orderCode}`);

      // 4. Trích xuất mã học sinh (có thể nhiều học sinh)
      const studentCodesStr = webhookData.content.replace(orderCode, '').trim();

      if (!studentCodesStr) {
        this.logger.warn('Student codes not found in transaction content');
        return { success: false, message: 'Student codes not found' };
      }

      // Parse danh sách mã học sinh (format: STU001,STU002,STU003)
      const studentCodes = studentCodesStr
        .split(',')
        .map((code) => code.trim());
      this.logger.log(`Extracted student codes: ${studentCodes.join(', ')}`);

      // 5. Tìm tất cả học sinh
      const students = await this.prisma.student.findMany({
        where: {
          studentCode: {
            in: studentCodes,
          },
        },
        include: {
          user: true,
        },
      });

      if (students.length === 0) {
        this.logger.warn(
          `No students found with codes: ${studentCodes.join(', ')}`,
        );
        return { success: false, message: 'Students not found' };
      }

      if (students.length !== studentCodes.length) {
        this.logger.warn('Some students not found');
      }

      this.logger.log(`Found ${students.length} students`);

      // 6. Tìm tất cả FeeRecord chưa thanh toán đủ
      const studentIds = students.map((s) => s.id);
      const feeRecords = await this.prisma.feeRecord.findMany({
        where: {
          studentId: {
            in: studentIds,
          },
          status: {
            in: ['pending', 'partially_paid'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (feeRecords.length === 0) {
        this.logger.warn(`No fee records found for students`);
        return { success: false, message: 'Fee records not found' };
      }

      this.logger.log(`Found ${feeRecords.length} fee records`);

      // 7. Kiểm tra đã xử lý giao dịch này chưa (tránh trùng lặp)
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          transactionCode: webhookData.referenceCode,
        },
      });

      if (existingPayment) {
        this.logger.warn(
          `Transaction already processed: ${webhookData.referenceCode}`,
        );
        return { success: false, message: 'Transaction already processed' };
      }

      // 8. Tính tổng số tiền cần thanh toán và phân bổ
      let totalRemainingAmount = 0;
      const feeRecordMap = new Map<string, any>();

      for (const feeRecord of feeRecords) {
        const remainingAmount =
          Number(feeRecord.totalAmount) - Number(feeRecord.paidAmount);
        totalRemainingAmount += remainingAmount;
        feeRecordMap.set(feeRecord.id, {
          ...feeRecord,
          remainingAmount,
        });
      }

      this.logger.log(
        `Total remaining amount: ${totalRemainingAmount}, Paid amount: ${webhookData.transferAmount}`,
      );

      // 9. Kiểm tra số tiền thanh toán
      if (webhookData.transferAmount > totalRemainingAmount) {
        this.logger.warn(
          `Paid amount (${webhookData.transferAmount}) exceeds remaining amount (${totalRemainingAmount})`,
        );
      }

      // 10. TẠO Payment records và cập nhật FeeRecords
      const result = await this.prisma.$transaction(async (tx) => {
        const createdPayments = [];
        const updatedFeeRecords = [];
        let remainingPaidAmount = webhookData.transferAmount;

        // Tìm phụ huynh
        const parent = await tx.parent.findFirst({
          where: {
            students: {
              some: {
                id: {
                  in: studentIds,
                },
              },
            },
          },
          include: {
            user: true,
          },
        });

        // Phân bổ số tiền cho từng FeeRecord
        for (const feeRecord of feeRecords) {
          if (remainingPaidAmount <= 0) break;

          const feeInfo = feeRecordMap.get(feeRecord.id);
          const amountToPay = Math.min(
            remainingPaidAmount,
            feeInfo.remainingAmount,
          );

          // Tạo Payment record cho từng học sinh
          const payment = await tx.payment.create({
            data: {
              feeRecordId: feeRecord.id,
              studentId: feeRecord.studentId,
              parentId: parent?.id || null,
              amount: amountToPay,
              method: 'bank_transfer', // Chuyển khoản ngân hàng
              status: 'completed',
              reference: orderCode,
              transactionCode: webhookData.referenceCode,
              paidAt: new Date(webhookData.transactionDate),
              notes: `Thanh toán qua ${webhookData.gateway} - ${webhookData.content} (Thanh toán nhiều học sinh)`,
            },
          });

          createdPayments.push(payment);

          // Cập nhật FeeRecord
          const newPaidAmount = Number(feeRecord.paidAmount) + amountToPay;
          const totalAmount = Number(feeRecord.totalAmount);

          let newStatus = 'pending';
          if (newPaidAmount === 0) {
            newStatus = 'pending';
          } else if (newPaidAmount < totalAmount) {
            newStatus = 'partially_paid';
          } else {
            newStatus = 'paid';
          }

          const updatedFeeRecord = await tx.feeRecord.update({
            where: { id: feeRecord.id },
            data: {
              paidAmount: newPaidAmount,
              status: newStatus,
            },
          });

          updatedFeeRecords.push(updatedFeeRecord);

          remainingPaidAmount -= amountToPay;
          this.logger.log(
            `Processed fee record ${feeRecord.id}: paid ${amountToPay}, status: ${newStatus}`,
          );
        }

        // Gửi thông báo cho phụ huynh
        // Chuẩn bị dữ liệu cho email template
        const emailData = {
          parentName: parent.user.fullName,
          orderCode: orderCode,
          totalAmount: webhookData.transferAmount,
          paymentDate: new Date(webhookData.transactionDate).toLocaleDateString(
            'vi-VN',
          ),
          paymentTime: new Date(webhookData.transactionDate).toLocaleTimeString(
            'vi-VN',
          ),
          paymentMethod: 'Chuyển khoản ngân hàng',
          bankName: webhookData.gateway,
          transactionCode: webhookData.referenceCode,
          students: result.feeRecords.map((feeRecord, index) => ({
            studentName: students[index].user.fullName,
            studentCode: students[index].studentCode,
            className: feeRecord.class?.name || 'N/A',
            feeAmount: Number(result.payments[index].amount),
            feeDescription: `Học phí tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
          })),
        };
        await this.sendSuccessPayment(
          emailData,
          parent.user.email,
          'Xác nhận thanh toán học phí thành công',
        );
        console.log('Đã gửi email cho phụ huynh');

        return { payments: createdPayments, feeRecords: updatedFeeRecords };
      });

      this.logger.log(`Successfully processed payment for order: ${orderCode}`);
      this.logger.log(`Created ${result.payments.length} payment records`);

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderCode: orderCode,
          totalAmount: webhookData.transferAmount,
          studentsCount: students.length,
          studentCodes: studentCodes,
          paymentsCreated: result.payments.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to handle Sepay webhook', error);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Trích xuất mã đơn hàng từ nội dung chuyển khoản
   */
  private extractOrderCode(content: string): string | null {
    const match = content.match(/HP\d+/);
    return match ? match[0] : null;
  }

  /**
   * Kiểm tra trạng thái thanh toán theo mã đơn hàng
   */
  async verifyTransaction(orderCode: string) {
    try {
      // Tìm payment đã hoàn thành với orderCode
      const payment = await this.prisma.payment.findFirst({
        where: {
          reference: orderCode,
          status: 'completed',
        },
        include: {
          feeRecord: {
            include: {
              student: {
                include: { user: true },
              },
              class: true,
            },
          },
        },
      });

      if (!payment) {
        return {
          data: {
            orderCode,
            status: 'waiting',
            message:
              'Giao dịch chưa được xác nhận. Vui lòng chờ sau khi chuyển khoản.',
          },
          message: 'Chưa tìm thấy giao dịch',
        };
      }

      return {
        data: {
          orderCode,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt,
          feeRecord: payment.feeRecord,
        },
        message: 'Lấy thông tin giao dịch thành công',
      };
    } catch (error) {
      this.logger.error(`Failed to verify transaction: ${orderCode}`, error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử thanh toán của học sinh
   * CHỈ LẤY CÁC PAYMENT ĐÃ COMPLETED
   */
  async getPaymentHistory(studentId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          studentId,
          status: 'completed',
        },
        include: {
          feeRecord: {
            include: {
              class: true,
            },
          },
          parent: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          paidAt: 'desc',
        },
      });

      return {
        data: payments,
        message: 'Lấy lịch sử thanh toán thành công',
      };
    } catch (error) {
      this.logger.error('Failed to get payment history', error);
      throw error;
    }
  }

  private generateVietQRContent(params: {
    accountNumber: string;
    bankCode: string;
    amount: number;
    content: string;
    bankAccountName: string;
  }): string {
    const { accountNumber, bankCode, amount, content, bankAccountName } =
      params;
    const encodedContent = encodeURIComponent(content);
    const encodedBankAccountName = encodeURIComponent(bankAccountName);

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedBankAccountName}`;
  }

  async sendTestEmail() {
    try {
      const emailTemplate = {
        parentName: 'Nguyen Van A',
        orderCode: 'HP123456789',
        totalAmount: 1000000,
        paymentDate: '01/01/2024',
        paymentTime: '10:00:00',
        paymentMethod: 'Chuyển khoản ngân hàng',
        bankName: 'Vietcombank',
        transactionCode: 'TX123456789',
        students: [
          {
            studentName: 'Nguyen Van A',
            studentCode: 'STU001',
            className: 'Lop 1A',
            feeAmount: 500000,
            feeDescription: 'Học phí tháng 1',
          },
          {
            studentName: 'Nguyen Van A',
            studentCode: 'STU001',
            className: 'Lop 1A',
            feeAmount: 500000,
            feeDescription: 'Học phí tháng 1',
          },
        ],
      };
      await this.sendSuccessPayment(
        emailTemplate,
        'nguyenbaha0805@gmail.com',
        'Xác nhận thanh toán học phí thành công',
      );
      console.log('Đã gửi email test thành công');
    } catch (error) {
      this.logger.error('Failed to send test email', error);
      throw error;
    }
  }

  async sendSuccessPayment(emailData: any, to, subject) {
    try {
      const emailTemplate = paymentSuccessEmailTemplate(emailData);
      await emailUtil(to, subject, emailTemplate);
      console.log(`✅ Đã gửi email xác nhận thanh toán thành công đến ${to}`);

      return true;
    } catch (error) {
      console.error(
        `❌ Lỗi khi gửi email xác nhận thanh toán: ${error.message}`,
      );
      return false;
    }
  }
}
