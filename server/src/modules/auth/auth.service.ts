import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import Hash from 'src/utils/hasing.util';
import JWT from 'src/utils/jwt.util';
import { PermissionService } from './permission.service';
import { RegisterParentDto } from './dto/register-parent.dto';
import { AlertService } from '../admin-center/services/alert.service';
import { generateQNCode } from 'src/utils/function.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionService: PermissionService,
    private readonly alertService: AlertService
  ) {}

  async getUserByField(field: string = 'id', value: string) {
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

  async validateUser(identifier: string, password: string) {
    // Tìm user theo email hoặc username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
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
      }
    });

    if (!user) {
      throw new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await Hash.verify(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    return user;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    
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
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        birthDate: user.birthDate,
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
   * Đăng ký tài khoản phụ huynh
   */
  async registerParent(registerDto: RegisterParentDto) {
    // Tìm role parent và student role TRƯỚC transaction (không thay đổi)
    const parentRole = await this.prisma.role.findUnique({
      where: { name: 'parent' },
    });

    if (!parentRole) {
      throw new NotFoundException('Không tìm thấy vai trò phụ huynh trong hệ thống');
    }

    const studentRole = await this.prisma.role.findUnique({
      where: { name: 'student' },
    });

    if (!studentRole) {
      throw new NotFoundException('Không tìm thấy vai trò học sinh trong hệ thống');
    }

    // Hash password TRƯỚC transaction
    const hashedPassword = await Hash.hash(registerDto.password);

    // Tạo user và parent record trong một transaction
    // Validation được thực hiện TRONG transaction để tránh race condition
    let result;
    try {
      result = await this.prisma.$transaction(async (prisma) => {
      // Kiểm tra email đã tồn tại chưa (TRONG transaction)
      const existingEmail = await prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email đã được sử dụng');
      }

      // Kiểm tra username đã tồn tại chưa (TRONG transaction)
      const existingUsername = await prisma.user.findUnique({
        where: { username: registerDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Tên đăng nhập đã được sử dụng');
      }

      // Kiểm tra phone đã tồn tại chưa (TRONG transaction)
      if (registerDto.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: registerDto.phone },
        });

        if (existingPhone) {
          throw new ConflictException('Số điện thoại đã được sử dụng');
        }
      }
      // Tạo user (parent)
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
          fullName: registerDto.fullName,
          phone: registerDto.phone,
          birthDate: new Date(registerDto.birthDate),
          gender: registerDto.gender,
          role: 'parent',
          roleId: parentRole.id,
          isActive: true,
        },
      });

      // Tạo parent record
      const parent = await prisma.parent.create({
        data: {
          userId: user.id,
        },
      });

      // Tạo children (students)
      const createdChildren = [];
      for (const child of registerDto.children) {
        // Tạo username cho con (parent_username + child_index)
        const childUsername = `${registerDto.username}_${createdChildren.length + 1}`;
        
        // Hash password mặc định cho student (123456)
        const defaultStudentPassword = await Hash.hash('123456');

        // Tạo user cho student
        const childUser = await prisma.user.create({
          data: {
            email: `${childUsername}@student.qne.edu.vn`, // Auto-generate email
            username: childUsername,
            password: defaultStudentPassword,
            fullName: child.fullName,
            birthDate: new Date(child.dateOfBirth),
            gender: child.gender,
            role: 'student',
            roleId: studentRole.id,
            isActive: true,
          },
        });

        // Handle school creation/finding
        let schoolId = null;
        if (child.schoolName && child.schoolName.trim()) {
          const trimmedSchoolName = child.schoolName.trim();
          
          // Tìm school đã tồn tại theo name (case-insensitive)
          let school = await prisma.school.findFirst({
            where: {
              name: {
                equals: trimmedSchoolName,
                mode: 'insensitive' // Case insensitive
              }
            },
          });

          // Nếu không tìm thấy, tạo school mới
          if (!school) {
            school = await prisma.school.create({
              data: {
                name: trimmedSchoolName,
                address: child.schoolAddress?.trim() || null,
                phone: null,
              },
            });
          }
          schoolId = school.id;
        }

        if (!schoolId) {
          throw new BadRequestException(`Thiếu thông tin trường học cho con ${child.fullName}`);
        }

        // Generate student code (giống student-management.service.ts)
        let studentCode = generateQNCode('student');
        
        // Check code đã tồn tại chưa, regenerate nếu cần
        while (true) {
          const existingStudentWithCode = await prisma.student.findFirst({
            where: { studentCode: studentCode }
          });

          if (!existingStudentWithCode) {
            break;
          }
          studentCode = generateQNCode('student');
        }

        // Tạo student record và liên kết với parent
        const student = await prisma.student.create({
          data: {
            user: {
              connect: { id: childUser.id }
            },
            parent: {
              connect: { id: parent.id }
            },
            school: {
              connect: { id: schoolId }
            },
            studentCode: studentCode
          },
        });

        createdChildren.push({
          user: childUser,
          student,
        });
      }

      return { user, parent, children: createdChildren };
      });
    } catch (error: any) {
      // Handle Prisma unique constraint errors (fallback cho race condition)
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target?.[0];
        if (field === 'email') {
          throw new ConflictException('Email đã được sử dụng');
        } else if (field === 'username') {
          throw new ConflictException('Tên đăng nhập đã được sử dụng');
        } else {
          throw new ConflictException('Thông tin đã tồn tại trong hệ thống');
        }
      }
      // Re-throw nếu là HttpException đã được throw trong transaction
      if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Log và throw generic error
      console.error('Error in registerParent transaction:', error);
      throw new BadRequestException('Có lỗi xảy ra khi đăng ký tài khoản. Vui lòng thử lại.');
    }


    return {
      success: true,
      message: `Đăng ký tài khoản thành công! Đã tạo ${result.children.length} tài khoản cho con.`,
      data: {
        parent: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          fullName: result.user.fullName,
          phone: result.user.phone,
          birthDate: result.user.birthDate,
          gender: result.user.gender,
        },
        children: result.children.map(child => ({
          id: child.user.id,
          username: child.user.username,
          email: child.user.email,
          fullName: child.user.fullName,
          birthDate: child.user.birthDate,
          gender: child.user.gender,
        })),
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
        //CẢNH BÁO: Refresh token reuse detected!
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
