import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersListResponseDto, TeacherResponseDto } from './dto/teacher-response.dto';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giáo viên mới' })
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    try {
      return await this.teachersService.create(createTeacherDto);
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo giáo viên',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả giáo viên' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách giáo viên thành công',
    type: TeachersListResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Lỗi server' 
  })
  async findAll(): Promise<TeachersListResponseDto> {
    try {
      const result = await this.teachersService.findAll();
      
      if (!result.success) {
        throw new HttpException(
          {
            success: false,
            message: result.message,
            error: result.error
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return result as TeachersListResponseDto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết giáo viên theo ID' })
  @ApiParam({ name: 'id', description: 'ID của giáo viên (UUID)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy thông tin giáo viên thành công',
    type: TeacherResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID không hợp lệ' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy giáo viên' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Lỗi server' 
  })
  async findOne(@Param('id') id: string): Promise<TeacherResponseDto> {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID không hợp lệ'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.teachersService.findOne(id);
      
      if (!result.success) {
        const status = result.data === null ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
        throw new HttpException(
          {
            success: false,
            message: result.message,
            error: result.error
          },
          status
        );
      }

      return result as TeacherResponseDto;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin giáo viên',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin giáo viên' })
  @ApiParam({ name: 'id', description: 'ID của giáo viên (UUID)' })
  async update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID không hợp lệ'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.teachersService.update(id, updateTeacherDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật giáo viên',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giáo viên' })
  @ApiParam({ name: 'id', description: 'ID của giáo viên (UUID)' })
  async remove(@Param('id') id: string) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID không hợp lệ'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.teachersService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa giáo viên',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/contracts')
  @ApiOperation({ summary: 'Lấy danh sách hợp đồng của giáo viên' })
  @ApiParam({ name: 'id', description: 'ID của giáo viên (UUID)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách hợp đồng thành công'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy giáo viên' 
  })
  async getTeacherContracts(@Param('id') id: string) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID không hợp lệ'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.teachersService.getTeacherContracts(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách hợp đồng',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id/contracts/:contractId')
  @ApiOperation({ summary: 'Xóa hợp đồng của giáo viên' })
  @ApiParam({ name: 'id', description: 'ID của giáo viên (UUID)' })
  @ApiParam({ name: 'contractId', description: 'ID của hợp đồng (UUID)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Xóa hợp đồng thành công'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy hợp đồng' 
  })
  async deleteTeacherContract(
    @Param('id') teacherId: string,
    @Param('contractId') contractId: string
  ) {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(teacherId) || !uuidRegex.test(contractId)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID không hợp lệ'
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.teachersService.deleteTeacherContract(teacherId, contractId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa hợp đồng',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
