import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/db/prisma.service';

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
    this.accountNumber = this.configService.get<string>('SEPAY_ACCOUNT_VA') || '9624716YAW';
    this.bankCode = this.configService.get<string>('SEPAY_BANK_NAME') || 'BIDV';
    this.bankAccountName = this.configService.get<string>('SEPAY_BANK_ACCOUNT_NAME') || 'TRUNG TAM GIAO DUC';
  }

  /**
   * Tạo mã QR thanh toán cho hóa đơn
   * KHÔNG lưu vào Payment, chỉ trả về thông tin QR
   */
  async createPaymentQR(dto: CreatePaymentQRDto) {
    try {
      // 1. Kiểm tra FeeRecord tồn tại
      const feeRecord = await this.prisma.feeRecord.findUnique({
        where: { id: dto.feeRecordId },
        include: {
          student: {
            include: {
              user: true,
            },
          },
          class: true,
        },
      });

      if (!feeRecord) {
        throw new BadRequestException('Không tìm thấy hóa đơn học phí');
      }

      // 2. Kiểm tra số tiền thanh toán
      const remainingAmount = Number(feeRecord.totalAmount) - Number(feeRecord.paidAmount);
      
      if (dto.amount > remainingAmount) {
        throw new BadRequestException('Số tiền thanh toán vượt quá số tiền còn lại');
      }

      // 3. Tạo mã giao dịch duy nhất
      let orderCode = `HP${Date.now()}${Math.floor(Math.random() * 1000)}`;

      //check code có tồn tại chưa

      const existingPayment = await this.prisma.payment.findFirst({ where: { transactionCode: orderCode } });
      while (true) {
        if(existingPayment) {
          orderCode = `HP${Date.now()}${Math.floor(Math.random() * 1000)}`;
        } else {
          break;
        }
      }
      // 4. Tạo nội dung chuyển khoản
      const content = `${orderCode} ${feeRecord.student.studentCode}`;

      // 5. Tạo QR Code URL theo chuẩn VietQR
      const qrCodeUrl = this.generateVietQRContent({
        accountNumber: this.accountNumber,
        bankCode: this.bankCode,
        amount: dto.amount,
        content: content,
        bankAccountName: this.bankAccountName,
      });

      // 6. CHỈ TRẢ VỀ THÔNG TIN QR - KHÔNG LƯU VÀO DATABASE
      return {
        data: {
          orderCode,
          qrCodeUrl,
          amount: dto.amount,
          content,
          accountNumber: this.accountNumber,
          bankCode: this.bankCode,
          bankName: this.getBankName(this.bankCode),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Hết hạn sau 15 phút
          feeRecord: {
            id: feeRecord.id,
            totalAmount: feeRecord.totalAmount,
            paidAmount: feeRecord.paidAmount,
            remainingAmount: remainingAmount,
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
   * Tạo nội dung VietQR theo chuẩn
   */
  private generateVietQRContent(params: {
    accountNumber: string;
    bankCode: string;
    amount: number;
    content: string;
    bankAccountName: string;
  }): string {
    const { accountNumber, bankCode, amount, content, bankAccountName } = params;
    const encodedContent = encodeURIComponent(content);
    const encodedBankAccountName = encodeURIComponent(bankAccountName);

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedBankAccountName}`;
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
   * CHỈ KHI NÀY MỚI TẠO Payment record vào database
   */
  async handleWebhook(webhookData: SepayWebhookDto) {
    try {
      this.logger.log(`Received Sepay webhook: ${JSON.stringify(webhookData)}`);
      
      // 1. Kiểm tra giao dịch là tiền vào
      if (!webhookData.transferAmount || webhookData.transferAmount <= 0) {
        this.logger.warn('Transaction amount is invalid or not incoming payment');
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
        this.logger.warn(`Order code not found in transaction content: ${webhookData.content}`);
        return { success: false, message: 'Order code not found' };
      }

      this.logger.log(`Extracted order code: ${orderCode}`);

      // 4. Trích xuất mã học sinh
      const studentCode = webhookData.content.replace(orderCode, '').trim();
      
      if (!studentCode) {
        this.logger.warn('Student code not found in transaction content');
        return { success: false, message: 'Student code not found' };
      }

      this.logger.log(`Extracted student code: ${studentCode}`);

      // 5. Tìm student
      const student = await this.prisma.student.findFirst({
        where: {
          studentCode: studentCode,
        },
        include: {
          user: true,
        },
      });

      if (!student) {
        this.logger.warn(`Student not found with code: ${studentCode}`);
        return { success: false, message: 'Student not found' };
      }

      this.logger.log(`Found student: ${student.user.fullName} (${student.studentCode})`);

      // 6. Tìm FeeRecord chưa thanh toán đủ của học sinh
      const feeRecord = await this.prisma.feeRecord.findFirst({
        where: {
          studentId: student.id,
          status: {
            in: ['pending', 'partially_paid'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!feeRecord) {
        this.logger.warn(`Fee record not found for student: ${student.id}`);
        return { success: false, message: 'Fee record not found' };
      }

      this.logger.log(`Found fee record: ${feeRecord.id} - Amount: ${feeRecord.totalAmount}`);

      // 7. Kiểm tra đã xử lý giao dịch này chưa (tránh trùng lặp)
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          transactionCode: webhookData.referenceCode,
        },
      });

      if (existingPayment) {
        this.logger.warn(`Transaction already processed: ${webhookData.referenceCode}`);
        return { success: false, message: 'Transaction already processed' };
      }

      // 8. TẠO Payment record MỚI và cập nhật FeeRecord
      const result = await this.prisma.$transaction(async (tx) => {
        // Tìm phụ huynh để gửi thông báo
        const parent = await tx.parent.findFirst({
          where: {
            students: {
              some: {
                id: student.id,
              },
            },
          },
          include:{
            user: true
          }
        });
        // Tạo Payment record - LẦN ĐẦU TIÊN LƯU VÀO DATABASE
        const payment = await tx.payment.create({
          data: {
            feeRecordId: feeRecord.id,
            studentId: student.id,
            parentId: parent.id,
            amount: webhookData.transferAmount,
            method: 'bank_transfer',
            status: 'completed',
            reference: orderCode,
            transactionCode: orderCode,
            paidAt: new Date(webhookData.transactionDate),
            notes: `Thanh toán qua ${webhookData.gateway} - ${webhookData.content}`,
          },
        });

        // Cập nhật FeeRecord
        const newPaidAmount = Number(feeRecord.paidAmount) + webhookData.transferAmount;
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

        

        // send email notification to parent (if needed)
        this.logger.log("Đã send Email thông báo thanh toán" + parent.user.email);
        

        return { payment, updatedFeeRecord };
      });

      this.logger.log(`Successfully processed payment for order: ${orderCode}`);
      this.logger.log(`Payment ID: ${result.payment.id}, Fee Record Status: ${result.updatedFeeRecord.status}`);
      
      return { 
        success: true, 
        message: 'Payment processed successfully',
        data: {
          paymentId: result.payment.id,
          amount: webhookData.transferAmount,
          orderCode: orderCode,
          studentCode: studentCode,
        }
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
            message: 'Giao dịch chưa được xác nhận. Vui lòng chờ sau khi chuyển khoản.',
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
}