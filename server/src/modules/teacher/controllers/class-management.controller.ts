import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { ClassManagementService } from '../services/class-management.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassesListResponseDto } from '../dto/classes/response-class.dto';
import { checkId } from 'src/utils/validate.util';

@ApiTags('Classes')
@Controller('class-management')
export class ClassManagementController {
    constructor(private readonly classManagementService: ClassManagementService) {}

    @Get('teacher/:teacherId')
    @ApiOperation({ summary: 'Lấy danh sách lớp học theo ID giáo viên' })
    @ApiParam({ name: 'teacherId', description: 'ID của giáo viên (UUID)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy danh sách lớp học thành công',
        type: ClassesListResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'ID giáo viên không hợp lệ' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy lớp học' 
    })
    @ApiResponse({ 
        status: 500, 
        description: 'Lỗi server' 
    })
    async getClassByTeacherId(@Param('teacherId') teacherId: string, @Query('status') status: string) {
        // check id cua teacher
        if (!checkId(teacherId)) {
            throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        // goi den service cua teacher
        const classes = await this.classManagementService.getClassByTeacherId(teacherId, status);
    return {
        success: true,
        status: HttpStatus.OK,
        data: classes,
        message: 'Lấy danh sách lớp học thành công',
        meta: null,
    };
    }

    @ApiOperation({ summary: 'Lấy số lượng lớp học theo trạng thái' })
    @ApiParam({ name: 'teacherId', description: 'ID của giáo viên (UUID)' })
    @Get('teacher/:teacherId/count-by-status')
    async getCountByStatus(teacherId: string){
        const countByStatus = await this.classManagementService.getCountByStatus(teacherId);
        return {
            success: true,
            status: HttpStatus.OK,
            data: countByStatus,
            message: 'Lấy số lượng lớp học theo trạng thái thành công',
            meta: null,
        };
    }

}
