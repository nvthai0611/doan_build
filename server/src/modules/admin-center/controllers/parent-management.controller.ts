import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpStatus, HttpCode, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParentManagementService } from '../services/parent-management.service';

@ApiTags('Admin - Parent Management')
@Controller('parent-management')
@ApiBearerAuth()
export class ParentManagementController {
    constructor(
        private readonly parentManagementService: ParentManagementService
    ) {}

    // ...existing code...
    /**
     * Tạo mới phụ huynh kèm học sinh
     */
    @Post('with-students')
    @HttpCode(HttpStatus.CREATED)
    async createParentWithStudents(
        @Body() body: {
            username: string;
            password: string;
            email: string;
            fullName: string;
            phone?: string;
            relationshipType: 'FATHER' | 'MOTHER' | 'OTHER';
            students?: Array<{
                fullName: string;
                gender: 'MALE' | 'FEMALE' | 'OTHER';
                birthDate: string;
                schoolId: string;
            }>;
        }
    ) {
        // Validate parent fields
        if (!body.username || body.username.trim().length < 3 || body.username.trim().length > 20) {
            throw new HttpException('Username phụ huynh phải từ 3-20 ký tự', HttpStatus.BAD_REQUEST);
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(body.username)) {
            throw new HttpException('Username phụ huynh chỉ được chứa chữ, số và dấu gạch dưới', HttpStatus.BAD_REQUEST);
        }

        if (!body.password || body.password.length < 6) {
            throw new HttpException('Mật khẩu phải có ít nhất 6 ký tự', HttpStatus.BAD_REQUEST);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!body.email || !emailRegex.test(body.email)) {
            throw new HttpException('Email phụ huynh không hợp lệ', HttpStatus.BAD_REQUEST);
        }

        if (!body.fullName || body.fullName.trim().length === 0) {
            throw new HttpException('Họ và tên phụ huynh không được để trống', HttpStatus.BAD_REQUEST);
        }

        if (body.phone) {
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(body.phone)) {
                throw new HttpException('Số điện thoại phụ huynh phải có 10-11 chữ số', HttpStatus.BAD_REQUEST);
            }
        }

        // relationshipType is required and must be valid
        const validRelationshipTypes = ['FATHER', 'MOTHER', 'OTHER'];
        if (!body.relationshipType || !validRelationshipTypes.includes(body.relationshipType)) {
            throw new HttpException(
                'Mối quan hệ không hợp lệ. Chỉ chấp nhận: FATHER, MOTHER, OTHER',
                HttpStatus.BAD_REQUEST
            );
        }

        // Validate students (minimal fields)
        if (body.students && body.students.length > 0) {
            const validGenders = ['MALE', 'FEMALE', 'OTHER'];
            for (let i = 0; i < body.students.length; i++) {
                const student = body.students[i];

                if (!student.fullName || student.fullName.trim().length === 0) {
                    throw new HttpException(`Họ và tên học sinh ${i + 1} không được để trống`, HttpStatus.BAD_REQUEST);
                }

                if (!student.gender || !validGenders.includes(student.gender)) {
                    throw new HttpException(
                        `Giới tính học sinh ${i + 1} không hợp lệ. Chỉ chấp nhận: MALE, FEMALE, OTHER`,
                        HttpStatus.BAD_REQUEST
                    );
                }

                if (!student.birthDate) {
                    throw new HttpException(`Ngày sinh học sinh ${i + 1} không được để trống`, HttpStatus.BAD_REQUEST);
                }
                // Optional: validate date string
                if (isNaN(Date.parse(student.birthDate))) {
                    throw new HttpException(`Ngày sinh học sinh ${i + 1} không hợp lệ`, HttpStatus.BAD_REQUEST);
                }

                if (!student.schoolId) {
                    throw new HttpException(
                        `Trường học cho học sinh ${i + 1} không được để trống`,
                        HttpStatus.BAD_REQUEST
                    );
                }
            }
        }

        // Call service - No need try/catch, NestJS handles HttpException
        const result = await this.parentManagementService.createParentWithStudents({
            username: body.username.trim(),
            password: body.password,
            email: body.email.trim(),
            fullName: body.fullName.trim(),
            phone: body.phone?.trim(),
            relationshipType: body.relationshipType,
            students: body.students?.map(s => ({
                fullName: s.fullName.trim(),
                gender: s.gender as any,
                birthDate: s.birthDate,
                schoolId: s.schoolId
            }))
        });

