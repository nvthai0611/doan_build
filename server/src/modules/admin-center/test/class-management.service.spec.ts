import { Test, TestingModule } from '@nestjs/testing';
import { ClassManagementService } from '../services/class-management.service';
import { PrismaService } from '../../../db/prisma.service';
import { EmailQueueService } from '../../shared/services/email-queue.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { generateQNCode } from '../../../utils/function.util';

// Mock generateQNCode
jest.mock('../../../utils/function.util', () => ({
  generateQNCode: jest.fn().mockReturnValue('CLASS-123'),
}));

// Mock DataTransformer
jest.mock('../../../../core/transformer', () => ({
  DataTransformer: {
    // Add methods if needed
  },
}));

describe('ClassManagementService', () => {
  let service: ClassManagementService;
  let prisma: any;
  let emailQueueService: any;
  let emailNotificationService: any;

  const mockPrismaService = {
    class: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    classSession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    subject: {
      findUnique: jest.fn(),
    },
    grade: {
      findUnique: jest.fn(),
    },
    room: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
    feeStructure: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'fee-1' }),
    },
    enrollment: {
      updateMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    holidayPeriod: {
      findMany: jest.fn(),
    },
    holidayPeriodSession: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockEmailQueueService = {
    addEmailJob: jest.fn(),
  };

  const mockEmailNotificationService = {
    sendClassStatusChangeEmailToParents: jest.fn(),
    sendClassStatusChangeEmailToTeacher: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassManagementService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailQueueService, useValue: mockEmailQueueService },
        { provide: EmailNotificationService, useValue: mockEmailNotificationService },
      ],
    }).compile();

    service = module.get<ClassManagementService>(ClassManagementService);
    prisma = module.get(PrismaService);
    emailQueueService = module.get(EmailQueueService);
    emailNotificationService = module.get(EmailNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of classes with pagination and filters', async () => {
      // Arrange
      const queryDto = { page: 1, limit: 10, search: 'Test' };
      const mockClasses = [
        { 
          id: 'class-1', 
          name: 'Test Class',
          enrollments: [],
          _count: { sessions: 10 },
          subject: { name: 'Math' },
        }
      ];
      
      prisma.class.count.mockResolvedValue(1);
      prisma.class.findMany.mockResolvedValue(mockClasses);
      prisma.classSession.groupBy.mockResolvedValue([]);

      // Act
      const result = await service.findAll(queryDto as any);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(prisma.class.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return class details when found', async () => {
      // Arrange
      const classId = '123e4567-e89b-12d3-a456-426614174000'; // valid uuid
      const mockClass = { 
        id: classId, 
        name: 'Details Class',
        enrollments: [],
        _count: { enrollments: 5 },
        teacher: { user: { fullName: 'Teacher A' } }
      };

      prisma.class.findUnique.mockResolvedValue(mockClass);

      // Act
      const result = await service.findOne(classId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(classId);
    });

    it('should throw NOT_FOUND if class does not exist', async () => {
        // Arrange
        const classId = '123e4567-e89b-12d3-a456-426614174000';
        prisma.class.findUnique.mockResolvedValue(null);

        // Act & Assert
        await expect(service.findOne(classId)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a new class successfully', async () => {
      // Arrange
      const createClassDto = {
        name: 'New Class',
        subjectId: 'sub-1',
        gradeId: 'grade-1',
        teacherId: 'teacher-1',
        recurringSchedule: { schedules: [{ day: 'monday' }] }
      };
      // Mock checks
      prisma.class.findFirst.mockResolvedValue(null); // name check
      prisma.subject.findUnique.mockResolvedValue({ id: 'sub-1', name: 'Math' });
      prisma.grade.findUnique.mockResolvedValue({ id: 'grade-1', name: '10' });
      prisma.room.findUnique.mockResolvedValue({ id: 'room-1', capacity: 30 });
      prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });
      prisma.class.findUnique.mockResolvedValue(null); // code check unique
      prisma.feeStructure.findUnique.mockResolvedValue(null);
      const createdClass = {
        id: 'new-id',
        ...createClassDto,
        classCode: 'CLASS-123',
        maxStudents: 30,
        status: 'ready',
        feeStructureId: 'fee-1',
        feeAmount: null,
        feePeriod: null,
        feeCurrency: 'VND'
      };
      prisma.class.create.mockResolvedValue(createdClass);
      // Act
      const result = await service.create(createClassDto as any);
      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(createdClass);
      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: 'sub-1' } });
      expect(prisma.grade.findUnique).toHaveBeenCalledWith({ where: { id: 'grade-1' } });
      expect(prisma.room.findUnique).toHaveBeenCalledWith({ where: { id: 'room-1' } });
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({ where: { id: 'teacher-1' } });
      expect(prisma.class.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Class',
            classCode: 'CLASS-123',
            subjectId: 'sub-1',
            gradeId: 'grade-1',
            roomId: 'room-1',
            teacherId: 'teacher-1',
            recurringSchedule: { schedules: [{ day: 'monday' }] },
            maxStudents: 30,
            status: 'ready',
            feeStructureId: 'fee-1',
            feeAmount: null,
            feePeriod: null,
            feeCurrency: 'VND',
            expectedStartDate: null,
            actualStartDate: null,
            actualEndDate: null,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update class details successfully', async () => {
      // Arrange
      const classId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { name: 'Updated Name' };
      
      prisma.class.findUnique.mockResolvedValue({ 
        id: classId, 
        name: 'Old Name', 
        status: 'ready' 
      });
      // Mock duplicate check (returns no duplicate)
      prisma.class.findFirst.mockResolvedValue(null); 

      prisma.class.update.mockResolvedValue({ id: classId, name: 'Updated Name' });

      // Act
      const result = await service.update(classId, updateDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Name');
      expect(prisma.class.update).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status and trigger notifications', async () => {
      // Arrange
      const classId = '123e4567-e89b-12d3-a456-426614174000';
      const statusDto = { status: 'active' };
      const existingClass = { 
        id: classId, 
        status: 'ready',
        teacherId: 't1',
        teacher: { id: 't1' },
        recurringSchedule: { schedules: [{ day: 'mon' }] }
      };

      prisma.class.findUnique.mockResolvedValue(existingClass);
      prisma.class.update.mockResolvedValue({ ...existingClass, status: 'active' });
      
      // Mock transaction
      prisma.$transaction.mockImplementation(async (callback) => await callback(prisma));

      // Act
      const result = await service.updateStatus(classId, statusDto);

      // Wait for async notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert
      expect(result.data.status).toBe('active');
      expect(prisma.class.update).toHaveBeenCalled();
      expect(emailNotificationService.sendClassStatusChangeEmailToParents).toHaveBeenCalled();
    });
  });

  describe('generateSessions', () => {
    it('should generate sessions for a class', async () => {
       // Arrange
       const classId = '123e4567-e89b-12d3-a456-426614174000';
       const body = { 
         startDate: '2023-01-01', 
         endDate: '2023-01-31',
         generateForFullYear: false 
       };

       const mockClass = {
         id: classId,
         name: 'Test Class',
         subject: { name: 'Math' },
         room: { name: 'Room 1' },
         teacher: { user: { fullName: 'T1' } },
         recurringSchedule: { 
            schedules: [
                { 
                    day: 'sunday', // 2023-01-01 is Sunday
                    startTime: '08:00', 
                    endTime: '10:00' 
                }
            ] 
         },
         _count: { enrollments: 10 }
       };

       prisma.class.findUnique.mockResolvedValue(mockClass);
       prisma.classSession.findMany.mockResolvedValue([]); // no existing sessions
       prisma.classSession.createMany.mockResolvedValue({ count: 5 });
       prisma.holidayPeriod.findMany.mockResolvedValue([]);
       prisma.enrollment.updateMany.mockResolvedValue({ count: 0 });
       prisma.class.update.mockResolvedValue({});

       // Act
       const result = await service.generateSessions(classId, body);

       // Assert
       expect(result.success).toBe(true);
       expect(result.data.createdCount).toBe(5);
       expect(prisma.classSession.createMany).toHaveBeenCalled();
    });
  });

  describe('getClassSessions', () => {
      it('should return sessions for a class', async () => {
          // Arrange
          const classId = 'class-1';
          const query = { page: 1, limit: 10 };
          
          prisma.classSession.findMany.mockResolvedValue([{ 
            id: 's1', 
            notes: 'Session 1',
            sessionDate: new Date(),
            startTime: '08:00',
            endTime: '10:00',
            status: 'scheduled',
            class: { maxStudents: 20 },
            _count: { attendances: 0 }
          }]);
          prisma.classSession.count.mockResolvedValue(1);

          // Act
          const result = await service.getClassSessions(classId, query);

          // Assert
          expect(result.success).toBe(true);
          expect(result.data).toHaveLength(1);
      });
  });

});
