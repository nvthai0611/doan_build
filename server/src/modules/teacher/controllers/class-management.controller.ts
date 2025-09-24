import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ClassManagementService } from '../services/class-management.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassesListResponseDto } from '../dto/classes/response-class.dto';

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
    async getClassByTeacherId(@Param('teacherId') teacherId: string): Promise<ClassesListResponseDto> {
        try {
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(teacherId)) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'ID giáo viên không hợp lệ'
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            const classes = await this.classManagementService.getClassByTeacherId(teacherId);
            
            if (!classes || classes.length === 0) {
                throw new HttpException(
                    {
                        success: false,
                        message: 'Không tìm thấy lớp học nào'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                message: 'Lấy danh sách lớp học thành công',
                data: classes
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            
            throw new HttpException(
                {
                    success: false,
                    message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}
