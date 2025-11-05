import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { ContractUploadService } from '../services/contract-upload.service';

@ApiTags('Admin Center - Contract Uploads')
@Controller('contract-uploads')
export class ContractUploadController {
  constructor(private readonly contractUploadService: ContractUploadService) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all contract uploads for a student' })
  @ApiParam({ name: 'studentId', description: 'Student ID (UUID)' })
  async getByStudentId(@Param('studentId') studentId: string) {
    try {
      const data = await this.contractUploadService.getByStudentId(studentId);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching contracts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('student/:studentId/upload')
  @UseInterceptors(FileInterceptor('applicationFile', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new HttpException('Chỉ chấp nhận file PDF, JPG hoặc PNG', HttpStatus.BAD_REQUEST), false);
      }
    }
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload contract for student' })
  @ApiParam({ name: 'studentId', description: 'Student ID (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string', format: 'uuid' },
        contractType: { type: 'string', default: 'application' },
        subjectIds: { type: 'string', description: 'JSON array of subject IDs' },
        note: { type: 'string' },
        expiredAt: { type: 'string', format: 'date-time' },
        applicationFile: { type: 'string', format: 'binary' },
      },
      required: ['applicationFile']
    }
  })
  async uploadContract(
    @Param('studentId') studentId: string,
    @UploadedFile() applicationFile: Express.Multer.File,
    @Body() body: any,
  ) {
    try {
      if (!applicationFile) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }
      // Parse subjectIds
      let parsedSubjectIds: string[] = [];
      if (body.subjectIds) {
        try {
          parsedSubjectIds = typeof body.subjectIds === 'string' ? JSON.parse(body.subjectIds) : body.subjectIds;
        } catch (e) {
          parsedSubjectIds = [];
        }
      }

      const data = await this.contractUploadService.uploadContract(
        studentId,
        applicationFile,
        {
          parentId: body.parentId,
          contractType: body.contractType || 'application',
          subjectIds: parsedSubjectIds,
          note: body.note,
          expiredAt: body.expiredAt ? new Date(body.expiredAt) : undefined,
        }
      );

      return { success: true, data, message: 'Upload đơn xin học thành công' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error uploading contract',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':contractId')
  @ApiOperation({ summary: 'Update contract' })
  @ApiParam({ name: 'contractId', description: 'Contract ID (UUID)' })
  async updateContract(
    @Param('contractId') contractId: string,
    @Body() body: {
      subjectIds?: string[];
      note?: string;
      expiredAt?: string;
      status?: string;
    }
  ) {
    try {
      const data = await this.contractUploadService.updateContract(contractId, {
        ...body,
        expiredAt: body.expiredAt ? new Date(body.expiredAt) : undefined,
      });
      return { success: true, data, message: 'Cập nhật hợp đồng thành công' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating contract',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':contractId')
  @ApiOperation({ summary: 'Delete contract' })
  @ApiParam({ name: 'contractId', description: 'Contract ID (UUID)' })
  async deleteContract(@Param('contractId') contractId: string) {
    try {
      await this.contractUploadService.deleteContract(contractId);
      return { success: true, message: 'Xóa hợp đồng thành công' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting contract',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
