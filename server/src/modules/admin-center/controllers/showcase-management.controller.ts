import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Express } from 'express';
import { ShowcaseManagementService } from '../services/showcase-management.service';

@ApiTags('Admin Center - Showcase Management')
@Controller('showcase-management')
export class ShowcaseManagementController {
  constructor(
    private readonly showcaseManagementService: ShowcaseManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách học sinh tiêu biểu' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Danh sách học sinh tiêu biểu',
  })
  async getAllShowcases(@Query() query: any) {
    try {
      return await this.showcaseManagementService.getAllShowcases({
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
        search: query.search,
        featured: query.featured === 'true' ? true : query.featured === 'false' ? false : undefined,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết học sinh tiêu biểu' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Thông tin học sinh tiêu biểu',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy học sinh tiêu biểu',
  })
  async getShowcaseById(@Param('id') id: string) {
    return await this.showcaseManagementService.getShowcaseById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('studentImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tạo học sinh tiêu biểu mới' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'studentImage', 'achievement'],
      properties: {
        title: { type: 'string', description: 'Tên học sinh' },
        description: { type: 'string', description: 'Mô tả hành trình' },
        studentImage: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh học sinh',
        },
        achievement: { type: 'string', description: 'Thành tích' },
        featured: { type: 'boolean', description: 'Nổi bật' },
        order: { type: 'number', description: 'Thứ tự hiển thị' },
        publishedAt: { type: 'string', format: 'date-time', description: 'Ngày publish' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo học sinh tiêu biểu thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  async createShowcase(
    @Body() createShowcaseDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Add file to DTO if provided
      if (file) {
        createShowcaseDto.studentImage = file;
      }

      // Parse boolean strings
      if (createShowcaseDto.featured === 'true') {
        createShowcaseDto.featured = true;
      } else if (createShowcaseDto.featured === 'false') {
        createShowcaseDto.featured = false;
      }

      // Parse order
      if (createShowcaseDto.order) {
        createShowcaseDto.order = Number(createShowcaseDto.order);
      }

      // Convert publishedAt string to Date if provided
      if (createShowcaseDto.publishedAt) {
        createShowcaseDto.publishedAt = new Date(createShowcaseDto.publishedAt);
      }

      return await this.showcaseManagementService.createShowcase(createShowcaseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi tạo học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('studentImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật thông tin học sinh tiêu biểu' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        studentImage: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh học sinh (optional)',
        },
        achievement: { type: 'string' },
        featured: { type: 'boolean' },
        order: { type: 'number' },
        publishedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật học sinh tiêu biểu thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy học sinh tiêu biểu',
  })
  async updateShowcase(
    @Param('id') id: string,
    @Body() updateShowcaseDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // Add file to DTO if provided
      if (file) {
        updateShowcaseDto.studentImage = file;
      }

      // Parse boolean strings
      if (updateShowcaseDto.featured === 'true') {
        updateShowcaseDto.featured = true;
      } else if (updateShowcaseDto.featured === 'false') {
        updateShowcaseDto.featured = false;
      }

      // Parse order
      if (updateShowcaseDto.order) {
        updateShowcaseDto.order = Number(updateShowcaseDto.order);
      }

      // Convert publishedAt string to Date if provided
      if (updateShowcaseDto.publishedAt) {
        updateShowcaseDto.publishedAt = new Date(updateShowcaseDto.publishedAt);
      }

      return await this.showcaseManagementService.updateShowcase(id, updateShowcaseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật học sinh tiêu biểu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa học sinh tiêu biểu' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Xóa học sinh tiêu biểu thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy học sinh tiêu biểu',
  })
  async deleteShowcase(@Param('id') id: string) {
    return await this.showcaseManagementService.deleteShowcase(id);
  }
}

