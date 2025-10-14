import { Controller, Get, Injectable, Param } from "@nestjs/common";
import { StudentSharedService } from "../services/student.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('Shared - Students')
@Controller('shared/students')
@Injectable()
export class StudentsSharedController {
    constructor(private readonly studentSharedService: StudentSharedService) {}

    @ApiOperation({summary: "Lấy chi tiết học sinh theo ID theo từng role khác nhau"})
    @Get(':id')
    async getStudentDetail(@Param('id') id: string) {
        const user = { role: 'center_owner' }; // Mock user object for shared access
        return this.studentSharedService.getStudentDetail(id, user);
    }
}