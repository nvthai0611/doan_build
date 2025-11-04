import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicClassesService } from '../services/public-classes.service';

@ApiTags('Public - Classes')
@Controller('public/classes')
export class PublicClassesController {
  constructor(private readonly publicClassesService: PublicClassesService) {}

  @Get('recruiting')
  @ApiOperation({ 
    summary: 'Lấy danh sách lớp đang tuyển sinh (Public API - không cần auth)',
    description: 'API công khai để hiển thị danh sách lớp đang tuyển sinh trên trang chủ'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách lớp đang tuyển sinh' 
  })
  async getRecruitingClasses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('subjectId') subjectId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    console.log();
    
    return this.publicClassesService.getRecruitingClasses({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      subjectId,
      gradeId,
      teacherId,
    });
  }

  @Get('subjects')
  @ApiOperation({ 
    summary: 'Lấy danh sách môn học (Public)',
    description: 'Danh sách môn học để filter trên homepage'
  })
  @ApiResponse({ status: 200, description: 'Danh sách môn học' })
  async getSubjects() {
    return this.publicClassesService.getSubjects();
  }

  @Get('grades')
  @ApiOperation({ 
    summary: 'Lấy danh sách khối lớp (Public)',
    description: 'Danh sách khối lớp để filter trên homepage'
  })
  @ApiResponse({ status: 200, description: 'Danh sách khối lớp' })
  async getGrades() {
    return this.publicClassesService.getGrades();
  }
}

