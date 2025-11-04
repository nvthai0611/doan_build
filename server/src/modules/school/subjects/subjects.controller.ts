import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả môn học' })
    async findAll() {
        return this.subjectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin 1 môn học' })
    async findOne(@Param('id') id: string) {
        return this.subjectsService.findOne(id);
    }
}
