import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { ClassManagementService } from '../services/class-management.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ClassesListResponseDto, CountByStatusResponseDto } from '../dto/classes/response-class.dto';
import { ClassQueryDto } from '../dto/classes/query-class.dto';
import { ClassDetailsQueryDto } from '../dto/classes/class-details-query.dto';
import { checkId } from 'src/utils/validate.util';

@ApiTags('Classes')
@Controller('class-management')
export class ClassManagementController {
    constructor(private readonly classManagementService: ClassManagementService) {}

    // Đặt route cụ thể TRƯỚC route có param
    @Get('class/details')
    @ApiOperation({summary: 'Lấy chi tiết lớp học theo ID lớp và ID giáo viên'})
    @ApiQuery({ name: 'classId', required: true, description: 'ID của lớp học (UUID)' })
    async getClassDetails(
        @Query() query: any
    ){
        if (!query.classId) {
            throw new HttpException('Class ID is required', HttpStatus.BAD_REQUEST);
        }
        const teacherId = "601a2029-dc56-4c2a-bc8d-440526cad471";
        const classDetail = await this.classManagementService.getClassDetail(teacherId, query.classId)
        return {
            success: true,
            status: HttpStatus.OK,
            data: classDetail,
            message: 'Lấy chi tiết lớp học thành công',
            meta: null,
        }
    }

    // Route có param đặt sau
    @Get('teacher/:teacherId')
    @ApiOperation({ 
        summary: 'Lấy danh sách lớp học theo ID giáo viên với filter và search',
        description: 'API hỗ trợ phân trang, tìm kiếm và lọc theo trạng thái, ngày, ca học'
    })
    @ApiParam({ name: 'teacherId', description: 'ID của giáo viên (UUID)' })
    @ApiQuery({ name: 'status', required: false, description: 'Trạng thái lớp học', enum: ['all', 'active', 'completed', 'draft', 'cancelled'] })
    @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm (tên lớp, mã lớp)' })
    @ApiQuery({ name: 'day', required: false, description: 'Ngày trong tuần', enum: ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] })
    @ApiQuery({ name: 'session', required: false, description: 'Ca học', enum: ['all', 'morning', 'afternoon', 'evening'] })
    @ApiQuery({ name: 'page', required: false, description: 'Số trang', type: Number })
    @ApiQuery({ name: 'limit', required: false, description: 'Số lượng items per page', type: Number })
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
    async getClassByTeacherId(
        @Param('teacherId') teacherId: string, 
        @Query() queryParams: ClassQueryDto
    ) {

        // check id cua teacher
        if (!checkId(teacherId)) {
            throw new HttpException('ID giáo viên không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        // Validate và convert page, limit
        const pageNum = parseInt(queryParams.page) || 1;
        const limitNum = parseInt(queryParams.limit) || 10;

        // Giới hạn limit tối đa để tránh tải quá nhiều dữ liệu
        const maxLimit = 100;
        const validLimit = limitNum > maxLimit ? maxLimit : limitNum;
        const validPage = pageNum < 1 ? 1 : pageNum;

        // goi den service cua teacher
        const result = await this.classManagementService.getClassByTeacherId(
            teacherId, 
            queryParams.status, 
            validPage, 
            validLimit,
            queryParams.search,
        );
        
        return {
            success: true,
            status: HttpStatus.OK,
            data: result.data,
            message: 'Lấy danh sách lớp học thành công',
            meta: {
                pagination: result.pagination,
                filters: result.filters
            },
        };
    }

    @ApiOperation({ summary: 'Lấy số lượng lớp học theo trạng thái' })
    @ApiParam({ name: 'teacherId', description: 'ID của giáo viên (UUID)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Lấy số lượng lớp học theo trạng thái thành công',
        type: CountByStatusResponseDto
    })
    @Get('teacher/:teacherId/count-by-status')
    async getCountByStatus(@Param('teacherId') teacherId: string){
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
