import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinancialService } from '../services/financial.service';

@ApiTags('Parent - Financial')
@Controller('financial')
export class FinancialController {
    constructor(private readonly financialService: FinancialService){}

    @Get('fee-records')
    async getAllFeeRecordsForParent(@Req() req, @Query('status') status: string){
        const parentId = req.user.parentId
        console.log(status);
        
        return this.financialService.getAllFeeRecordsForParent(parentId, status)
    }

    @Get(':id/detail')
    async getFeeRecordDetail(@Req() req, @Param('id') id: string){
        const parentId = req.user.parentId
        return this.financialService.getPaymentDetails(id, parentId)
    }

    @Get('payment-history')
    async getPaymentByStatus(@Req() req: any, @Query('status') status: string) {
        const parentId = req.user.parentId
        return await this.financialService.getPaymentForParentByStatus(parentId, status)
    }

      /**
   * Tạo payment cho các FeeRecord đã chọn (giống add to cart)
   */
  @Post('create-payment')
  async createPaymentForFeeRecords(
    @Req() req,
    @Body('feeRecordIds') feeRecordIds: string[]
  ) {
    const parentId = req.user.parentId
    return await this.financialService.createPaymentForFeeRecords(parentId, feeRecordIds)
  }
  
    /**
   * Cập nhật danh sách FeeRecord trong payment (thêm/bớt hóa đơn trong giỏ)
   */
  @Patch('update-payment-fee-records')
  async updatePaymentFeeRecords(
    @Req() req,
    @Body('paymentId') paymentId: string,
    @Body('feeRecordIds') feeRecordIds: string[]
  ) {
    const parentId = req.user.parentId
    return await this.financialService.updatePaymentFeeRecords(paymentId, feeRecordIds, parentId)
  }
}
