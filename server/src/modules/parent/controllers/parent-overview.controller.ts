import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ParentOverviewService } from '../services/parent-overview.service';

@ApiTags('Parent - Overview')
@Controller('')
@UseGuards(JwtAuthGuard)
export class ParentOverviewController {
  constructor(
    private readonly parentOverviewService: ParentOverviewService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Lấy overview dashboard cho parent' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Lọc theo ngày (YYYY-MM-DD), mặc định là hôm nay',
  })
  @ApiResponse({ status: 200, description: 'Lấy overview thành công' })
  async getOverview(@Req() req: any, @Query('date') date?: string) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const result = await this.parentOverviewService.getParentOverview(
        parentUserId,
        date,
      );

      return {
        success: true,
        data: result,
        message: 'Lấy overview thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy overview',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
