import {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CommitmentsService } from '../services/commitments.service';
import { UploadCommitmentDto } from '../dto/request/upload-commitment.dto';
import { PrismaService } from '../../../db/prisma.service';

@ApiTags('Parent - Commitments')
@Controller('commitments')
export class CommitmentsController {
  constructor(
    private readonly commitmentsService: CommitmentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lấy danh sách hợp đồng cam kết của học sinh' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Danh sách hợp đồng cam kết' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async getStudentCommitments(@Req() req: any, @Param('studentId') studentId: string) {
    try {
      const parentId = req.user?.userId;
      if (!parentId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Get parent record to get parentId
      const parent = await this.prisma.parent.findUnique({
        where: { userId: parentId },
        select: { id: true },
      });

      if (!parent) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.commitmentsService.getStudentCommitments(studentId, parent.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách hợp đồng cam kết',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload hợp đồng cam kết mới cho học sinh' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', format: 'uuid' },
        file: { type: 'string', format: 'binary' },
        subjectIds: { 
          type: 'string',
          description: 'JSON string array of subject IDs, e.g. ["uuid1", "uuid2"]'
        },
        note: { type: 'string' },
      },
      required: ['studentId', 'file', 'subjectIds'],
    },
  })
  @ApiResponse({ status: 201, description: 'Upload hợp đồng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy học sinh' })
  async uploadCommitment(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCommitmentDto,
  ) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Get parent record to get parentId
      const parent = await this.prisma.parent.findUnique({
        where: { userId: parentUserId },
        select: { id: true },
      });

      if (!parent) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Parse subjectIds from JSON string
      let subjectIds: string[] = [];
      try {
        if (typeof dto.subjectIds === 'string') {
          const parsed = JSON.parse(dto.subjectIds);
          if (Array.isArray(parsed)) {
            subjectIds = parsed;
          } else {
            throw new BadRequestException('subjectIds phải là mảng JSON hợp lệ');
          }
        } else if (Array.isArray(dto.subjectIds)) {
          subjectIds = dto.subjectIds;
        } else {
          throw new BadRequestException('subjectIds phải là mảng JSON hợp lệ');
        }
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw e;
        }
        throw new BadRequestException('subjectIds phải là mảng JSON hợp lệ');
      }

      if (subjectIds.length === 0) {
        throw new BadRequestException('Phải chọn ít nhất một môn học');
      }

      const data = await this.commitmentsService.uploadCommitment(
        parent.id,
        dto.studentId,
        file,
        subjectIds,
        dto.note,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi upload hợp đồng cam kết',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':commitmentId/student/:studentId')
  @ApiOperation({ summary: 'Xóa hợp đồng cam kết' })
  @ApiParam({ name: 'commitmentId', description: 'Commitment ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Xóa hợp đồng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hợp đồng' })
  @ApiResponse({ status: 400, description: 'Không thể xóa hợp đồng đang được sử dụng' })
  async deleteCommitment(
    @Req() req: any,
    @Param('commitmentId') commitmentId: string,
    @Param('studentId') studentId: string,
  ) {
    try {
      const parentUserId = req.user?.userId;
      if (!parentUserId) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin người dùng' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Get parent record to get parentId
      const parent = await this.prisma.parent.findUnique({
        where: { userId: parentUserId },
        select: { id: true },
      });

      if (!parent) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy thông tin phụ huynh' },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const data = await this.commitmentsService.deleteCommitment(
        commitmentId,
        studentId,
        parent.id,
      );

      return { success: true, ...data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa hợp đồng cam kết',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

