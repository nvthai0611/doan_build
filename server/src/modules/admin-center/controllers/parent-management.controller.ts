import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ParentManagementService } from '../services/parent-management.service';

@ApiTags('Admin - Parent Management')
@Controller('parent-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParentManagementController {
    constructor(
        private readonly parentManagementService: ParentManagementService
    ) {}

    /**
     * Tạo mới phụ huynh
     */
    @Post()
    @ApiOperation({ summary: 'Tạo mới phụ huynh' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo phụ huynh thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Username hoặc email đã tồn tại' })
    async createParent(
        @Body() body: {
            username: string;
            password: string;
            email: string;
            fullName: string;
            phone?: string;
            gender?: string;
            birthDate?: string;
        }
    ) {
        // Validate username
        if (!body.username || body.username.trim().length < 3 || body.username.trim().length > 20) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Username phải từ 3-20 ký tự',
                data: null
            };
        }

        // Validate password
        if (!body.password || body.password.length < 6) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
                data: null
            };
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!body.email || !emailRegex.test(body.email)) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Email không hợp lệ',
                data: null
            };
        }

        // Validate fullName
        if (!body.fullName || body.fullName.trim().length === 0) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Họ và tên không được để trống',
                data: null
            };
        }

        // Validate phone if provided
        if (body.phone) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(body.phone)) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Số điện thoại phải có 10-11 chữ số',
                    data: null
                };
            }
        }

        const result = await this.parentManagementService.createParent({
            username: body.username,
            password: body.password,
            email: body.email,
            fullName: body.fullName,
            phone: body.phone,
            gender: body.gender as 'MALE' | 'FEMALE' | 'OTHER',
            birthDate: body.birthDate
        });

        return {
            statusCode: HttpStatus.CREATED,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Lấy danh sách phụ huynh với query
     */
    @Get()
    @ApiOperation({ summary: 'Lấy danh sách phụ huynh' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo tên, email, phone' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Lọc theo trạng thái' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lấy danh sách thành công' })
    async getAllParents(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('isActive') isActive?: string
    ) {
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10;
        const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

        const result = await this.parentManagementService.getAllParents(
            search,
            undefined, // gender
            isActiveBoolean !== undefined ? (isActiveBoolean ? 'active' : 'inactive') : undefined,
            pageNumber,
            limitNumber
        );

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data,
            meta: result.meta
        };
    }

    /**
     * Lấy chi tiết phụ huynh theo ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Lấy chi tiết phụ huynh theo ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Lấy thông tin thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' })
    async getParentById(@Param('id') id: string) {
        const result = await this.parentManagementService.getParentById(id);

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Đếm số lượng phụ huynh theo trạng thái
     */
    @Get('count-status')
    @ApiOperation({ summary: 'Đếm số lượng phụ huynh theo trạng thái' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Đếm thành công' })
    async getCountByStatus() {
        const result = await this.parentManagementService.getCountByStatus();

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Toggle trạng thái active của phụ huynh
     */
    @Patch(':id/toggle-status')
    @ApiOperation({ summary: 'Thay đổi trạng thái active của phụ huynh' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Cập nhật trạng thái thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' })
    async toggleParentStatus(@Param('id') id: string) {
        const result = await this.parentManagementService.toggleParentStatus(id);

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Cập nhật thông tin phụ huynh
     */
    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin phụ huynh' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Cập nhật thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' })
    async updateParent(
        @Param('id') id: string,
        @Body() body: {
            email?: string;
            fullName?: string;
            phone?: string;
            gender?: string;
            birthDate?: string;
        }
    ) {
        // Validate email if provided
        if (body.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Email không hợp lệ',
                    data: null
                };
            }
        }

        // Validate fullName if provided
        if (body.fullName !== undefined && body.fullName.trim().length === 0) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Họ và tên không được để trống',
                data: null
            };
        }

        // Validate phone if provided
        if (body.phone) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(body.phone)) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Số điện thoại phải có 10-11 chữ số',
                    data: null
                };
            }
        }

        const result = await this.parentManagementService.updateParent(
            id,
            {
                fullName: body.fullName,
                phone: body.phone,
                gender: body.gender as 'MALE' | 'FEMALE' | 'OTHER',
                birthDate: body.birthDate
            }
        );

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Tìm kiếm học sinh theo mã học sinh
     */
    @Get('search-student')
    @ApiOperation({ summary: 'Tìm kiếm học sinh theo mã để liên kết với phụ huynh' })
    @ApiQuery({ name: 'studentCode', required: true, type: String, description: 'Mã học sinh' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Tìm thấy học sinh' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy học sinh' })
    async findStudentByCode(@Query('studentCode') studentCode: string) {
        if (!studentCode || studentCode.trim().length === 0) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Mã học sinh không được để trống',
                data: null
            };
        }

        const result = await this.parentManagementService.findStudentByCode(studentCode);

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Liên kết học sinh với phụ huynh
     */
    @Post(':id/students')
    @ApiOperation({ summary: 'Liên kết học sinh với phụ huynh' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Liên kết thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh hoặc học sinh' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Học sinh đã có phụ huynh' })
    async linkStudentToParent(
        @Param('id') parentId: string,
        @Body() body: { studentId: string }
    ) {
        if (!body.studentId || body.studentId.trim().length === 0) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'studentId không được để trống',
                data: null
            };
        }

        const result = await this.parentManagementService.linkStudentToParent(
            parentId,
            body.studentId
        );

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }

    /**
     * Hủy liên kết học sinh khỏi phụ huynh
     */
    @Delete(':id/students/:studentId')
    @ApiOperation({ summary: 'Hủy liên kết học sinh khỏi phụ huynh' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Hủy liên kết thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh hoặc học sinh' })
    @HttpCode(HttpStatus.OK)
    async unlinkStudentFromParent(
        @Param('id') parentId: string,
        @Param('studentId') studentId: string
    ) {
        const result = await this.parentManagementService.unlinkStudentFromParent(
            parentId,
            studentId
        );

        if (!result.data) {
            return {
                statusCode: HttpStatus.NOT_FOUND,
                message: result.message,
                data: null
            };
        }

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: result.data
        };
    }
}