import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SepayService, CreatePaymentQRDto, SepayWebhookDto } from '../service/sepay.service';

@Controller('payment')
export class SepayController {
  constructor(
    private readonly sepayService: SepayService,
  ) {}

  /**
   * Tạo mã QR thanh toán cho hóa đơn
   * POST /payment/sepay/create-qr
   */
  @Post('sepay/create-qr')
  async createPaymentQR(@Body() dto: CreatePaymentQRDto) {
    return this.sepayService.createPaymentQR(dto);
  }

  /**
   * Webhook nhận thông báo từ Sepay khi có giao dịch mới
   * POST /payment/sepay/webhook
   */
  @Post('sepay/webhook')
  @HttpCode(HttpStatus.OK)
  async handleSepayWebhook(@Body() webhookData: SepayWebhookDto) {
    return this.sepayService.handleWebhook(webhookData);
  }

  /**
   * Lấy danh sách giao dịch Sepay
   * GET /payment/sepay/transactions?limit=50
   */
  @Get('sepay/transactions')
  async getSepayTransactions(@Query('limit') limit?: number) {
    return this.sepayService.getTransactions(limit);
  }

  /**
   * Verify giao dịch Sepay theo mã đơn hàng
   * GET /payment/sepay/verify/:orderCode
   */
  @Get('sepay/verify/:orderCode')
  async verifySepayTransaction(@Param('orderCode') orderCode: string) {
    return this.sepayService.verifyTransaction(orderCode);
  }

  /**
   * Lấy lịch sử thanh toán của học sinh
   * GET /payment/history/:studentId
   */
  @Get('history/:studentId')
  async getPaymentHistory(@Param('studentId') studentId: string) {
    return this.sepayService.getPaymentHistory(studentId);
  }

  @Post('sepay/test-email')
  async sendTestEmail() {
    return this.sepayService.sendTestEmail();
  }
}