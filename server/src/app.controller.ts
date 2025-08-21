import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from './utils/response.util';

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
  getUsers(@Res() res: Response) {
    // bắt buộc phải ép interface
    const users: User[] = [{ id: 1, name: 'Hải' }];
    return successResponse(
      res,
      users,
      { total: users.length },
      HttpStatus.OK,
      'Fetched users',
    );
  }
  @Get('gioi-thieu')
  getAbout(): string {
    return `<h1>Gioi thiệu</h1>`;
  }
}
