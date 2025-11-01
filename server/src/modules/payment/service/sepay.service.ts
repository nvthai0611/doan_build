import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
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
  feeRecordIds: string[]
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
async createPaymentQR(userId: string, dto: CreatePaymentQRDto) {
  const { feeRecordIds } = dto;
  
  // Validate input
  if (!userId || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
    throw new BadRequestException('Thiếu thông tin userId hoặc feeRecordIds');
  }

  const findParentByUserId = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { parent: true }
  });
  if (!findParentByUserId || !findParentByUserId.parent) {
    throw new BadRequestException('Không tìm thấy phụ huynh');
  }
  const parentId = findParentByUserId.parent.id;
  // Transaction: tạo payment + cập nhật feeRecords
  return await this.prisma.$transaction(async (tx) => {
    // Lấy các FeeRecord hợp lệ
    const feeRecords = await tx.feeRecord.findMany({
      where: {
        id: { in: feeRecordIds },
        status: 'pending',
        student: { parentId }
      },
      include: {
        student: true
      }
    });
    if (feeRecords.length !== feeRecordIds.length) {
      throw new BadRequestException('Một số hóa đơn không hợp lệ');
    }

    // Tính tổng tiền
    const totalAmount = feeRecords.reduce((sum, fr) => sum + Number(fr.totalAmount), 0);
    const orderCode = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const expirationDate = new Date(feeRecords[0].dueDate);

    // Tạo Payment (status: pending)
    const payment = await tx.payment.create({
      data: {
        parentId,
        amount: totalAmount,
        status: 'pending',
        transactionCode: orderCode,
        createdAt: new Date(),
        expirationDate,
        method: 'bank_transfer',
        feeRecordPayments: {
          create: feeRecords.map(fr => ({
            feeRecordId: fr.id
          }))
        }
      },
      include: { feeRecordPayments: true }
    });

    // Cập nhật status feeRecord thành 'processing'
    await tx.feeRecord.updateMany({
      where: { id: { in: feeRecordIds } },
      data: { status: 'processing' }
    });

    // Lấy danh sách studentCode
    const studentCodes = feeRecords.map(fr => fr.student.studentCode);
    const studentsCodeStr = studentCodes.join(' ');
    const content = `${payment.transactionCode}`;

    // Sinh QR code
    const qrCodeUrl = this.generateVietQRContent({
      accountNumber: this.accountNumber,
      bankCode: this.bankCode,
      amount: totalAmount,
      content,
      bankAccountName: this.bankAccountName,
    });

    return {
      data: {
        paymentId: payment.id,
        orderCode: payment.transactionCode,
        qrCodeUrl,
        totalAmount,
        content,
        accountNumber: this.accountNumber,
        bankCode: this.bankCode,
        bankName: this.getBankName(this.bankCode),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        summary: {
          totalStudents: studentCodes.length,
          studentCodes: studentsCodeStr,
        }
      },
      message: 'Tạo mã QR thanh toán thành công'
    };
  });
}

