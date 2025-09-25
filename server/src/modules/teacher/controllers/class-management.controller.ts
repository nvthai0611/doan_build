import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
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
    async getClassByTeacherId(@Param('teacherId') teacherId: string) {
        try {
            // Validate UUID format
            if (!teacherId || typeof teacherId !== 'string') {
                throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
            }

            const classes = await this.classManagementService.getClassByTeacherId(teacherId);           
            
            return {
                success: true,
                status: HttpStatus.OK,
                data: classes,
                message: 'Lấy danh sách lớp học thành công',
                meta: null
            }
        } catch (error) {
            console.error('Error in getClassByTeacherId:', error);
            throw new HttpException(
                error.message || 'Lỗi server khi lấy danh sách lớp học',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
