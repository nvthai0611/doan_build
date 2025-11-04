import { PrismaService } from '../../../db/prisma.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class MiddlewareTeacher implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  
  async use(req: any, res: Response, next: NextFunction) {
    try {
      // Bước 1: Lấy và verify JWT token (thay thế JwtAuthGuard)
      const token = this.extractTokenFromHeader(req);
      
      if (!token) {
        return res.status(401).json({ message: 'Token không được cung cấp' });
      }

      const payload = JWT.verifyAccessToken(token);
      
      if (!payload || typeof payload === 'string') {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }

      // Bước 2: Tìm teacher và thêm teacherId vào payload
      if (payload.userId) {
        
        const findTeacher = await this.prismaService.teacher.findUnique({
          where: { userId: payload.userId },
        });
        
        
        if (findTeacher) {
          req.user = {
            ...payload,
            teacherId: findTeacher.id, // Thêm teacherId vào payload
          };
        } else {
          req.user = payload; // Nếu không tìm thấy teacher, vẫn gán payload gốc
        }
      }
      
      next();
    } catch (error) {
      console.error('Teacher middleware error:', error);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
