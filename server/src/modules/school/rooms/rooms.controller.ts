import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả phòng học' })
    async findAll() {
        return this.roomsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin 1 phòng học' })
    async findOne(@Param('id') id: string) {
        return this.roomsService.findOne(id);
    }
}
