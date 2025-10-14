import { PrismaService } from '../../../db/prisma.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class MiddlewareStudent implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  
  async use(req: any, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        return res.status(401).json({ message: 'Token không được cung cấp' });
      }

      const payload = JWT.verifyAccessToken(token);
      if (!payload || typeof payload === 'string') {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }

      if (payload.userId) {
        const findStudent = await this.prismaService.student.findUnique({
          where: { userId: payload.userId },
        });

        if (findStudent) {
          req.user = {
            ...payload,
            studentId: findStudent.id,
          };
        } else {
          req.user = payload;
        }
      }
      
      next();
    } catch (error) {
      console.error('Student middleware error:', error);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

