import { Controller, Get, Query, Req } from '@nestjs/common';
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

    @Get('payment-history')
    async getPaymentHistory(@Req() req: any) {
        const parentId = req.user.parentId
        return await this.financialService.getPaymentHistoryForParent(parentId)
    }
}
