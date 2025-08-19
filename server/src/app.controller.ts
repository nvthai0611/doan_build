import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // return this.appService.getHello();
    return `<h1>Học nestjs</h1>`;
  }
  @Get('gioi-thieu')
  getAbout(): string {
    return `<h1>Gioi thiệu</h1>`;
  }
}
