import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinancialService } from '../services/financial.service';

@ApiTags('Parent - Financial')
@Controller('financial')
export class FinancialController {
    constructor(private readonly financialService: FinancialService){}

    @Get('fee-records')
    async getAllFeeRecordsForParent(@Req() req){
        console.log(req.user.parentId);
        
        // return this.financialService.getAllFeeRecordsForParent()
    }
}
