import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RoomsManagementService } from '../services/rooms-management.service';
import { CreateRoomDto } from '../dto/room/create-room.dto';
import { UpdateRoomDto } from '../dto/room/update-room.dto';

@ApiTags('Admin Center - Rooms Management')
@Controller('rooms')
export class RoomsManagementController {
  constructor(private readonly roomsManagementService: RoomsManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phòng học' })
  @ApiResponse({ status: 200, description: 'Danh sách phòng học' })
  async findAll() {
    const rooms = await this.roomsManagementService.findAll();
    return {
      success: true,
      message: 'Lấy danh sách phòng học thành công',
      data: rooms,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một phòng học theo ID' })
  @ApiParam({ name: 'id', description: 'ID của phòng học' })
  @ApiResponse({ status: 200, description: 'Thông tin phòng học' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng học' })
  async findOne(@Param('id') id: string) {
    const room = await this.roomsManagementService.findOne(id);
    return {
      success: true,
      message: 'Lấy thông tin phòng học thành công',
      data: room,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo phòng học mới' })
  @ApiResponse({ status: 201, description: 'Tạo phòng học thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.roomsManagementService.create(createRoomDto);
    return {
      success: true,
      message: 'Tạo phòng học thành công',
      data: room,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin phòng học' })
  @ApiParam({ name: 'id', description: 'ID của phòng học' })
  @ApiResponse({ status: 200, description: 'Cập nhật phòng học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng học' })
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    const room = await this.roomsManagementService.update(id, updateRoomDto);
    return {
      success: true,
      message: 'Cập nhật phòng học thành công',
      data: room,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa phòng học' })
  @ApiParam({ name: 'id', description: 'ID của phòng học' })
  @ApiResponse({ status: 200, description: 'Xóa phòng học thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng học' })
  @ApiResponse({ status: 400, description: 'Phòng học đang được sử dụng' })
  async remove(@Param('id') id: string) {
    await this.roomsManagementService.remove(id);
    return {
      success: true,
      message: 'Xóa phòng học thành công',
    };
  }
}

