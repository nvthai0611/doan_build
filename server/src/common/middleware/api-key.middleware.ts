import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Bỏ qua kiểm tra API key ở môi trường development
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'development') {
      return next();
    }

    // Lấy API key từ header
    const apiKey = req.headers['x-api-key'] as string;
    const validApiKey = this.configService.get<string>('API_KEY');

    // Kiểm tra API key
    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    next();
  }
}

