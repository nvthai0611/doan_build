import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/db/prisma.service';
import { FeeRecordPaymentInfo } from '../dto/create-payment-qr.dto';
import { paymentSuccessEmailTemplate } from 'src/modules/shared/template-email/template-notification';
import emailUtil from 'src/utils/email.util';
import { PaymentGateway } from '../gateway/payment.gateway';

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
    private readonly paymentGateway: PaymentGateway, // Inject Gateway
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
            `Hóa đơn của học sinh ${feeRecord.student.user.fullName} đã được thanh toán đủ, vui lòng không chọn thanh toán`,
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
      this.logger.error('Lỗi khi lấy danh sách giao dịch từ Sepay', error);
      throw error;
    }
  }

  /**
   * Xử lý webhook từ Sepay khi có giao dịch mới
   * Hỗ trợ thanh toán nhiều học sinh
   */
  async handleWebhook(webhookData: SepayWebhookDto) {
    try {
      this.logger.log(`Nhận webhook từ Sepay: ${JSON.stringify(webhookData)}`);

      // Validate cơ bản
      if (!webhookData.transferAmount || webhookData.transferAmount <= 0) {
        this.logger.warn('Số tiền giao dịch không hợp lệ');
        return { data: null, message: 'Số tiền giao dịch không hợp lệ' };
      }
      if (webhookData.transferType !== 'in') {
        this.logger.warn('Không phải giao dịch nhận tiền');
        return { data: null, message: 'Không phải giao dịch nhận tiền' };
      }
      if (!webhookData.content) {
        this.logger.warn('Nội dung giao dịch trống');
        return { data: null, message: 'Nội dung giao dịch trống' };
      }

      // Trích xuất orderCode và danh sách studentCode
      const orderCode = this.extractOrderCode(webhookData.content);
      if (!orderCode) {
        this.logger.warn(
          `Không tìm thấy mã đơn hàng trong nội dung: ${webhookData.content}`,
        );
        return { data: null, message: 'Không tìm thấy mã đơn hàng' };
      }
      const studentCodesStr = webhookData.content.replace(orderCode, '').trim();
      if (!studentCodesStr) {
        this.logger.warn('Không tìm thấy mã học sinh');
        return { data: null, message: 'Không tìm thấy mã học sinh' };
      }
      const studentCodes = studentCodesStr.split(',').map((s) => s.trim());

      // Idempotency: kiểm tra Payment theo transactionCode (orderCode) hoặc reference (referenceCode)
      const existed = await this.prisma.payment.findFirst({
        where: {
          OR: [
            { transactionCode: orderCode },
            { reference: webhookData.referenceCode || '' },
          ],
        },
      });
      if (existed) {
        this.logger.warn(
          `Giao dịch đã được xử lý: orderCode=${orderCode}, ref=${webhookData.referenceCode}`,
        );
        return {
          data: { paymentId: existed.id },
          message: 'Giao dịch đã được xử lý trước đó',
        };
      }

      // Tìm students
      const students = await this.prisma.student.findMany({
        where: { studentCode: { in: studentCodes } },
        include: { user: true },
      });
      if (students.length === 0) {
        return { data: null, message: 'Không tìm thấy học sinh' };
      }
      const studentIds = students.map((s) => s.id);

      // Lấy các FeeRecord còn nợ (ưu tiên theo createdAt desc)
      const feeRecords = await this.prisma.feeRecord.findMany({
        where: {
          studentId: { in: studentIds },
          status: { in: ['pending', 'partially_paid'] },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (feeRecords.length === 0) {
        return { data: null, message: 'Không tìm thấy hóa đơn cần thanh toán' };
      }

      // Phân bổ số tiền (có thể trả một phần)
      const allocations = this.calculatePaymentAllocations(
        feeRecords,
        webhookData.transferAmount,
      );
      if (allocations.length === 0) {
        return { data: null, message: 'Số tiền không đủ để phân bổ' };
      }

      // Transaction: tạo 1 Payment + N FeeRecordPayment + cập nhật FeeRecord
      const result = await this.prisma.$transaction(async (tx) => {
        // Tìm phụ huynh theo danh sách học sinh
        const parent = await tx.parent.findFirst({
          where: { students: { some: { id: { in: studentIds } } } },
          include: { user: true },
        });

        // Tạo 1 Payment duy nhất (tổng số tiền giao dịch)
        const payment = await tx.payment.create({
          data: {
            amount: webhookData.transferAmount,
            method: 'bank_transfer',
            status: 'completed',
            reference: webhookData.referenceCode || null,
            transactionCode: orderCode,
            paidAt: new Date(webhookData.transactionDate),
            notes: `Thanh toán ${allocations.length} hóa đơn qua ${webhookData.gateway}`,
            parent: parent ? { connect: { id: parent.id } } : undefined,
          },
        });

        // Tạo allocations và update FeeRecord
        for (const alloc of allocations) {
          await tx.feeRecordPayment.create({
            data: {
              paymentId: payment.id,
              feeRecordId: alloc.feeRecordId,
              amount: alloc.amountToPay,
              notes: webhookData.description || undefined,
            },
          });

          const fr = feeRecords.find((f) => f.id === alloc.feeRecordId)!;
          const newPaid = Number(fr.paidAmount) + alloc.amountToPay;
          const total = Number(
            fr.totalAmount ?? Number(fr.amount) - Number(fr.discount ?? 0),
          );

          await tx.feeRecord.update({
            where: { id: fr.id },
            data: {
              paidAmount: newPaid,
              status:
                newPaid >= total
                  ? 'paid'
                  : newPaid > 0
                  ? 'partially_paid'
                  : 'pending',
            },
          });
        }

        // Gửi email thông báo
        if (parent?.user?.email) {
          const emailData = {
            parentName: parent.user.fullName,
            orderCode,
            totalAmount: webhookData.transferAmount,
            paymentDate: new Date(webhookData.transactionDate).toLocaleDateString('vi-VN'),
            paymentTime: new Date(webhookData.transactionDate).toLocaleTimeString('vi-VN'),
            paymentMethod: 'Chuyển khoản ngân hàng',
            bankName: webhookData.gateway,
            transactionCode: webhookData.referenceCode,
            students: allocations.map((alloc) => {
              const fr = feeRecords.find((f) => f.id === alloc.feeRecordId)!;
              const st = students.find((s) => s.id === fr.studentId)!;
              return {
                studentName: st.user.fullName,
                studentCode: st.studentCode,
                className: null,
                feeAmount: alloc.amountToPay,
                feeDescription: `Thanh toán học phí`,
              };
            }),
          };
          await this.sendSuccessPayment(
            emailData,
            parent.user.email,
            'Xác nhận thanh toán học phí thành công',
          );
        }

        return { payment, allocations, students, feeRecords };
      });

      // ✅ BẮN SOCKET SAU KHI TRANSACTION THÀNH CÔNG
      this.paymentGateway.notifyPaymentSuccess(orderCode, {
        orderCode,
        paymentId: result.payment.id,
        amount: webhookData.transferAmount,
        paidAt: result.payment.paidAt.toISOString(),
        allocations: result.allocations.map((alloc) => {
          const fr = result.feeRecords.find((f) => f.id === alloc.feeRecordId)!;
          const st = result.students.find((s) => s.id === fr.studentId)!;
          return {
            feeRecordId: alloc.feeRecordId,
            amount: alloc.amountToPay,
            studentName: st.user.fullName,
            studentCode: st.studentCode,
          };
        }),
      });

      this.logger.log(
        `✅ 1 payment → phân bổ cho ${result.allocations.length} hóa đơn (orderCode=${orderCode})`,
      );
      
      return {
        data: { 
          paymentId: result.payment.id, 
          orderCode, 
          allocatedCount: result.allocations.length 
        },
        message: 'Xử lý thanh toán thành công',
      };
    } catch (error) {
      this.logger.error('Lỗi khi xử lý webhook', error);
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
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { transactionCode: orderCode },
          { reference: orderCode } // fallback nếu client truyền nhầm
        ],
        status: 'completed'
      },
      include: {
        feeRecordPayments: {
          include: {
            feeRecord: {
              include: {
                student: { include: { user: true } },
                class: true,
                feeStructure: true
              }
            }
          }
        },
        parent: { include: { user: true } }
      }
    });

    if (!payment) {
      return {
        data: { orderCode, status: 'waiting', message: 'Giao dịch chưa được xác nhận' },
        message: 'Chưa tìm thấy giao dịch'
      };
    }

    return {
      data: {
        orderCode,
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        allocations: payment.feeRecordPayments.map(pr => ({
          feeRecordId: pr.feeRecordId,
          amount: pr.amount,
          studentName: pr.feeRecord.student.user.fullName,
          studentCode: pr.feeRecord.student.studentCode,
          className: pr.feeRecord.class?.name
        }))
      },
      message: 'Lấy thông tin giao dịch thành công'
    };
  } catch (error) {
    this.logger.error(`Lỗi khi xác minh giao dịch: ${orderCode}`, error);
    throw error;
  }
}

  /**
   * Lấy lịch sử thanh toán của học sinh
   * CHỈ LẤY CÁC PAYMENT ĐÃ COMPLETED
   */
  // async getPaymentHistory(studentId: string) {
  //   try {
  //     const payments = await this.prisma.payment.findMany({
  //       where: {
  //         studentId,
  //         status: 'completed',
  //       },
  //       include: {
  //         feeRecord: {
  //           include: {
  //             class: true,
  //           },
  //         },
  //         parent: {
  //           include: {
  //             user: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         paidAt: 'desc',
  //       },
  //     });

  //     return {
  //       data: payments,
  //       message: 'Lấy lịch sử thanh toán thành công',
  //     };
  //   } catch (error) {
  //     this.logger.error('Failed to get payment history', error);
  //     throw error;
  //   }
  // }

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
  // Tính toán phân bổ số tiền thanh toán cho từng FeeRecord
  // Nếu 100k mà có 2 hóa đơn thì sẽ trả cho 1 hóa đơn nếu đủ thì sẽ thay status
  // Nếu hóa đơn 1 70k thì hóa đơn 2 chỉ trả được 30k
  private calculatePaymentAllocations(
    feeRecords: any[],
    totalPaidAmount: number,
  ) {
    const allocations = [];
    let remainingAmount = totalPaidAmount;

    for (const feeRecord of feeRecords) {
      const remainingFeeAmount =
        Number(feeRecord.totalAmount) - Number(feeRecord.paidAmount);

      const amountToPay = Math.min(remainingAmount, remainingFeeAmount);

      allocations.push({
        feeRecordId: feeRecord.id,
        studentId: feeRecord.studentId,
        remainingFeeAmount,
        amountToPay,
      });

      remainingAmount -= amountToPay;
      if (remainingAmount <= 0) break;
    }

    return allocations;
  }
}
