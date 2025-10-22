import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import Hash from 'src/utils/hasing.util';
import JWT from 'src/utils/jwt.util';
import { PermissionService } from './permission.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionService: PermissionService
  ) {}

  async getUserByField(field: string = 'id', value: string) {
    console.log(field, value);
    
    return this.prisma.user.findFirst({
      where: {
        [field]: value,
      },
      include: {
        teacher: true,
        student: true,
        parent: true,
        roleData: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      },
    });
  }

  async validateUser(email: string, password: string) {
  console.log(email);
      
    const user = await this.getUserByField('email', email);
    console.log(user);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await Hash.verify(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    
    // Tạo access token
    const accessToken = JWT.createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Tạo refresh token với userId
    const refreshToken = JWT.createRefreshToken(user.id);
    
    // Lưu refresh token vào database
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        student: user.student,
        parent: user.parent,
      },
    };
  }

  /**
   * Refresh Token với ROTATION
   * Luồng:
   * 1. Verify refresh token có hợp lệ không
   * 2. Tạo access token MỚI
   * 3. Tạo refresh token MỚI (Rotation)
   * 4. Invalidate refresh token CŨ
   * 5. Lưu refresh token MỚI vào database
   * 6. Trả về cả 2 tokens MỚI
   */
  async refreshToken(refreshToken: string) {
    // Tìm session với refresh token
    const session = await this.prisma.userSession.findFirst({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            student: true,
            parent: true,
          },
        },
      },
    });

    if (!session) {
      // Kiểm tra xem có phải token đã được sử dụng không (Reuse Detection)
      const reusedSession = await this.prisma.userSession.findFirst({
        where: {
          refreshToken,
          isActive: false,
        },
      });

      if (reusedSession) {
        // 🚨 CẢNH BÁO: Refresh token reuse detected!
        // Invalidate tất cả sessions của user
        await this.prisma.userSession.updateMany({
          where: {
            userId: reusedSession.userId,
          },
          data: {
            isActive: false,
          },
        });

        throw new UnauthorizedException(
          'Phát hiện sử dụng lại refresh token. Tất cả phiên đăng nhập đã bị vô hiệu hóa vì lý do bảo mật.'
        );
      }

      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = session.user;

    // Tạo access token mới
    const newAccessToken = JWT.createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Tạo refresh token mới (ROTATION)
    const newRefreshToken = JWT.createRefreshToken(user.id);

    // Invalidate refresh token cũ
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
      },
    });

    // Tạo session mới với refresh token mới
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Trả về CẢ 2 tokens mới
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // ✅ QUAN TRỌNG!
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        student: user.student,
        parent: user.parent,
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Hủy session cụ thể
      await this.prisma.userSession.updateMany({
        where: {
          userId,
          refreshToken,
        },
        data: {
          isActive: false,
        },
      });
    } else {
      // Hủy tất cả session của user
      await this.prisma.userSession.updateMany({
        where: {
          userId,
        },
        data: {
          isActive: false,
        },
      });
    }

    return { success: true, message: 'Đăng xuất thành công' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.getUserByField('id', userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isOldPasswordValid = await Hash.verify(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const hashedNewPassword = await Hash.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true, message: 'Đổi mật khẩu thành công' };
  }

  async getProfile(userId: string) {
    const user = await this.getUserByField('id', userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Get user permissions
    const permissions = await this.permissionService.getUserPermissions(userId);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // teacher: user.teacher,
      student: user.student,
      parent: user.parent,
      permissions: permissions.map(p => p.name), // Return permission names for frontend
      roleData: user.roleData
    };
  }

  async updateProfile(userId: string, updateData: any) {
    const user = await this.getUserByField('id', userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: updateData.fullName,
        phone: updateData.phone,
      },
      include: {
        // teacher: true,
        student: true,
        parent: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      phone: updatedUser.phone,
      isActive: updatedUser.isActive,
      // teacher: updatedUser.teacher,
      student: updatedUser.student,
      parent: updatedUser.parent,
    };
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        isActive: false,
      },
    });

    return { success: true, message: 'Hủy session thành công' };
  }
}
