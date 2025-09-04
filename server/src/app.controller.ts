import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from './db/prisma.service';

// demo interface
interface User {
  id: number;
  name: string;
}

@ApiTags('Main')
@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  @Get()
  async getUsers() {
    // bắt buộc phải ép interface
    // const users: User[] = [{ id: 1, name: 'Hải' }];
    const data = await this.prismaService.user.findMany();
    return {
      data: data,
      message: 'Thành công rồi',
      status: HttpStatus.OK,
    };
  }

  @Get('gioi-thieu')
  getAbout(): string {
    return `<h1>Gioi thiệu</h1>`;
  }
}
