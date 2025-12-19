import { PrismaService } from '../../../db/prisma.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class MiddlewareAdminit implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  
  async use(req: any, res: Response, next: NextFunction) {
    try {
      // Bước 1: Lấy và verify JWT token
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'Token không được cung cấp. Vui lòng đăng nhập.' 
        });
      }

      const payload = JWT.verifyAccessToken(token);
      
      if (!payload || typeof payload === 'string') {
        return res.status(401).json({ 
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn.' 
        });
      }

      // Bước 2: Kiểm tra role truy cập
      // Cho phép:
      //  - admin: toàn bộ /adminit/*

      if (payload.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Bạn không có quyền truy cập. Chỉ quản trị viên IT mới được phép.' 
        });
      } 

      // Bước 3: Thêm user info vào request
      req.user = {
        ...payload,
        isAdmin: payload.role === 'admin',
      };
      
      next();
    } catch (error) {
      console.error('Adminit middleware error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Xác thực thất bại. Vui lòng đăng nhập lại.' 
      });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}


