import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import JWT from 'src/utils/jwt.util';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    try {
      const payload = JWT.verifyAccessToken(token);
      
      if (!payload) {
        throw new UnauthorizedException('Token không hợp lệ');
      }
      
      // Gán thông tin user vào request
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
