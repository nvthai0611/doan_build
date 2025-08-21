import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Main')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // return this.appService.getHello();
    console.log(process.env.PORT);

    return `<h1>Học nestjs check phát 3</h1>`;
  }
  @Get('gioi-thieu')
  getAbout(): string {
    return `<h1>Gioi thiệu</h1>`;
  }
}
