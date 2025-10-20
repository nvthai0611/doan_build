import { Controller, Get, Injectable } from "@nestjs/common";
import { GradeService } from "../services/grade.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";


@ApiTags('Shared - Grades')
@Injectable()
@Controller('grades')
export class GradesController {
    constructor(private readonly gradeService: GradeService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách khối lớp' })
    async findAll() {
        return this.gradeService.findAll();
    }
}