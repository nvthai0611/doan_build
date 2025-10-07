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
  HttpStatus
} from '@nestjs/common';
import { TeacherManagementService } from '../services/teacher-management.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';
import { QueryTeacherDto } from '../dto/teacher/query-teacher.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Center - Teacher Management')
@Controller('/teachers')
export class TeacherManagementController {
  constructor(private readonly teacherManagementService: TeacherManagementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateTeacherDto) {
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
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
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
    console.log(yearNum, monthNum);
    
    return this.teacherManagementService.getTeacherSchedule(id, yearNum, monthNum);
  }
}