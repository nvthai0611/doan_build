import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { LoginDto } from './dto/loginDto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: any) {
    const userId = req.user.userId;
    const profile = await this.authService.getProfile(userId);
    return {
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: profile,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    const userId = req.user.userId;
    const result = await this.authService.logout(userId);
    return result;
  }

  @Post('refresh')
  async refresh(@Headers('refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token không được cung cấp');
    }

    const result = await this.authService.refreshToken(refreshToken);
    return {
      success: true,
      message: 'Làm mới token thành công',
      data: result,
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = changePasswordDto;
    const result = await this.authService.changePassword(userId, oldPassword, newPassword);
    return result;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const profile = await this.authService.updateProfile(userId, updateProfileDto);
    return {
      success: true,
      message: 'Cập nhật profile thành công',
      data: profile,
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Req() req: any) {
    const userId = req.user.userId;
    const sessions = await this.authService.getActiveSessions(userId);
    return {
      success: true,
      message: 'Lấy danh sách session thành công',
      data: sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const result = await this.authService.revokeSession(userId, sessionId);
    return result;
  }

  // Permission endpoints
  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  async getUserPermissions(@Req() req: any) {
    const userId = req.user.userId;
    const permissions = await this.permissionService.getUserPermissions(userId);
    return {
      success: true,
      message: 'Lấy danh sách quyền thành công',
      data: permissions,
    };
  }

  @Get('permissions/check/:permissionName')
  @UseGuards(JwtAuthGuard)
  async checkPermission(
    @Param('permissionName') permissionName: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const hasPermission = await this.permissionService.hasPermission(userId, permissionName);
    return {
      success: true,
      message: 'Kiểm tra quyền thành công',
      data: { hasPermission, permissionName },
    };
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  async getAllRoles() {
    const roles = await this.permissionService.getAllRoles();
    return {
      success: true,
      message: 'Lấy danh sách vai trò thành công',
      data: roles,
    };
  }

  @Get('all-permissions')
  @UseGuards(JwtAuthGuard)
  async getAllPermissions() {
    const permissions = await this.permissionService.getAllPermissions();
    return {
      success: true,
      message: 'Lấy danh sách tất cả quyền thành công',
      data: permissions,
    };
  }
}
