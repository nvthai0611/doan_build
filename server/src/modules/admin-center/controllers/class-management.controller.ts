import { ClassesService } from '../../school/classes/classes.service';
import { Controller, Get, Param, HttpException, HttpStatus, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClassesListResponseDto, ClassResponseDto } from '../../school/classes/dto/class-response.dto';

@ApiTags('Classes')
@Controller('classes')
export class ClassManagementController {
    constructor(private readonly classesService: ClassesService) {}
    // ...existing code...
}
