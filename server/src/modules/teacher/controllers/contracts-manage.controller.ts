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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ContractsManageService } from '../services/contracts-manage.service';
import { PrismaService } from '../../../db/prisma.service';

@ApiTags('Teacher - Contracts')
@Controller('contracts')
export class ContractsManageController {
  constructor(
    private readonly service: ContractsManageService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get contract uploads for teacher' })
  async list(@Req() req: any) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.UNAUTHORIZED);
      }

      const data = await this.service.listByTeacher(teacher.id);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(error.message || 'Error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contractType: { type: 'string' },
         expiryDate: { type: 'string', format: 'date' },
         notes: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
       required: ['file', 'expiryDate'],
    },
  })
  @ApiOperation({ summary: 'Upload a contract file' })
   async upload(
     @Req() req: any, 
     @UploadedFile() file: Express.Multer.File, 
     @Body('contractType') contractType: string,
     @Body('expiryDate') expiryDate: string,
     @Body('notes') notes: string,
   ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.UNAUTHORIZED);
      }

       const data = await this.service.createForTeacher(teacher.id, file, contractType, expiryDate, notes);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(error.message || 'Error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Contract upload id' })
  @ApiOperation({ summary: 'Delete a contract upload' })
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const teacher = await this.prisma.teacher.findFirst({ where: { userId }, select: { id: true } });
      if (!teacher) {
        throw new HttpException('Teacher not found', HttpStatus.UNAUTHORIZED);
      }

      const data = await this.service.deleteForTeacher(teacher.id, id);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(error.message || 'Error', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
