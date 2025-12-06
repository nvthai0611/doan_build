import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../db/prisma.service';
import { PermissionService } from './permission.service';
import { AlertService } from '../admin-center/services/alert.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UnauthorizedException } from '@nestjs/common';
import Hash from '../../utils/hasing.util';

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

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;

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

    // Parameterized test cases replicating logic
    const testCases = [
      {
        name: 'should return user when email and password are valid',
        identifier: 'test@example.com',
        queryResult: mockUser,
        passwordValid: true,
        expectedResult: mockUser,
        expectedError: null,
      },
      {
        name: 'should return user when username and password are valid',
        identifier: 'testuser',
        queryResult: mockUser,
        passwordValid: true,
        expectedResult: mockUser,
        expectedError: null,
      },
      {
        name: 'should throw UnauthorizedException when user not found',
        identifier: 'nonexistent',
        queryResult: null,
        passwordValid: true, // Doesn't matter
        expectedResult: null,
        expectedError: new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác'),
      },
      {
        name: 'should throw UnauthorizedException when user is inactive',
        identifier: 'inactive@example.com',
        queryResult: { ...mockUser, isActive: false },
        passwordValid: true,
        expectedResult: null,
        expectedError: new UnauthorizedException('Tài khoản đã bị vô hiệu hóa'),
      },
      {
        name: 'should throw UnauthorizedException when password is invalid',
        identifier: 'test@example.com',
        queryResult: mockUser,
        passwordValid: false,
        expectedResult: null,
        expectedError: new UnauthorizedException('Email/Tên đăng nhập hoặc mật khẩu không chính xác'),
      },
    ];

    test.each(testCases)(
      '$name',
      async ({ identifier, queryResult, passwordValid, expectedResult, expectedError }) => {
        // Arrange
        prisma.user.findFirst.mockResolvedValue(queryResult);
        (Hash.verify as jest.Mock).mockResolvedValue(passwordValid);

        // Act & Assert
        if (expectedError) {
          await expect(service.validateUser(identifier, 'some_password')).rejects.toThrow(
            expectedError,
          );
        } else {
          const result = await service.validateUser(identifier, 'some_password');
          expect(result).toEqual(expectedResult);
        }
      },
    );
  });
});