async regeneratePaymentQR(paymentId: string) {
  // Lấy payment
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      parent: true
    }
  });
  if (!payment) {
    throw new BadRequestException('Không tìm thấy payment');
  }

  // Sinh lại QR code mới
  const qrCodeUrl = this.generateVietQRContent({
    accountNumber: this.accountNumber,
    bankCode: this.bankCode,
    amount: Number(payment.amount),
    content: payment.transactionCode,
    bankAccountName: this.bankAccountName,
  });

  // (Tùy chọn) Cập nhật lại trường qrCodeUrl trong DB
  // await this.prisma.payment.update({
  //   where: { id: paymentId },
  //   data: { qrCodeUrl }
  // });

  return {
    data: {
      paymentId: payment.id,
      orderCode: payment.transactionCode,
      qrCodeUrl,
      totalAmount: payment.amount,
      content: payment.transactionCode,
      accountNumber: this.accountNumber,
      bankCode: this.bankCode,
      bankName: this.getBankName(this.bankCode),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    message: 'Tạo lại mã QR thành công'
  };
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

    // Trích xuất orderCode (transactionCode)
    const orderCode = this.extractOrderCode(webhookData.content);
    if (!orderCode) {
      this.logger.warn(`Không tìm thấy mã đơn hàng trong nội dung: ${webhookData.content}`);
      return { data: null, message: 'Không tìm thấy mã đơn hàng' };
    }

    // Tìm payment theo transactionCode
    const payment = await this.prisma.payment.findFirst({
      where: { transactionCode: orderCode },
      include: {
        feeRecordPayments: {
          include: {
            feeRecord: {
              include: {
                student: { include: { user: true } },
                class: true
              }
            }
          }
        },
        parent: { include: { user: true } }
      }
    });
    if (!payment) {
      this.logger.warn('Không tìm thấy payment');
      return { data: null, message: 'Không tìm thấy payment' };
    }

    // Idempotency: Nếu đã completed hoặc partially_paid thì bỏ qua
    if (['completed', 'partially_paid'].includes(payment.status)) {
      this.logger.warn('Payment đã được xử lý trước đó');
      return { data: { paymentId: payment.id }, message: 'Payment đã được xử lý trước đó' };
    }

    // So sánh số tiền
    const expectedAmount = Number(payment.amount);
    const paidAmount = Number(webhookData.transferAmount);

    let newStatus: 'completed' | 'partially_paid';
    let feeRecordStatus: 'paid' | 'partially_paid';
    if (paidAmount >= expectedAmount) {
      newStatus = 'completed';
      feeRecordStatus = 'paid';
    } else {
      newStatus = 'partially_paid';
      feeRecordStatus = 'partially_paid';
    }

    // Cập nhật payment và feeRecords trong transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          reference: webhookData.referenceCode || null,
          paidAt: new Date(webhookData.transactionDate),
          paidAmount,
          notes: `Thanh toán qua ${webhookData.gateway}`,
        }
      });

      // Cập nhật feeRecords
      for (const frp of payment.feeRecordPayments) {
        await tx.feeRecord.update({
          where: { id: frp.feeRecordId },
          data: { status: feeRecordStatus }
        });
      }
    });

    // Gửi email xác nhận thanh toán thành công
    if (payment.parent?.user?.email) {
      const emailData = {
        parentName: payment.parent.user.fullName,
        orderCode,
        totalAmount: paidAmount,
        paymentDate: new Date(webhookData.transactionDate).toLocaleDateString('vi-VN'),
        paymentTime: new Date(webhookData.transactionDate).toLocaleTimeString('vi-VN'),
        paymentMethod: 'Chuyển khoản ngân hàng',
        bankName: webhookData.gateway,
        transactionCode: webhookData.referenceCode,
        students: payment.feeRecordPayments.map((frp) => ({
          studentName: frp.feeRecord.student.user.fullName,
          studentCode: frp.feeRecord.student.studentCode,
          className: frp.feeRecord.class?.name || '',
          feeAmount: frp.feeRecord.totalAmount,
          feeDescription: 'Thanh toán học phí'
        })),
      };
      await this.sendSuccessPayment(
        emailData,
        payment.parent.user.email,
        'Xác nhận thanh toán học phí thành công'
      );
    }

    // Bắn socket thông báo thành công
    this.paymentGateway.notifyPaymentSuccess(orderCode, {
      orderCode,
      paymentId: payment.id,
      amount: paidAmount,
      paidAt: new Date(webhookData.transactionDate).toISOString(),
    });

    return {
      data: {
        paymentId: payment.id,
        orderCode,
        paidAmount,
        status: newStatus,
      },
      message: 'Xử lý thanh toán thành công'
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
    //PAY1761731230904487
    const match = content.match(/PAY\d+/);
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
}
