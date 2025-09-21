import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentParentLinksService } from './student-parent-links.service';
import { CreateStudentParentLinkDto } from './dto/create-student-parent-link.dto';
import { UpdateStudentParentLinkDto } from './dto/update-student-parent-link.dto';

@Controller('student-parent-links')
export class StudentParentLinksController {
  constructor(private readonly studentParentLinksService: StudentParentLinksService) {}

  @Post()
  create(@Body() createStudentParentLinkDto: CreateStudentParentLinkDto) {
    return this.studentParentLinksService.create(createStudentParentLinkDto);
  }

  @Get()
  findAll() {
    return this.studentParentLinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentParentLinksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentParentLinkDto: UpdateStudentParentLinkDto) {
    return this.studentParentLinksService.update(+id, updateStudentParentLinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentParentLinksService.remove(+id);
  }
}
