import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { TeacherManagementService } from '../services/teacher-management.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { QueryTeacherDto } from '../dto/teacher/query-teacher.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Center - Teacher Management')
@Controller('/teachers')
export class TeacherManagementController {
  constructor(private readonly teacherManagementService: TeacherManagementService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('contractImage'))
  create(@Body() createTeacherDto: CreateTeacherDto, @UploadedFile() file?: any) {
    // Thêm file vào DTO
    if (file) {
      createTeacherDto.contractImage = file;
    }


    return this.teacherManagementService.createTeacher(createTeacherDto);
  }

  @Get()
  findAll(@Query() queryDto: any) {
    return this.teacherManagementService.findAllTeachers(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherManagementService.findOneTeacher(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('contractImage'))
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      updateTeacherDto.contractImage = file;
    }
    return this.teacherManagementService.updateTeacher(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.teacherManagementService.removeTeacher(id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.teacherManagementService.toggleTeacherStatus(id);
  }

  @Get(':id/schedule')
  getSchedule(
    @Param('id') id: string,
    @Query('year') year?: string,
    @Query('month') month?: string
  ) {
    const yearNum = year ? parseInt(year) : undefined;
    const monthNum = month ? parseInt(month) : undefined;

    return this.teacherManagementService.getTeacherSchedule(id, yearNum, monthNum);
  }

  @Post('bulk-import-validate')
  @HttpCode(HttpStatus.OK)
  async validateBulkImport(@Body() body: { teachers: any[] }) {
    return this.teacherManagementService.validateTeachersData(body.teachers);
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  bulkImport(@Body() body: { teachers: any[] }) {
    console.log("Creating teachers:", body.teachers.length);

    return this.teacherManagementService.bulkImportTeachers(body.teachers);
  }

  @Get(':id/contracts')
  @HttpCode(HttpStatus.OK)
  getTeacherContracts(@Param('id') id: string) {
    return this.teacherManagementService.getTeacherContracts(id);
  }

  @Post(':id/contracts/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  uploadContractForTeacher(
    @Param('id') teacherId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('contractType') contractType: string,
    @Body('startDate') startDate: string,
    @Body('expiryDate') expiryDate: string,
    @Body('teacherSalaryPercent') teacherSalaryPercent: string,
    @Body('notes') notes?: string
  ) {
    // Validate teacherSalaryPercent
    const salaryPercent = parseFloat(teacherSalaryPercent);
    if (isNaN(salaryPercent) || salaryPercent < 0 || salaryPercent > 100) {
      throw new HttpException('teacherSalaryPercent must be between 0 and 100', HttpStatus.BAD_REQUEST);
    }

    return this.teacherManagementService.uploadContractForTeacher(
      teacherId,
      file,
      contractType,
      startDate,
      expiryDate,
      notes,
      salaryPercent
    );
  }

  @Delete(':id/contracts/:contractId')
  @HttpCode(HttpStatus.OK)
  deleteTeacherContract(
    @Param('id') teacherId: string,
    @Param('contractId') contractId: string
  ) {
    return this.teacherManagementService.deleteTeacherContract(teacherId, contractId);
  }
}