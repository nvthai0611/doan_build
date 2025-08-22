import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

// demo interface
interface User {
  id: number;
  name: string;
}

@ApiTags('Main')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Get()
  getUsers() {
    // bắt buộc phải ép interface
    const users: User[] = [{ id: 1, name: 'Hải' }];
    return {
      data: users,
      message: 'Thành công',
    };
  }
  @Get('gioi-thieu')
  getAbout(): string {
    return `<h1>Gioi thiệu</h1>`;
  }
}
