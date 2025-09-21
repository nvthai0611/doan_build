import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CenterUsersService } from './center-users.service';
import { CreateCenterUserDto } from './dto/create-center-user.dto';
import { UpdateCenterUserDto } from './dto/update-center-user.dto';

@Controller('center-users')
export class CenterUsersController {
  constructor(private readonly centerUsersService: CenterUsersService) {}

  @Post()
  create(@Body() createCenterUserDto: CreateCenterUserDto) {
    return this.centerUsersService.create(createCenterUserDto);
  }

  @Get()
  findAll() {
    return this.centerUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centerUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCenterUserDto: UpdateCenterUserDto) {
    return this.centerUsersService.update(+id, updateCenterUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centerUsersService.remove(+id);
  }
}