        return {
            success: true,
            status: HttpStatus.CREATED,
            message: result.message,
            data: result.data,
            meta: {}
        };
    }

    /**
     * Tạo mới phụ huynh
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
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
        // Validation...

        const result = await this.parentManagementService.createParent({
            username: body.username.trim(),
            password: body.password,
            email: body.email.trim(),
            fullName: body.fullName.trim(),
            phone: body.phone?.trim(),
            gender: body.gender as any,
            birthDate: body.birthDate
        });

        return {
            success: true,
            status: HttpStatus.CREATED,
            message: result.message,
            data: result.data,
            meta: {}
        };
    }

    /**
     * Thêm học sinh mới cho phụ huynh
     */
    @Post(':id/add-student')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Thêm học sinh mới cho phụ huynh' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thêm học sinh thành công' })
    async addStudentToParent(
      @Param('id') parentId: string,
      @Body() body: {
        fullName: string;
        gender: 'MALE' | 'FEMALE' | 'OTHER';
        birthDate: string;
        schoolId: string;
        password?: string;
      }
    ) {
      // Minimal validations to align with service
      if (!body.fullName || !body.fullName.trim()) {
        throw new HttpException('Họ và tên học sinh không được để trống', HttpStatus.BAD_REQUEST);
      }

      const validGenders = ['MALE', 'FEMALE', 'OTHER'];
      if (!body.gender || !validGenders.includes(body.gender)) {
        throw new HttpException('Giới tính không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      if (!body.birthDate || isNaN(Date.parse(body.birthDate))) {
        throw new HttpException('Ngày sinh không hợp lệ', HttpStatus.BAD_REQUEST);
      }

      if (!body.schoolId) {
        throw new HttpException('Trường học không được để trống', HttpStatus.BAD_REQUEST);
      }

      const result = await this.parentManagementService.addStudentToParent(parentId, {
        fullName: body.fullName.trim(),
        gender: body.gender as any,
        birthDate: body.birthDate,
        schoolId: body.schoolId,
        password: body.password
      });

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: result.message,
        data: result.data,
        meta: {}
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
    
    @Get('payment-details')
    async getDetailPaymentOfParent(@Query('paymentId') paymentId: string, @Query('parentId') parentId: string) {
        return await this.parentManagementService.getPaymentDetails(paymentId, parentId)
    }

    /**
     * Tạo hóa đơn (payment) cho phụ huynh từ danh sách feeRecordIds
     */
    @Post(':id/create-bill')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo hóa đơn (payment) cho phụ huynh từ danh sách feeRecordIds' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo hóa đơn thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Phụ huynh hoặc fee record không tồn tại' })
    async createBillForParent(
        @Param('id') parentId: string,
        @Body() body: {
            feeRecordIds: string[],
            expirationDate?: string,
            notes?: string,
            reference?: string,
            method?: 'bank_transfer' | 'cash',
            payNow?: boolean
        }
    ) {
        const { feeRecordIds, expirationDate, notes, reference, method, payNow } = body || {};

        if (!feeRecordIds || !Array.isArray(feeRecordIds) || feeRecordIds.length === 0) {
            throw new HttpException('feeRecordIds là bắt buộc và phải là mảng có ít nhất 1 phần tử', HttpStatus.BAD_REQUEST);
        }

        try {
            const result = await this.parentManagementService.createBillForParent(parentId, feeRecordIds, {
                expirationDate,
                notes,
                reference,
                method,
                payNow
            });

            // result already in { data, message } shape in service
            return {
                statusCode: HttpStatus.CREATED,
                message: result?.message ?? 'Tạo hóa đơn thành công',
                data: result?.data ?? null
            };
        } catch (error: any) {
            // rethrow HttpException to let Nest handle it, otherwise wrap generic error
            if (error instanceof HttpException) throw error;
            throw new HttpException(`Lỗi khi tạo hóa đơn: ${error?.message || error}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
@Patch(':id/update-payment-status')
@ApiOperation({ summary: 'Cập nhật trạng thái thanh toán' })
@ApiQuery({ name: 'status', required: true, type: String, description: 'Trạng thái thanh toán (pending, completed, partially_paid, cancelled)' })
@ApiResponse({ status: HttpStatus.OK, description: 'Cập nhật trạng thái thành công' })
@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Trạng thái không hợp lệ' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy thanh toán' })
async updatePaymentStatus(
  @Param('id') paymentId: string,
  @Body() body: { status: string; notes?: string }
) {
    const {status, notes} = body
  if (!status || status.trim().length === 0) {
    throw new HttpException(
      'Trạng thái thanh toán không được để trống',
      HttpStatus.BAD_REQUEST
    );
  }

  const validStatuses = ['pending', 'completed', 'partially_paid', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new HttpException(
      'Trạng thái thanh toán không hợp lệ. Chỉ chấp nhận: pending, completed, partially_paid, cancelled',
      HttpStatus.BAD_REQUEST
    );
  }

  try {
    const result = await this.parentManagementService.updateStatusPayment(
      paymentId,
      status,
      notes
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data
    };
  } catch (error: any) {
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      `Lỗi khi cập nhật trạng thái thanh toán: ${error?.message || error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
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
@ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email hoặc số điện thoại đã được sử dụng' })
@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy phụ huynh' })
async updateParent(
  @Param('id') id: string,
  @Body() body: {
    fullName?: string
    email?: string
    phone?: string
    relationshipType?: 'FATHER' | 'MOTHER' | 'OTHER'
  }
) {
  // Validate fullName if provided
  if (body.fullName !== undefined) {
    if (body.fullName.trim().length === 0) {
      throw new HttpException(
        'Họ và tên không được để trống',
        HttpStatus.BAD_REQUEST
      )
    }
    if (body.fullName.trim().length < 2) {
      throw new HttpException(
        'Họ và tên phải có ít nhất 2 ký tự',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  // Validate email if provided
  if (body.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw new HttpException(
        'Email không hợp lệ',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  // Validate phone if provided
  if (body.phone !== undefined) {
    if (body.phone.trim().length > 0) {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(body.phone)) {
        throw new HttpException(
          'Số điện thoại phải có 10-11 chữ số',
          HttpStatus.BAD_REQUEST
        )
      }
    }
  }

  // Validate relationshipType if provided
  if (body.relationshipType !== undefined) {
    const validRelationshipTypes = ['FATHER', 'MOTHER', 'OTHER']
    if (!validRelationshipTypes.includes(body.relationshipType)) {
      throw new HttpException(
        'Mối quan hệ không hợp lệ. Chỉ chấp nhận: FATHER, MOTHER, OTHER',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  const result = await this.parentManagementService.updateParent(id, {
    fullName: body.fullName?.trim(),
    email: body.email?.trim(),
    phone: body.phone?.trim(),
    relationshipType: body.relationshipType
  })

  return {
    success: true,
    status: HttpStatus.OK,
    message: result.message,
    data: result.data,
    meta: {}
  }
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


