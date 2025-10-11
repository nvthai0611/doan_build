import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileManagementService } from '../services/file-management.service';
import { UploadMaterialDto, GetMaterialsDto } from '../dto/upload/upload-material.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@ApiTags('Teacher - File Management')
@Controller('file-management')
export class FileManagementController {
  constructor(
    private readonly fileManagementService: FileManagementService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload tài liệu' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        classId: { type: 'string', description: 'ID lớp học' },
        title: { type: 'string', description: 'Tiêu đề tài liệu' },
        category: { 
          type: 'string', 
          description: 'Danh mục',
          enum: ['lesson', 'exercise', 'exam', 'material', 'reference']
        },
        description: { type: 'string', description: 'Mô tả (optional)' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'File tài liệu',
        },
      },
      required: ['classId', 'title', 'category', 'file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload tài liệu thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thiếu file',
  })
  async uploadMaterial(
    @Req() req: any,
    @Body() dto: UploadMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const teacherId = req.user?.teacherId;
      
      if (!teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin giáo viên',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.uploadMaterial(
        teacherId,
        dto,
        file,
      );

      return {
        success: true,
        data,
        message: 'Upload tài liệu thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi upload tài liệu',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('materials')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của giáo viên' })
  @ApiQuery({ name: 'classId', required: false, description: 'Lọc theo lớp học' })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo danh mục' })
  @ApiQuery({ name: 'page', required: false, description: 'Trang hiện tại', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng mỗi trang', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách tài liệu thành công',
  })
  async getMaterials(@Req() req: any, @Query() query: GetMaterialsDto) {
    try {
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin giáo viên',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.getMaterials(
        teacherId,
        {
          ...query,
          page: query.page ? Number(query.page) : 1,
          limit: query.limit ? Number(query.limit) : 10,
        },
      );

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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('classes')
  @ApiOperation({ summary: 'Lấy danh sách lớp học của giáo viên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách lớp học thành công',
  })
  async getTeacherClasses(@Req() req: any) {
    try {
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin giáo viên',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.getTeacherClasses(teacherId);

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
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông tin giáo viên',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.fileManagementService.deleteMaterial(
        teacherId,
        id,
      );

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

  @Get('materials/:id/download-url')
  @ApiOperation({ summary: 'Lấy URL download với filename đúng' })
  @ApiParam({ name: 'id', description: 'ID tài liệu', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Lấy URL download thành công',
    schema: {
      properties: {
        url: { type: 'string', description: 'URL để download file' },
        fileName: { type: 'string', description: 'Tên file gốc' },
        fileType: { type: 'string', description: 'MIME type' },
        fileSize: { type: 'number', description: 'Kích thước file (bytes)' },
      },
    },
  })
  async getDownloadUrl(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.fileManagementService.getDownloadUrl(id);

      // Tự động tăng số lượt download
      await this.fileManagementService.incrementDownload(id);

      return {
        success: true,
        data,
        message: 'Lấy URL download thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi lấy URL download',
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

  @Get('materials/:id/download-direct')
  @ApiOperation({ summary: 'Download file trực tiếp qua backend (proxy)' })
  @ApiParam({ name: 'id', description: 'ID tài liệu', type: 'number' })
  async downloadFileDirect(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const downloadInfo = await this.fileManagementService.getDownloadUrl(id);
      
      // Tăng số lượt download
      await this.fileManagementService.incrementDownload(id);

      // Redirect đến URL Cloudinary với fl_attachment
      res.redirect(downloadInfo.url);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Có lỗi xảy ra khi download',
          error: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

