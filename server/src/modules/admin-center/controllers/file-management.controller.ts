import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FileManagementService } from '../services/file-management.service';

interface GetMaterialsQuery {
  classId?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

@ApiTags('Admin Center - File Management')
@Controller('file-management')
export class FileManagementController {
  constructor(
    private readonly fileManagementService: FileManagementService,
  ) {}

  @Get('materials')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của trung tâm' })
  @ApiQuery({ name: 'classId', required: false, description: 'Lọc theo lớp học' })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo danh mục' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách tài liệu thành công',
  })
  async getMaterials(@Req() req: any, @Query() query: GetMaterialsQuery) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin người dùng',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.getMaterials({
        ...query,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
      });

      return {
        success: true,
        data,
        message: 'Lấy danh sách tài liệu thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách tài liệu',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học của trung tâm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lớp học thành công',
  })
  async getCenterClasses(@Req() req: any) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin người dùng',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.getCenterClasses();

      return {
        success: true,
        data,
        message: 'Lấy danh sách lớp học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('materials/:id')
  @ApiOperation({ summary: 'Xóa tài liệu' })
  @ApiParam({ name: 'id', description: 'ID tài liệu', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Xóa tài liệu thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tài liệu',
  })
  async deleteMaterial(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin người dùng',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.deleteMaterial(id);

      return {
        success: true,
        data,
        message: 'Xóa tài liệu thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi xóa tài liệu',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('materials/:id/download')
  @ApiOperation({ summary: 'Tăng số lượt tải xuống' })
  @ApiParam({ name: 'id', description: 'ID tài liệu', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Tăng lượt tải xuống thành công',
  })
  async incrementDownload(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.fileManagementService.incrementDownload(id);

      return {
        success: true,
        data,
        message: 'Tăng lượt tải xuống thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

