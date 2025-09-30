import { ClassesService } from '../../school/classes/classes.service';
import { Controller, Get, Param, HttpException, HttpStatus, Body, Query, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClassManagementService } from '../services/class-management.service';

@ApiTags('Admin Center - Class Management')
@Controller('classes')
export class ClassManagementController {
    constructor(private readonly classesService: ClassManagementService) { }
    @Get('/class-by-teacher')
    @ApiOperation({ summary: 'Lấy danh sách lớp học theo ID giáo viên' })
    @ApiResponse({ status: 200, description: 'Danh sách lớp học' })
    async getClassByTeacher(@Query() query: any) {
        return this.classesService.getClassByTeacherId(query);
    }
    @Get('class-by-teacher/:id')
    @ApiOperation({ summary: 'Lấy chi tiết lớp học theo ID giáo viên' })
    @ApiResponse({ status: 200, description: 'Chi tiết lớp học' })
    async getClassByTeacherId(@Param('id') id: string) {
        return this.classesService.getClassDetail(id);
    }
    @Post('class-by-teacher')
    @ApiOperation({ summary: 'Tạo lớp học' })
    @ApiResponse({ status: 200, description: 'Lớp học' })
    async createClass(@Body() body: any) {
        return this.classesService.createClass(body);
    }
}


