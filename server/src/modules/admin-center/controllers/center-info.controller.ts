import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CenterInfoService } from '../services/center-info.service';

@ApiTags('Admin Center - Center Info')
@Controller('center-info')
export class CenterInfoController {
  constructor(private readonly centerInfoService: CenterInfoService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy thông tin trung tâm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin trung tâm thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin trung tâm' })
  async getCenterInfo() {
    return this.centerInfoService.getCenterInfo();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logoFile', maxCount: 1 },
    { name: 'bannerFile', maxCount: 1 },
  ], {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP, SVG)'), false);
      }
    }
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật thông tin trung tâm (có thể kèm file logo/banner)' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin trung tâm thành công',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'JSON string của CenterInfoSettingDto',
        },
        logoFile: {
          type: 'string',
          format: 'binary',
          description: 'File logo (optional)',
        },
        bannerFile: {
          type: 'string',
          format: 'binary',
          description: 'File banner (optional)',
        },
      },
      required: ['data'],
    },
  })
  async updateCenterInfo(
    @Body() body: any,
    @UploadedFiles() files?: { logoFile?: Express.Multer.File[], bannerFile?: Express.Multer.File[] },
  ) {
    // Parse JSON data
    let data: any;
    try {
      data = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
    } catch (error) {
      throw new BadRequestException('Dữ liệu JSON không hợp lệ');
    }

    // Extract files
    const logoFile = files?.logoFile?.[0];
    const bannerFile = files?.bannerFile?.[0];

    return this.centerInfoService.updateCenterInfo(data, logoFile, bannerFile);
  }
}

