import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../db/prisma.service';
import { PermissionService } from './permission.service';
import { AlertService } from '../admin-center/services/alert.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UnauthorizedException } from '@nestjs/common';
import Hash from '../../utils/hasing.util';
import JWT from '../../utils/jwt.util';

// Mock dependencies
const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
  },
};

const mockPermissionService = {
  getUserPermissions: jest.fn(),
};

const mockAlertService = {};
const mockCloudinaryService = {};

// Mock Hash utility
jest.mock('../../utils/hasing.util', () => {
  return {
    default: {
      verify: jest.fn(),
      hash: jest.fn(),
    },
  };
});

// Mock JWT utility
jest.mock('../../utils/jwt.util', () => {
  return {
    default: {
      createAccessToken: jest.fn(),
      createRefreshToken: jest.fn(),
    },
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any; // Use any for easier mocking of deep properties

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: AlertService, useValue: mockAlertService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashed_password',
      isActive: true,
      role: 'student',
    };

    // Case 1: Valid Email
    it('should return user when email and password are valid', async () => {
      // Arrange
      const identifier = 'test@example.com';
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (Hash.verify as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(identifier, 'hashed_password');

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
        include: expect.anything(),
      });
      expect(Hash.verify).toHaveBeenCalledWith('hashed_password', mockUser.password);
    });

    // Case 2: Valid Username
    it('should return user when username and password are valid', async () => {
      // Arrange
      const identifier = 'testuser';
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (Hash.verify as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(identifier, 'hashed_password');

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
        include: expect.anything(),
      });
    });

    // Case 3: User Not Found
    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const identifier = 'nonexistent';
      prisma.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser(identifier, 'any_password')).rejects.toThrow(
        new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác'),
      );
    });

    // Case 4: Inactive User
    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const identifier = 'inactive@example.com';
      const inactiveUser = { ...mockUser, isActive: false };
      prisma.user.findFirst.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.validateUser(identifier, 'any_password')).rejects.toThrow(
        new UnauthorizedException('Tài khoản đã bị vô hiệu hóa'),
      );
    });

    // Case 5: Invalid Password
    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const identifier = 'test@example.com';
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (Hash.verify as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.validateUser(identifier, 'wrong_password')).rejects.toThrow(
        new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác'),
      );
      expect(Hash.verify).toHaveBeenCalledWith('wrong_password', mockUser.password);
    });
  });

  describe('login', () => {
    it('should return tokens and user info when login is successful', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'student',
        password: 'hashed',
        isActive: true,
      };
      const mockAccessToken = 'access_token';
      const mockRefreshToken = 'refresh_token';

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
      (JWT.createAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
      (JWT.createRefreshToken as jest.Mock).mockReturnValue(mockRefreshToken);
      
      // Mock prisma.userSession.create (checking deep mock support)
      prisma.userSession = { create: jest.fn() };
      prisma.userSession.create.mockResolvedValue({});

      // Act
      const result = await service.login('test@example.com', 'password');

      // Assert
      expect(result).toHaveProperty('accessToken', mockAccessToken);
      expect(result).toHaveProperty('refreshToken', mockRefreshToken);
      expect(result.user.email).toBe(mockUser.email);
      expect(prisma.userSession.create).toHaveBeenCalled();
    });
  });

  describe('registerParent', () => {
    it('should register parent and children successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'parent@example.com',
        username: 'parent',
        password: 'password',
        fullName: 'Parent Name',
        children: [
          {
            fullName: 'Child 1',
            dateOfBirth: new Date(),
            gender: 'Male',
            schoolName: 'School A'
          }
        ],
        relationshipType: 'father',
        phone: '0123456789',
      };

      prisma.role = { findUnique: jest.fn() };
      prisma.role.findUnique
        .mockResolvedValueOnce({ id: 1, name: 'parent' }) // parentRole
        .mockResolvedValueOnce({ id: 2, name: 'student' }); // studentRole

      (Hash.hash as jest.Mock).mockReturnValue('hashed_password');

      // Mock Transaction
      prisma.$transaction = jest.fn(async (callback) => {
        // Mock prisma client inside transaction
        const txPrisma = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null), // Check existing email/user
            findFirst: jest.fn().mockResolvedValue(null), // Check phone
            create: jest.fn().mockImplementation((args) => ({ 
                id: 'new_user_id', 
                ...args.data,
                email: args.data.email || 'generated@email.com' 
            })),
          },
          parent: {
            create: jest.fn().mockResolvedValue({ id: 'new_parent_id' }),
          },
          school: {
            findFirst: jest.fn().mockResolvedValue({ id: 'school_id' }),
            create: jest.fn(),
          },
          student: {
            findFirst: jest.fn().mockResolvedValue(null), // Check code
            create: jest.fn().mockResolvedValue({ id: 'new_student_id' }),
          },
        };
        return await callback(txPrisma);
      });

      // Act
      const result: any = await service.registerParent(registerDto as any);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.children).toHaveLength(1);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      // Arrange
      const mockSession = {
        id: 'session_id',
        user: { id: 'user_id', email: 'test@example.com', role: 'student' },
      };
      
      prisma.userSession = { 
        findFirst: jest.fn().mockResolvedValue(mockSession),
        update: jest.fn(),
        create: jest.fn(),
      };

      (JWT.createAccessToken as jest.Mock).mockReturnValue('new_access_token');
      (JWT.createRefreshToken as jest.Mock).mockReturnValue('new_refresh_token');

      // Act
      const result = await service.refreshToken('valid_refresh_token');

      // Assert
      expect(result).toHaveProperty('accessToken', 'new_access_token');
      expect(result).toHaveProperty('refreshToken', 'new_refresh_token');
      expect(prisma.userSession.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'session_id' }, data: { isActive: false } })
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      prisma.userSession = { 
        findFirst: jest.fn().mockResolvedValue(null) // Not found
      };

      // Act & Assert
      await expect(service.refreshToken('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should invalidate specific session when refreshToken is provided', async () => {
      // Arrange
      prisma.userSession = { updateMany: jest.fn() };

      // Act
      await service.logout('user_id', 'refresh_token');

      // Assert
      expect(prisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ 
          where: { userId: 'user_id', refreshToken: 'refresh_token' },
          data: { isActive: false }
        })
      );
    });

    it('should invalidate all sessions when no refreshToken is provided', async () => {
      // Arrange
      prisma.userSession = { updateMany: jest.fn() };

      // Act
      await service.logout('user_id');

      // Assert
      expect(prisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ 
          where: { userId: 'user_id' },
          data: { isActive: false }
        })
      );
    });
  });

  describe('changePassword', () => {
    it('should change password when old password is correct', async () => {
      // Arrange
      const mockUser = { id: 'user_id', password: 'hashed_old_password' };
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (Hash.verify as jest.Mock).mockReturnValue(true); // Old password valid
      (Hash.hash as jest.Mock).mockReturnValue('hashed_new_password');

      prisma.user.update = jest.fn();

      // Act
      await service.changePassword('user_id', 'old_pass', 'new_pass');

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user_id' },
          data: { password: 'hashed_new_password' }
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile with permissions', async () => {
      // Arrange
      const mockUser = { 
        id: 'user_id', 
        email: 'test@example.com',
        roleData: {} 
      };
      const mockPermissions = [{ name: 'perm_1' }, { name: 'perm_2' }];

      prisma.user.findFirst.mockResolvedValue(mockUser);
      mockPermissionService.getUserPermissions.mockResolvedValue(mockPermissions);

      // Act
      const result = await service.getProfile('user_id');

      // Assert
      expect(result.id).toBe(mockUser.id);
      expect(result.permissions).toEqual(['perm_1', 'perm_2']);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      // Arrange
      const mockUser = { id: 'user_id' };
      const updateData = { fullName: 'New Name' };
      const updatedUser = { ...mockUser, ...updateData };

      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update = jest.fn().mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile('user_id', updateData);

      // Assert
      expect(result.fullName).toBe('New Name');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions', async () => {
      // Arrange
      const mockSessions = [{ id: 's1' }, { id: 's2' }];
      prisma.userSession = { findMany: jest.fn().mockResolvedValue(mockSessions) };

      // Act
      const result = await service.getActiveSessions('user_id');

      // Assert
      expect(result).toEqual(mockSessions);
    });
  });

  describe('revokeSession', () => {
    it('should revoke session', async () => {
      // Arrange
      prisma.userSession = { updateMany: jest.fn() };

      // Act
      await service.revokeSession('user_id', 'session_id');

      // Assert
      expect(prisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'session_id', userId: 'user_id' },
          data: { isActive: false }
        })
      );
    });
  });
});
