import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { SepayService, CreatePaymentQRDto, SepayWebhookDto } from '../service/sepay.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('payment')
export class SepayController {
  constructor(
    private readonly sepayService: SepayService,
  ) {}

  /**
   * Tạo mã QR thanh toán cho hóa đơn
   * POST /payment/sepay/create-qr
   */
  @UseGuards(JwtAuthGuard)
  @Post('sepay/create-qr')
  async createPaymentQR(@Req() req: any, @Body() dto: CreatePaymentQRDto) {
    const userId = req.user.userId
    return this.sepayService.createPaymentQR( userId,{ feeRecordIds: dto.feeRecordIds });
  }
  @Post('sepay/regenerate-qr')
  async regeneratePaymentQR( @Body() body: any ) {
    return this.sepayService.regeneratePaymentQR(body.paymentId);
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
  // @Get('history/:studentId')
  // async getPaymentHistory(@Param('studentId') studentId: string) {
  //   return this.sepayService.getPaymentHistory(studentId);
  // }

  @Post('sepay/test-email')
  async sendTestEmail() {
    return this.sepayService.sendTestEmail();
  }
}