import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';
import { EmailQueueService } from '../../shared/services/email-queue.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
import { generateQNCode } from '../../../utils/function.util';
import { DEFAULT_STATUS, ClassStatus, EnrollmentStatus, SessionStatus } from '../../../common/constants';
import { DataTransformer } from '../../../../core/transformer';

@Injectable()
export class ClassManagementService {
  constructor(
    private prisma: PrismaService,
    private emailQueueService: EmailQueueService,
    private emailNotificationService: EmailNotificationService,
  ) {}

  // Helper function để tìm và gợi ý tên khóa mới
  private async suggestNextClassName(
    name: string,
    academicYear: string,
  ): Promise<string> {
    // Pattern để tìm số khóa: "Toán 6 K1", "Văn 7 K2", etc.
    const khPattern = /^(.+?)\s*K(\d+)$/i;
    const match = name.match(khPattern);

    let baseName: string;
    let currentNumber = 0;

    if (match) {
      // Nếu tên đã có format "Tên K{số}"
      baseName = match[1].trim();
      currentNumber = parseInt(match[2]);
    } else {
      // Nếu tên không có format K{số}, lấy toàn bộ làm base
      baseName = name.trim();
    }

    // Tìm tất cả các lớp có tên tương tự trong cùng năm học
    const similarClasses = await this.prisma.class.findMany({
      where: {
        name: {
          startsWith: baseName,
          mode: 'insensitive',
        },
        academicYear: academicYear,
        status: { not: 'deleted' },
      },
      select: {
        name: true,
      },
    });

    // Tìm số khóa cao nhất
    let maxNumber = currentNumber;

    for (const cls of similarClasses) {
      const clsMatch = cls.name.match(khPattern);
      if (
        clsMatch &&
        clsMatch[1].trim().toLowerCase() === baseName.toLowerCase()
      ) {
        const num = parseInt(clsMatch[2]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      } else if (cls.name.trim().toLowerCase() === baseName.toLowerCase()) {
        // Nếu có lớp chính xác trùng tên không có số
        maxNumber = Math.max(maxNumber, 1);
      }
    }

    // Gợi ý tên mới
    return `${baseName} K${maxNumber + 1}`;
  }

  // Helper function để kiểm tra trùng tên
  private async checkDuplicateClassName(
    name: string,
    academicYear: string,
    excludeId?: string,
  ): Promise<{ isDuplicate: boolean; suggestedName?: string }> {
    const whereCondition: any = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      academicYear: academicYear,   
      status: { notIn: ['deleted', 'cancelled'] },
    };

    // Nếu đang update, loại trừ chính nó
    if (excludeId) {
      whereCondition.id = { not: excludeId };
    }

    const existingClass = await this.prisma.class.findFirst({
      where: whereCondition,
    });

    if (existingClass) {
      const suggestedName = await this.suggestNextClassName(name, academicYear);
      return {
        isDuplicate: true,
        suggestedName,
      };
    }

    return { isDuplicate: false };
  }
  // Lấy danh sách tất cả lớp học với filters và pagination
  async findAll(queryDto: QueryClassDto) {
    try {
      const {
        status,
        gradeId,
        subjectId,
        roomId,
        teacherId,
        search,
        dayOfWeek,
        shift,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = queryDto;

      const skip = (page - 1) * limit;
      const take = limit;

      // Determine current academic year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-12

      // Academic year logic:
      // - If current month is 9-12: current academic year is currentYear-currentYear+1
      // - If current month is 1-8: current academic year is currentYear-1-currentYear
      let currentAcademicYear: string;
      if (currentMonth >= 9) {
        currentAcademicYear = `${currentYear}-${currentYear + 1}`;
      } else {
        currentAcademicYear = `${currentYear - 1}-${currentYear}`;
      }

      const where: any = {
        status: { not: 'deleted' }, // Exclude deleted classes
      };

      if (status && status !== 'all') where.status = status;

      // Filter by gradeId or grade level
      if (gradeId) {
        const gradeValues = gradeId.split(',').map((id: string) => id.trim()).filter((id: string) => id);
        
        // Check if values are UUIDs or grade levels (numbers)
        const isUUID = (value: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(value);
        };
        
        const allAreUUIDs = gradeValues.every((val) => isUUID(val));
        
        if (allAreUUIDs) {
          // Filter by gradeId (UUID)
          if (gradeValues.length === 1) {
            where.gradeId = gradeValues[0];
          } else if (gradeValues.length > 1) {
            where.gradeId = { in: gradeValues };
          }
        } else {
          // Filter by grade level (numbers like 6, 7, 8, 9)
          const gradeLevels = gradeValues.map((val) => parseInt(val)).filter((val) => !isNaN(val));
          if (gradeLevels.length === 1) {
            where.grade = { level: gradeLevels[0] };
          } else if (gradeLevels.length > 1) {
            where.grade = { level: { in: gradeLevels } };
          }
        }
      }

      // Helper function to validate UUID
      const isValidUUID = (value: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      };

      // Filter by subjectId (must be valid UUID)
      if (subjectId && subjectId !== 'all' && isValidUUID(subjectId)) {
        where.subjectId = subjectId;
      }

      // Filter by roomId (must be valid UUID)
      if (roomId && roomId !== 'all' && isValidUUID(roomId)) {
        where.roomId = roomId;
      }

      // Filter by teacherId (must be valid UUID)
      if (teacherId && teacherId !== 'all' && isValidUUID(teacherId)) {
        where.teacherId = teacherId;
      }

      // Filter by date range (if provided)
      // Logic: Tìm lớp có khoảng thời gian giao với khoảng startDate - endDate
      // Lớp giao với khoảng [startDate, endDate] nếu:
      // - Lớp bắt đầu <= endDate VÀ lớp kết thúc >= startDate
      if (startDate || endDate) {
        where.AND = where.AND || [];
        
        if (startDate && endDate) {
          // Có cả startDate và endDate: tìm lớp có khoảng thời gian giao với khoảng này
          const startDateObj = new Date(startDate + 'T00:00:00.000Z');
          const endDateObj = new Date(endDate + 'T23:59:59.999Z');
          
          // Lớp bắt đầu <= endDate (sử dụng actualStartDate hoặc expectedStartDate)
          // VÀ lớp kết thúc >= startDate (sử dụng actualEndDate hoặc ước tính)
          where.AND.push({
            AND: [
              // Lớp bắt đầu <= endDate
              {
                OR: [
                  { actualStartDate: { lte: endDateObj } },
                  { expectedStartDate: { lte: endDateObj } },
                ],
              },
              // Lớp kết thúc >= startDate
              {
                OR: [
                  { actualEndDate: { gte: startDateObj } },
                  // Nếu không có actualEndDate, kiểm tra actualStartDate hoặc expectedStartDate
                  {
                    AND: [
                      { actualEndDate: null },
                      {
                        OR: [
                          { actualStartDate: { gte: startDateObj } },
                          { expectedStartDate: { gte: startDateObj } },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          });
        } else if (startDate) {
          // Chỉ có startDate: tìm lớp có ngày bắt đầu >= startDate
          const startDateObj = new Date(startDate + 'T00:00:00.000Z');
          where.AND.push({
            OR: [
              { actualStartDate: { gte: startDateObj } },
              { expectedStartDate: { gte: startDateObj } },
            ],
          });
        } else if (endDate) {
          // Chỉ có endDate: tìm lớp có ngày kết thúc <= endDate hoặc chưa có ngày kết thúc nhưng bắt đầu <= endDate
          const endDateObj = new Date(endDate + 'T23:59:59.999Z');
          where.AND.push({
            OR: [
              { actualEndDate: { lte: endDateObj } },
              {
                AND: [
                  { actualEndDate: null },
                  {
                    OR: [
                      { actualStartDate: { lte: endDateObj } },
                      { expectedStartDate: { lte: endDateObj } },
                    ],
                  },
                ],
              },
            ],
          });
        }
      }

      // Enhanced search - search in name, classCode, description, subject name, teacher name, email, phone
      if (search) {
        const searchConditions = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { classCode: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            {
              subject: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
            {
              teacher: {
                user: {
                  OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
            {
              room: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
            {
              grade: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        };
        
        // Combine search with other conditions
        if (where.AND) {
          where.AND.push(searchConditions);
        } else {
          where.AND = [searchConditions];
        }
      }

      const totalBeforeFilter = await this.prisma.class.count({ where });
      const orderBy: any = {};
      if (sortBy && sortOrder) {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      const classes = await this.prisma.class.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          subject: true,
          room: true,
          grade: true,
          
          teacher: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
          enrollments: {
            where: {
              status: {
                not: 'withdrawn', // Loại bỏ enrollments đã chuyển lớp
              },
            },
            select: {
              id: true, // Chỉ cần id để count
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
      });

      // Get sessions ended count for all classes in a single query
      const classIds = classes.map((cls) => cls.id);
      const sessionsEndedResults = await this.prisma.classSession.groupBy({
        by: ['classId'],
        where: {
          classId: { in: classIds },
          status: 'end',
        },
        _count: {
          id: true,
        },
      });

      // Create a map for quick lookup
      const sessionsEndedMap = new Map(
        sessionsEndedResults.map((item) => [item.classId, item._count.id]),
      );

      // Transform data
      let transformedClasses = classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        code: cls.classCode,
        subjectId: cls.subjectId,
        subjectName: cls.subject?.name || '',
        gradeId: cls.gradeId,
        gradeName: cls.grade?.name || '',
        gradeLevel: cls.grade?.level || null,
        status: cls.status,
        maxStudents: cls.maxStudents,
        currentStudents: cls.enrollments.length, // Count từ enrollments array đã được filter
        roomId: cls.roomId,
        roomName: cls.room?.name || '-',
        description: cls.description,
        actualStartDate: cls.actualStartDate,
        actualEndDate: cls.actualEndDate,
        recurringSchedule: cls.recurringSchedule,
        academicYear: cls.academicYear,
        expectedStartDate: cls.expectedStartDate,
        teacher: cls.teacher
          ? {
              id: cls.teacher.id,
              userId: cls.teacher.userId,
              name: cls.teacher.user.fullName,
              email: cls.teacher.user.email,
              phone: cls.teacher.user.phone,
              avatar: cls.teacher.user.avatar,
            }
          : null,
        sessions: cls._count.sessions,
        sessionsEnd: sessionsEndedMap.get(cls.id) || 0,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
      }));

      if (dayOfWeek && dayOfWeek !== 'all') {
        transformedClasses = transformedClasses.filter((cls) => {
          if (
            !cls.recurringSchedule ||
            !(cls.recurringSchedule as any)?.schedules
          )
            return false;
          return (cls.recurringSchedule as any).schedules.some(
            (schedule: any) => schedule.day === dayOfWeek,
          );
        });
      }

      if (shift && shift !== 'all') {
        const timeRanges = {
          morning: { start: '00:00', end: '11:59' },
          afternoon: { start: '12:00', end: '16:59' },
          evening: { start: '17:00', end: '23:59' },
        };

        const timeRange = timeRanges[shift];

        if (timeRange) {
          transformedClasses = transformedClasses.filter((cls) => {
            if (
              !cls.recurringSchedule ||
              !(cls.recurringSchedule as any)?.schedules
            )
              return false;
            return (cls.recurringSchedule as any).schedules.some(
              (schedule: any) => {
                const startTime = schedule.startTime;
                return (
                  startTime >= timeRange.start && startTime <= timeRange.end
                );
              },
            );
          });
        }
      }

      // const sortedClasses = transformedClasses.sort((a, b) => {
      //   const aIsCurrentYear = a.academicYear === currentAcademicYear;
      //   const bIsCurrentYear = b.academicYear === currentAcademicYear;
      //   if (aIsCurrentYear && !bIsCurrentYear) return -1;
      //   if (!aIsCurrentYear && bIsCurrentYear) return 1;
      //   return 0;
      // });
      
      return {
        success: true,
        message: 'Lấy danh sách lớp học thành công',
        data: transformedClasses,
        meta: {
          total: totalBeforeFilter,
          page: page,
          limit: limit,
          totalPages: Math.ceil(totalBeforeFilter / limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy chi tiết 1 lớp học
  async findOne(id: string) {
    try {
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const classItem = await this.prisma.class.findUnique({
        where: { id },
        include: {
          subject: true,
          room: true,
          grade: true,
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
          enrollments: {
            where: {
              status: {
                in: ['not_been_updated', 'studying'],
              },
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Lấy thông tin lớp học thành công',
        data: {
          ...classItem,
          subjectName: classItem.subject?.name,
          roomName: classItem.room?.name,
          gradeName: classItem.grade?.name,
          gradeLevel: classItem.grade?.level,
          currentStudents: classItem._count.enrollments,
          teacher: classItem.teacher
            ? {
                ...classItem.teacher.user,
                teacherId: classItem.teacher.id,
                userId: classItem.teacher.userId,
                teacherCode: classItem.teacher.teacherCode,
              }
            : null,
          students: classItem.enrollments.map((e) => ({
            enrollmentId: e.id,
            studentId: e.student.id,
            ...e.student.user,
            enrolledAt: e.enrolledAt,
            status: e.status,
          })),
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Tạo lớp học mới
  async create(createClassDto: CreateClassDto) {
    try {
      // Validation
      if (!createClassDto.name) {
        throw new HttpException(
          {
            success: false,
            message: 'Tên lớp là bắt buộc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Determine current academic year nếu không có
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentAcademicYear =
        currentMonth >= 5
          ? `${currentYear}-${currentYear + 1}`
          : `${currentYear - 1}-${currentYear}`;

      const academicYear = createClassDto.academicYear || currentAcademicYear;

      // Check duplicate class name
      const duplicateCheck = await this.checkDuplicateClassName(
        createClassDto.name,
        academicYear,
      );

      if (duplicateCheck.isDuplicate) {
        throw new HttpException(
          {
            success: false,
            message: `Tên lớp "${createClassDto.name}" đã tồn tại. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
          },
          HttpStatus.CONFLICT,
        );
      }

      // Check subject exists if provided
      if (createClassDto.subjectId) {
        const subject = await this.prisma.subject.findUnique({
          where: { id: createClassDto.subjectId },
        });

        if (!subject) {
          throw new HttpException(
            {
              success: false,
              message: 'Môn học không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Check room exists if provided và lấy capacity để làm maxStudents
      let roomCapacity: number | null = null;
      if (createClassDto.roomId) {
        const room = await this.prisma.room.findUnique({
          where: { id: createClassDto.roomId },
        });

        if (!room) {
          throw new HttpException(
            {
              success: false,
              message: 'Phòng học không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }

        // Lấy capacity của phòng
        roomCapacity = room.capacity;
      }

      // Check grade exists if provided
      if (createClassDto.gradeId) {
        const grade = await this.prisma.grade.findUnique({
          where: { id: createClassDto.gradeId },
        });

        if (!grade) {
          throw new HttpException(
            {
              success: false,
              message: 'Khối lớp không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Check teacher exists if provided
      if (createClassDto.teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
          where: { id: createClassDto.teacherId },
        });

        if (!teacher) {
          throw new HttpException(
            {
              success: false,
              message: 'Giáo viên không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Auto-determine status based on completeness
      // Generate unique class code
      let classCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        classCode = generateQNCode('class');
        const existingClass = await this.prisma.class.findUnique({
          where: { classCode },
        });

        if (!existingClass) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new HttpException(
          {
            success: false,
            message: 'Không thể tạo mã lớp học duy nhất sau nhiều lần thử',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Xác định maxStudents: ưu tiên giá trị truyền vào, nếu không có thì dùng capacity của phòng
      const maxStudents = createClassDto.maxStudents ?? roomCapacity;

      // Tìm hoặc tạo FeeStructure cho lớp nếu có gradeId và subjectId
      let feeStructureId: string | null = null;
      let feeAmount: number | null = null;
      let feePeriod: string | null = null;
      let feeCurrency: string = 'VND';
      
      if (createClassDto.gradeId && createClassDto.subjectId) {
        // Lấy thông tin grade và subject để tạo tên
        const grade = await this.prisma.grade.findUnique({
          where: { id: createClassDto.gradeId },
        });
        const subject = await this.prisma.subject.findUnique({
          where: { id: createClassDto.subjectId },
        });

        if (grade && subject) {
          // Tìm FeeStructure hiện có
          let feeStructure = await this.prisma.feeStructure.findUnique({
            where: {
              gradeId_subjectId: {
                gradeId: createClassDto.gradeId,
                subjectId: createClassDto.subjectId,
              },
            },
          });

          // Nếu chưa có, tạo mới
          if (!feeStructure) {
            feeStructure = await this.prisma.feeStructure.create({
              data: {
                name: `Học phí ${subject.name} ${grade.name}`,
                amount: 0, // Mặc định 0, có thể cập nhật sau
                period: 'per_session', // Mặc định theo buổi
                description: `Học phí cho môn ${subject.name} khối ${grade.name}`,
                gradeId: createClassDto.gradeId,
                subjectId: createClassDto.subjectId,
                isActive: true,
              },
            });
          }

          feeStructureId = feeStructure.id;
          // Copy giá trị từ FeeStructure vào các field của Class
          feeAmount = feeStructure.amount ? Number(feeStructure.amount) : null;
          feePeriod = feeStructure.period || null;
          feeCurrency = 'VND'; // Mặc định VND
        }
      }

      const newClass = await this.prisma.class.create({
        data: {
          name: createClassDto.name,
          classCode: classCode,
          subjectId: createClassDto.subjectId || null,
          gradeId: createClassDto.gradeId || null,
          maxStudents: maxStudents,
          roomId: createClassDto.roomId || null,
          teacherId: createClassDto.teacherId || null,
          description: createClassDto.description || null,
          status: DEFAULT_STATUS.CLASS,
          recurringSchedule: createClassDto.recurringSchedule || null,
          academicYear: academicYear,
          feeStructureId: feeStructureId,
          feeAmount: feeAmount,
          feePeriod: feePeriod,
          feeCurrency: feeCurrency,
          expectedStartDate: createClassDto.expectedStartDate
            ? new Date(createClassDto.expectedStartDate)
            : null,
          actualStartDate: createClassDto.actualStartDate
            ? new Date(createClassDto.actualStartDate)
            : null,
          actualEndDate: createClassDto.actualEndDate
            ? new Date(createClassDto.actualEndDate)
            : null,
        },
        include: {
          subject: true,
          room: true,
          grade: true,
          feeStructure: true,
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: `Tạo lớp học thành công.`,
        data: newClass,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Cập nhật lớp học
  async update(id: string, updateClassDto: UpdateClassDto) {
    try {
      // Validate UUID
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check class exists
      const existingClass = await this.prisma.class.findUnique({
        where: { id },
      });

      if (!existingClass) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check duplicate class name nếu đổi tên hoặc đổi năm học
      if (updateClassDto.name || updateClassDto.academicYear) {
        const newName = updateClassDto.name || existingClass.name;
        const newAcademicYear =
          updateClassDto.academicYear || existingClass.academicYear;

        // Chỉ check nếu tên hoặc năm học thay đổi
        if (
          newName !== existingClass.name ||
          newAcademicYear !== existingClass.academicYear
        ) {
          const duplicateCheck = await this.checkDuplicateClassName(
            newName,
            newAcademicYear,
            id, // Loại trừ chính nó
          );

          if (duplicateCheck.isDuplicate) {
            throw new HttpException(
              {
                success: false,
                message: `Tên lớp "${newName}" đã tồn tại trong năm học này. Gợi ý tên: "${duplicateCheck.suggestedName}"`,
              },
              HttpStatus.CONFLICT,
            );
          }
        }
      }

      // Check subject exists if provided
      if (updateClassDto.subjectId) {
        const subject = await this.prisma.subject.findUnique({
          where: { id: updateClassDto.subjectId },
        });

        if (!subject) {
          throw new HttpException(
            {
              success: false,
              message: 'Môn học không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Check room exists if provided
      if (updateClassDto.roomId) {
        const room = await this.prisma.room.findUnique({
          where: { id: updateClassDto.roomId },
        });

        if (!room) {
          throw new HttpException(
            {
              success: false,
              message: 'Phòng học không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Check grade exists if provided
      if (updateClassDto.gradeId) {
        const grade = await this.prisma.grade.findUnique({
          where: { id: updateClassDto.gradeId },
        });

        if (!grade) {
          throw new HttpException(
            {
              success: false,
              message: 'Khối lớp không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // Check teacher exists if provided
      if (updateClassDto.teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
          where: { id: updateClassDto.teacherId },
        });

        if (!teacher) {
          throw new HttpException(
            {
              success: false,
              message: 'Giáo viên không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const updatedClass = await this.prisma.class.update({
        where: { id },
        data: {
          ...(updateClassDto.name && { name: updateClassDto.name }),
          ...(updateClassDto.subjectId && {
            subjectId: updateClassDto.subjectId,
          }),
          ...(updateClassDto.gradeId !== undefined && {
            gradeId: updateClassDto.gradeId,
          }),
          ...(updateClassDto.maxStudents !== undefined && {
            maxStudents: updateClassDto.maxStudents,
          }),
          ...(updateClassDto.roomId !== undefined && {
            roomId: updateClassDto.roomId,
          }),
          ...(updateClassDto.teacherId !== undefined && {
            teacherId: updateClassDto.teacherId,
          }),
          ...(updateClassDto.description !== undefined && {
            description: updateClassDto.description,
          }),
          ...(updateClassDto.status && { status: updateClassDto.status }),
          ...(updateClassDto.recurringSchedule !== undefined && {
            recurringSchedule: updateClassDto.recurringSchedule,
          }),
          ...(updateClassDto.academicYear !== undefined && {
            academicYear: updateClassDto.academicYear,
          }),
          ...(updateClassDto.expectedStartDate !== undefined && {
            expectedStartDate: updateClassDto.expectedStartDate
              ? new Date(updateClassDto.expectedStartDate)
              : null,
          }),
          ...(updateClassDto.actualEndDate !== undefined && {
            actualEndDate: updateClassDto.actualEndDate
              ? new Date(updateClassDto.actualEndDate)
              : null,
          }),
          ...(updateClassDto.actualStartDate !== undefined && {
            actualStartDate: updateClassDto.actualStartDate
              ? new Date(updateClassDto.actualStartDate)
              : null,
          }),
        },
        include: {
          subject: true,
          room: true,
          grade: true,
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
      [];

      // AUTO-GEN SESSIONS: Nếu status chuyển từ ready → active hoặc suspended → active, tự động gen sessions (chỉ khi chưa có sessions)
      const isStatusChangedToActive =
        (existingClass.status === 'ready' || existingClass.status === 'suspended') && updateClassDto.status === 'active';

      if (isStatusChangedToActive) {
        try {
          // Kiểm tra xem lớp đã có sessions chưa
          const existingSessionsCount = await this.prisma.classSession.count({
            where: { classId: id },
          });

          // Nếu đã có sessions rồi thì không tạo lại, chỉ cập nhật status
          if (existingSessionsCount > 0) {
            return {
              success: true,
              message: `Cập nhật lớp học thành công. Lớp đã có ${existingSessionsCount} buổi học.`,
              data: updatedClass,
              sessionsGenerated: false,
            };
          }

          // Nếu chưa có sessions, tiến hành tạo mới
          // Xác định ngày bắt đầu
          const startDate =
            updatedClass.actualStartDate || updatedClass.expectedStartDate;
          let endDate = updatedClass.actualEndDate;

          // Nếu không có actualEndDate, tự động tính 9 tháng từ startDate
          if (startDate && !endDate) {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 9);
            console.log(
              `📅 Auto-calculated endDate: ${endDate.toLocaleDateString('vi-VN')}`,
            );
          }

          if (startDate && endDate && updatedClass.recurringSchedule) {
            // Tự động gen sessions
            console.log(
              `🚀 Generating sessions from ${startDate.toLocaleDateString('vi-VN')} to ${endDate.toLocaleDateString('vi-VN')}`,
            );

            await this.generateSessions(id, {
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
            });

            return {
              success: true,
              message: `Cập nhật lớp học thành công. Đã tạo lịch học từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}.`,
              data: updatedClass,
              sessionsGenerated: true,
            };
          } else {
            // Thiếu thông tin để gen sessions
            return {
              success: true,
              message:
                'Cập nhật lớp học thành công. Vui lòng cập nhật ngày bắt đầu và lịch học tuần để tạo buổi học.',
              data: updatedClass,
              warning:
                'Chưa thể tạo lịch học do thiếu thông tin ngày bắt đầu hoặc lịch học tuần',
            };
          }
        } catch (error) {
          // Nếu gen sessions lỗi, vẫn return success nhưng có warning
          console.error('Error auto-generating sessions:', error);
          return {
            success: true,
            message:
              'Cập nhật lớp học thành công nhưng có lỗi khi tạo lịch học tự động',
            data: updatedClass,
            warning: error.message || 'Không thể tạo lịch học tự động',
          };
        }
      }

      return {
        success: true,
        message: 'Cập nhật lớp học thành công',
        data: updatedClass,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Cập nhật trạng thái lớp học (API riêng)
  async updateStatus(id: string, updateStatusDto: { status: string; startDate?: string; endDate?: string }) {
    try {
      // Validate UUID
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const { status, startDate, endDate } = updateStatusDto;
      
      // Check class exists
      const existingClass = await this.prisma.class.findUnique({
        where: { id },
        include: {
          enrollments: {
            where: {
              status: {
                in: ['studying', 'not_been_updated'],
              },
            },
          },
          subject: true,
          room: true,
          teacher: true,
        },
      });

      if (!existingClass) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Thực hiện update trong transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Chuẩn bị data để update
        const updateData: any = { status };
        
        // Nếu chuyển sang 'active' và feeLockedAt chưa được set, thì khóa học phí
        if (status === 'active' && !existingClass.feeLockedAt) {
          updateData.feeLockedAt = new Date();
        }
        
        // Update class status và feeLockedAt nếu cần
        const updatedClass = await tx.class.update({
          where: { id },
          data: updateData,
        });

        // Nếu chuyển từ active sang completed, update enrollments và sessions
        let updatedEnrollmentsCount = 0;
        let updatedSessionsCount = 0;
        if (existingClass.status === 'active' && status === 'completed') {
          // Update tất cả enrollments có status là studying hoặc not_been_updated
          // nhưng không update những ai đã stopped
          const updateResult = await tx.enrollment.updateMany({
            where: {
              classId: id,
              status: {
                in: ['studying', 'not_been_updated'],
              },
            },
            data: {
              status: EnrollmentStatus.GRADUATED,
              completedAt: new Date(),
            },
          });
          updatedEnrollmentsCount = updateResult.count;

          // Update tất cả buổi học về status 'end'
          const sessionsUpdateResult = await tx.classSession.updateMany({
            where: {
              classId: id,
              status: {
                notIn: ['end', 'cancelled', 'day_off'], // Chỉ update những session chưa end
              },
            },
            data: {
              status: 'end',
            },
          });
          updatedSessionsCount = sessionsUpdateResult.count;
        }

        // Nếu chuyển sang cancelled, update tất cả enrollments sang stopped
        if (status === 'cancelled') {
          console.log(status);
          
          // Update tất cả enrollments có status là studying hoặc not_been_updated
          // sang stopped (ngưng học)
          const updateResult = await tx.enrollment.updateMany({
            where: {
              classId: id,
              status: {
                in: ['studying', 'not_been_updated'],
              },
            },
            data: {
              status: EnrollmentStatus.STOPPED,
              completionNotes: 'Lớp học đã bị hủy',
            },
          });
          updatedEnrollmentsCount = updateResult.count;

          // Update tất cả buổi học về status 'cancelled'
          const sessionsUpdateResult = await tx.classSession.updateMany({
            where: {
              classId: id,
              status: {
                notIn: ['end', 'cancelled', 'day_off'], // Chỉ update những session chưa end/cancelled
              },
            },
            data: {
              status: 'cancelled', 
            },
          });
          updatedSessionsCount = sessionsUpdateResult.count;
        }
        
        return {
          class: updatedClass,
          updatedEnrollmentsCount,
          updatedSessionsCount,
        };
      });
      
      // AUTO-GEN SESSIONS: Nếu chuyển từ ready → active hoặc suspended → active, tự động gen sessions (chỉ khi chưa có sessions)
      const isStatusChangedToActive = 
        (existingClass.status === 'ready' || existingClass.status === 'suspended') && status === 'active';
      
      if (isStatusChangedToActive) {
        try {
          // Kiểm tra xem lớp đã có sessions chưa
          const existingSessionsCount = await this.prisma.classSession.count({
            where: { classId: id },
          });

          // Nếu đã có sessions rồi thì không tạo lại, chỉ chuyển status
          if (existingSessionsCount > 0) {
            const statusLabel = {
              draft: 'Lớp nháp',
              ready: 'Sẵn sàng',
              active: 'Đang hoạt động',
              completed: 'Đã hoàn thành',
              suspended: 'Tạm dừng',
              cancelled: 'Đã hủy',
            }[status] || status;

            return {
              success: true,
              message: `Đã chuyển trạng thái lớp sang "${statusLabel}". Lớp đã có ${existingSessionsCount} buổi học.`,
              data: result.class,
              updatedEnrollmentsCount: result.updatedEnrollmentsCount,
              sessionsGenerated: false,
            };
          }

          // Nếu chưa có sessions, tiến hành tạo mới
          // Xác định ngày bắt đầu - ưu tiên từ request, sau đó là từ updatedClass
          const sessionStartDate =
            startDate
              ? new Date(startDate)
              : result.class.actualStartDate || result.class.expectedStartDate;
          let sessionEndDate: Date | null = null;

          if (endDate) {
            // Sử dụng ngày từ request
            sessionEndDate = new Date(endDate);
          } else {
            // Lấy từ updatedClass hoặc tự động tính 9 tháng từ startDate
            sessionEndDate = result.class.actualEndDate || null;
            if (sessionStartDate && !sessionEndDate) {
              sessionEndDate = new Date(sessionStartDate);
              sessionEndDate.setMonth(sessionEndDate.getMonth() + 9);
              console.log(
                `Auto-calculated endDate: ${sessionEndDate.toLocaleDateString('vi-VN')}`,
              );
            }
          }

          if (sessionStartDate && sessionEndDate && result.class.recurringSchedule) {
            // Tự động gen sessions
            console.log(
              `Generating sessions from ${sessionStartDate.toLocaleDateString('vi-VN')} to ${sessionEndDate.toLocaleDateString('vi-VN')}`,
            );

            await this.generateSessions(id, {
              startDate: sessionStartDate.toISOString().split('T')[0],
              endDate: sessionEndDate.toISOString().split('T')[0],
              generateForFullYear: false, // Sử dụng startDate và endDate từ request, không tự tính
            });

            // Chuẩn bị message
            const statusLabel = {
              draft: 'Lớp nháp',
              ready: 'Sẵn sàng',
              active: 'Đang hoạt động',
              completed: 'Đã hoàn thành',
              suspended: 'Tạm dừng',
              cancelled: 'Đã hủy',
            }[status] || status;

            let message = `Đã chuyển trạng thái lớp sang "${statusLabel}". Đã tạo lịch học từ ${sessionStartDate.toLocaleDateString('vi-VN')} đến ${sessionEndDate.toLocaleDateString('vi-VN')}.`;

            return {
              success: true,
              message,
              data: result.class,
              updatedEnrollmentsCount: result.updatedEnrollmentsCount,
              sessionsGenerated: true,
            };
          } else {
            // Thiếu thông tin để gen sessions
            const statusLabel = {
              draft: 'Lớp nháp',
              ready: 'Sẵn sàng',
              active: 'Đang hoạt động',
              completed: 'Đã hoàn thành',
              suspended: 'Tạm dừng',
              cancelled: 'Đã hủy',
            }[status] || status;

            let message = `Đã chuyển trạng thái lớp sang "${statusLabel}". Vui lòng cập nhật ngày bắt đầu và lịch học tuần để tạo buổi học.`;

            return {
              success: true,
              message,
              data: result.class,
              updatedEnrollmentsCount: result.updatedEnrollmentsCount,
              warning:
                'Chưa thể tạo lịch học do thiếu thông tin ngày bắt đầu hoặc lịch học tuần',
            };
          }
        } catch (error) {
          // Nếu gen sessions lỗi, vẫn return success nhưng có warning
          console.error('Error auto-generating sessions:', error);
          
          const statusLabel = {
            draft: 'Lớp nháp',
            ready: 'Sẵn sàng',
            active: 'Đang hoạt động',
            completed: 'Đã hoàn thành',
            suspended: 'Tạm dừng',
            cancelled: 'Đã hủy',
          }[status] || status;

          let message = `Đã chuyển trạng thái lớp sang "${statusLabel}" nhưng có lỗi khi tạo lịch học tự động`;

          return {
            success: true,
            message,
            data: result.class,
            updatedEnrollmentsCount: result.updatedEnrollmentsCount,
            warning: error.message || 'Không thể tạo lịch học tự động',
          };
        }
      }

      // Chuẩn bị message cho các trường hợp khác (không phải ready -> active)
      const statusLabel = {
        draft: 'Lớp nháp',
        ready: 'Sẵn sàng',
        active: 'Đang hoạt động',
        completed: 'Đã hoàn thành',
        suspended: 'Tạm dừng',
        cancelled: 'Đã hủy',
      }[status] || status;

      let message = `Đã chuyển trạng thái lớp sang "${statusLabel}"`;
      if (existingClass.status === 'active' && status === 'completed') {
        message += `. Đã cập nhật trạng thái ${result.updatedEnrollmentsCount} học sinh sang "Đã tốt nghiệp"`;
      }

      // Gửi email thông báo cho phụ huynh (không await để không block response)
      this.emailNotificationService
        .sendClassStatusChangeEmailToParents(id, existingClass.status, status)
        .catch(error => {
          console.error('❌ Lỗi khi gửi email thông báo status:', error);
          // Không throw để không ảnh hưởng đến response
        });

      return {
        success: true,
        message,
        data: result.class,
        updatedEnrollmentsCount: result.updatedEnrollmentsCount,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật trạng thái lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Tạo tự động buổi học cho lớp
  async generateSessions(classId: string, body: any) {
    try {
      const {
        startDate,
        endDate,
        generateForFullYear = true,
        overwrite = false,
      } = body;

      // Validate UUID
      if (!this.isValidUUID(classId)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!startDate || !endDate) {
        throw new HttpException(
          {
            success: false,
            message: 'Ngày bắt đầu và ngày kết thúc là bắt buộc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (startDate >= endDate) {
        throw new HttpException(
          {
            success: false,
            message: 'Ngày bắt đầu phải trước ngày kết thúc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Lấy thông tin lớp học với đầy đủ thông tin cần thiết
      const classInfo = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  isActive: true,
                },
              },
            },
          },
          room: true,
          subject: true,
          enrollments: {
            where: {
              status: {
                in: ['not_been_updated', 'studying'], // Các trạng thái "đang hoạt động"
              },
            },
            include: {
              student: {
                include: {
                  user: {
                    select: {
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  status: {
                    in: ['not_been_updated', 'studying'], // Các trạng thái "đang hoạt động"
                  },
                },
              },
            },
          },
        },
      });

      if (!classInfo) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Kiểm tra điều kiện bắt buộc để tạo buổi học
      const validationErrors = [];

      // 1. Kiểm tra lớp học có đầy đủ thông tin cơ bản
      if (!classInfo.name) {
        validationErrors.push('Lớp học chưa có tên');
      }
      if (!classInfo.subject) {
        validationErrors.push('Lớp học chưa được gán môn học');
      }
      if (!classInfo.room) {
        validationErrors.push('Lớp học chưa được gán phòng học');
      }
      if (!classInfo.recurringSchedule) {
        validationErrors.push('Lớp học chưa có lịch học định kỳ');
      }

      // 2. Kiểm tra giáo viên (bắt buộc)
      if (!classInfo.teacher) {
        validationErrors.push('Lớp học chưa được gán giáo viên');
      }

      // Chỉ throw error nếu thiếu thông tin bắt buộc
      if (validationErrors.length > 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp học chưa đủ điều kiện để tạo buổi học',
            errors: validationErrors,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Warnings (không block việc gen sessions)
      const warnings = [];
      const activeEnrollments = classInfo._count.enrollments;
      if (activeEnrollments < 5) {
        warnings.push(`⚠️ Lớp học chỉ có ${activeEnrollments} học sinh`);
      }
      if (warnings.length > 0) {
        console.log('Warnings:', warnings);
      }

      // Xác định ngày bắt đầu và kết thúc
      let sessionStartDate: Date;
      let sessionEndDate: Date;

      if (generateForFullYear) {
        // Ưu tiên khoảng thời gian thực tế nếu có; nếu không, mặc định 9 tháng kể từ start
        sessionStartDate =
          classInfo.actualStartDate ||
          classInfo.expectedStartDate ||
          new Date();
        const nineMonthsLater = new Date(sessionStartDate);
        nineMonthsLater.setMonth(nineMonthsLater.getMonth() + 9);
        sessionEndDate = classInfo.actualEndDate || nineMonthsLater;
      } else {
        // Sử dụng ngày từ request body
        sessionStartDate = new Date(startDate);
        sessionEndDate = new Date(endDate);
      }
      // If overwrite requested, ensure class hasn't started, then delete existing sessions in range
      if (overwrite) {
        const classStart =
          classInfo.actualStartDate || classInfo.expectedStartDate;
        if (classStart && new Date() >= new Date(classStart)) {
          throw new HttpException(
            {
              success: false,
              message: 'Lớp đã bắt đầu học, không thể cập nhật lịch cũ',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.prisma.classSession.deleteMany({
          where: {
            classId,
          },
        });
      }

      // Validate dates
      if (sessionStartDate >= sessionEndDate) {
        throw new HttpException(
          {
            success: false,
            message: 'Ngày bắt đầu phải trước ngày kết thúc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Lấy lịch học định kỳ từ class
      const recurringSchedule = classInfo.recurringSchedule as any;
      const scheduleDays = Array.isArray(recurringSchedule?.schedules)
        ? recurringSchedule.schedules
        : [];

      if (scheduleDays.length === 0) {
        throw new HttpException(
          { success: false, message: 'Lớp học chưa có lịch học định kỳ' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tạo danh sách buổi học theo lịch định kỳ: dựa vào thứ và khoảng ngày hiệu lực
      const sessions: Array<{
        classId: string;
        academicYear: string;
        sessionDate: Date;
        startTime: string;
        endTime: string;
        roomId: string | null;
        teacherId: string | null;
        status: string;
        notes: string;
        createdAt: Date;
      }> = [];

      // Lấy số thứ tự tiếp theo từ notes (nếu muốn hiển thị)
      let displayIndex = 1;
      const lastByCreated = await this.prisma.classSession.findFirst({
        where: { classId },
        orderBy: { createdAt: 'desc' },
      });
      if (lastByCreated) {
        const parsed = parseInt(
          lastByCreated.notes?.match(/Buổi (\d+)/)?.[1] || '0',
        );
        if (!isNaN(parsed) && parsed > 0) displayIndex = parsed + 1;
      }

      const overallStart = new Date(sessionStartDate);
      const overallEnd = new Date(sessionEndDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

      for (
        let d = new Date(overallStart);
        d <= overallEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfWeek = d.getDay();
        const dayName = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ][dayOfWeek];

        // Lấy tất cả schedule của ngày này (có thể nhiều ca)
        const daySchedules = scheduleDays.filter(
          (s: any) => (s.day || '').toLowerCase() === dayName,
        );
        if (daySchedules.length === 0) continue;

        for (const s of daySchedules) {
          // Nếu schedule có phạm vi startDate/endDate riêng, kiểm tra trong phạm vi
          const schedStart = s.startDate ? new Date(s.startDate) : overallStart;
          const schedEnd = s.endDate ? new Date(s.endDate) : overallEnd;
          if (d < schedStart || d > schedEnd) continue;

          const startTime: string = s.startTime;
          const endTime: string = s.endTime;
          if (!startTime || !endTime) continue;

          // Tính khoảng cách ngày giữa session và hiện tại
          const sessionDate = new Date(d);
          sessionDate.setHours(0, 0, 0, 0);
          const diffInDays = Math.ceil(
            (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Auto set status dựa trên khoảng cách
          // Đúng ngày (diffInDays === 0): happening (đang diễn ra)
          // Các ngày khác: has_not_happened (chưa diễn ra)
          const sessionStatus =
            diffInDays === 0 ? 'happening' : 'has_not_happened';

          sessions.push({
            classId,
            academicYear:
              classInfo.academicYear ||
              new Date().getFullYear().toString() +
                '-' +
                (new Date().getFullYear() + 1).toString(),
            sessionDate: new Date(d),
            startTime,
            endTime,
            roomId: classInfo.roomId,
            teacherId: classInfo.teacherId,
            status: sessionStatus,
            notes: `Buổi ${displayIndex++} - ${classInfo.name}`,
            createdAt: new Date(),
          });
        }
      }

      // Kiểm tra xem có buổi học nào trùng lặp không
      const existingSessions = await this.prisma.classSession.findMany({
        where: {
          classId,
          sessionDate: {
            gte: sessionStartDate,
            lte: sessionEndDate,
          },
        },
      });

      // Lọc bỏ các buổi học trùng lặp
      const filteredSessions = sessions.filter(
        (session) =>
          !existingSessions.some(
            (existing) =>
              existing.sessionDate.toDateString() ===
                session.sessionDate.toDateString() &&
              existing.startTime === session.startTime,
          ),
      );

      // ============================================================
      // LOGIC XỬ LÝ NGÀY NGHỈ: Kiểm tra và đánh dấu sessions trùng với holiday
      // ============================================================
      
      // Bước 1: Lấy tất cả các kỳ nghỉ đang active có overlap với khoảng thời gian generate sessions
      // Mục đích: Tìm các ngày nghỉ có thể ảnh hưởng đến các buổi học sắp được tạo
      const holidays = await this.prisma.holidayPeriod.findMany({
        where: {
          isActive: true, // Chỉ lấy các kỳ nghỉ đang active
          OR: [
            {
              AND: [
                { startDate: { lte: sessionEndDate } }, // Ngày bắt đầu holiday <= ngày kết thúc sessions
                { endDate: { gte: sessionStartDate } }, // Ngày kết thúc holiday >= ngày bắt đầu sessions
              ],
            },
          ],
        },
        select: { id: true, startDate: true, endDate: true, note: true }, // Chỉ lấy các field cần thiết
      });

      // Bước 2: Kiểm tra từng session xem có trùng với ngày nghỉ không
      // Nếu trùng thì đánh dấu status = 'day_off' và ghi lại lý do nghỉ (cancellationReason)
      const sessionsWithHolidayCheck = filteredSessions.map((session) => {
        // Lấy ngày của session và reset về 00:00:00 để so sánh chính xác (bỏ qua giờ phút)
        const sessionDate = new Date(session.sessionDate);
        sessionDate.setHours(0, 0, 0, 0);
        
        // Tìm kỳ nghỉ mà session này rơi vào (session date nằm trong khoảng startDate và endDate của holiday)
        const matchingHoliday = holidays.find((holiday) => {
          // Reset về 00:00:00 để so sánh chính xác
          const holidayStart = new Date(holiday.startDate);
          holidayStart.setHours(0, 0, 0, 0);
          const holidayEnd = new Date(holiday.endDate);
          holidayEnd.setHours(0, 0, 0, 0);
          
          // Kiểm tra xem session date có nằm trong khoảng holiday không
          return sessionDate >= holidayStart && sessionDate <= holidayEnd;
        });

        // Nếu tìm thấy holiday trùng với session này
        if (matchingHoliday) {
          // Trả về session với status = 'day_off' và ghi lại lý do nghỉ từ holiday.note
          return {
            ...session, // Giữ nguyên tất cả thông tin khác của session
            status: 'day_off', // Đánh dấu là ngày nghỉ
            cancellationReason: matchingHoliday.note, // Ghi lại lý do nghỉ (ví dụ: "Tết Nguyên Đán", "Quốc khánh", ...)
          };
        }

        // Nếu không trùng với holiday nào, giữ nguyên session như cũ
        return session;
      });

      // Bước 3: Tạo tất cả các buổi học vào database với trạng thái đã được check holiday
      const createdSessions = await this.prisma.classSession.createMany({
        data: sessionsWithHolidayCheck, // Dùng sessions đã được check và mark holiday
        skipDuplicates: true, // Bỏ qua các session trùng lặp nếu có
      });

      // Bước 4: Tạo links giữa sessions và holiday periods trong bảng HolidayPeriodSession
      // Mục đích: Tracking để biết session nào bị ảnh hưởng bởi holiday nào
      // Chỉ thực hiện nếu có holidays và có sessions được tạo thành công
      if (holidays.length > 0 && createdSessions.count > 0) {
        // Query lại tất cả sessions có status = 'day_off' trong khoảng thời gian này
        // (bao gồm cả các session vừa mới được tạo trong batch này)
        const dayOffSessions = await this.prisma.classSession.findMany({
          where: {
            classId, // Chỉ lấy sessions của lớp này
            sessionDate: {
              gte: sessionStartDate, // Từ ngày bắt đầu
              lte: sessionEndDate, // Đến ngày kết thúc
            },
            status: 'day_off', // Chỉ lấy các sessions đã được đánh dấu là ngày nghỉ
          },
          select: { id: true, sessionDate: true }, // Chỉ cần id và ngày để check
        });

        // Lấy tất cả các links đã tồn tại để tránh tạo duplicate
        const existingLinks = await this.prisma.holidayPeriodSession.findMany({
          where: {
            sessionId: { in: dayOffSessions.map(s => s.id) }, // Chỉ check links của các sessions này
          },
          select: { sessionId: true, holidayPeriodId: true },
        });

        // Duyệt qua từng session có status day_off để tạo link với holiday tương ứng
        const holidayLinks = [];
        for (const session of dayOffSessions) {
          // Reset ngày về 00:00:00 để so sánh chính xác
          const sessionDate = new Date(session.sessionDate);
          sessionDate.setHours(0, 0, 0, 0);
          
          // Tìm holiday mà session này thuộc về
          const matchingHoliday = holidays.find((holiday) => {
            const holidayStart = new Date(holiday.startDate);
            holidayStart.setHours(0, 0, 0, 0);
            const holidayEnd = new Date(holiday.endDate);
            holidayEnd.setHours(0, 0, 0, 0);
            
            // Kiểm tra session date có nằm trong khoảng holiday không
            return sessionDate >= holidayStart && sessionDate <= holidayEnd;
          });

          // Nếu tìm thấy holiday tương ứng
          if (matchingHoliday) {
            // Kiểm tra xem link này đã tồn tại chưa (tránh duplicate)
            const linkExists = existingLinks.some(
              (link) =>
                link.sessionId === session.id && // Cùng session
                link.holidayPeriodId === matchingHoliday.id, // Và cùng holiday
            );

            // Nếu link chưa tồn tại thì thêm vào danh sách để tạo
            if (!linkExists) {
              holidayLinks.push({
                holidayPeriodId: matchingHoliday.id, // ID của kỳ nghỉ
                sessionId: session.id, // ID của buổi học
              });
            }
          }
        }

        // Bước 5: Tạo hàng loạt các links vào bảng HolidayPeriodSession
        // Sử dụng upsert để tránh duplicate (nếu link đã tồn tại thì không tạo lại)
        if (holidayLinks.length > 0) {
          await Promise.all(
            holidayLinks.map((link) =>
              this.prisma.holidayPeriodSession.upsert({
                where: {
                  // Tìm link theo composite key (holidayPeriodId + sessionId)
                  holidayPeriodId_sessionId: {
                    holidayPeriodId: link.holidayPeriodId,
                    sessionId: link.sessionId,
                  },
                },
                create: link, // Nếu chưa có thì tạo mới
                update: {}, // Nếu đã có thì không update gì
              }),
            ),
          );
        }
      }

      // AUTO-UPDATE: Chuyển enrollment status từ not_been_updated → studying
      const updatedEnrollments = await this.prisma.enrollment.updateMany({
        where: {
          classId: classId,
          status: 'not_been_updated',
        },
        data: {
          status: 'studying',
        },
      });

      // Cập nhật lại ngày thực tế của lớp học (nếu có start/end trong body)
      if (startDate && endDate) {
        await this.prisma.class.update({
          where: { id: classId },
          data: {
            actualStartDate: new Date(startDate),
            actualEndDate: new Date(endDate),
          },
        });
      }

      return {
        success: true,
        data: {
          createdCount: createdSessions.count,
          totalSessions: sessions.length,
          filteredCount: filteredSessions.length,
          skippedCount: sessions.length - filteredSessions.length,
          startDate: sessionStartDate,
          endDate: sessionEndDate,
          sessions: filteredSessions,
          validationPassed: true,
          updatedEnrollments: updatedEnrollments.count,
          classInfo: {
            id: classInfo.id,
            name: classInfo.name,
            teacher: classInfo.teacher?.user.fullName,
            room: classInfo.room?.name,
            subject: classInfo.subject?.name,
            activeEnrollments: classInfo._count.enrollments,
            status: classInfo.status,
          },
        },
        message: `Tạo thành công ${createdSessions.count} buổi học cho lớp ${classInfo.name}. ${updatedEnrollments.count} học sinh đã chuyển sang trạng thái "Đang học".`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo buổi học',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy danh sách buổi học của lớp
  async getClassSessions(classId: string, query: any) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        startDate,
        endDate,
        academicYear,
        sortBy = 'sessionDate',
        sortOrder = 'desc',
      } = query;

      
      const skip = (page - 1) * limit;
      const take = parseInt(limit);

      // Build where clause
      const where: any = {
        classId: classId,
      };

      // Add academicYear filter - chỉ lấy sessions có cùng academicYear với lớp
      if (academicYear) {
        where.academicYear = academicYear;
      }

      // Add search filter
      if (search) {
        where.OR = [{ notes: { contains: search, mode: 'insensitive' } }];
      }

      // Add status filter
      if (status && status !== 'all') {
        where.status = status;
      }

      // Add date range filter
      if (startDate || endDate) {
        where.sessionDate = {};
        if (startDate) {
          where.sessionDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.sessionDate.lte = new Date(endDate);
        }
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === 'sessionDate') {
        orderBy.sessionDate = sortOrder;
      } else if (sortBy === 'startTime') {
        orderBy.startTime = sortOrder;
      } else if (sortBy === 'notes') {
        orderBy.notes = sortOrder;
      } else {
        orderBy.sessionDate = 'desc';
      }

      // Get sessions with pagination
      const [sessions, total] = await Promise.all([
        this.prisma.classSession.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            class: {
              select: {
                name: true,
                maxStudents: true,
                teacher: {
                  select: {
                    user: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
            teacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            substituteTeacher: {
              select: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            room: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                attendances: true,
              },
            },
          },
        }),
        this.prisma.classSession.count({ where }),
      ]);

      // Đếm enrollment cho từng session dựa trên enrolledAt <= sessionDate
      const sessionStudentCounts = await Promise.all(
        sessions.map((session) =>
          this.prisma.enrollment.count({
            where: {
              classId: classId,
              status: { notIn: ['stopped', 'withdrawn'] },
              enrolledAt: {
                lte: session.sessionDate, // Chỉ đếm những người đã enroll trước hoặc vào ngày của buổi học
              },
            },
          }),
        ),
      );

      // Transform data to match frontend expectations
      const transformedSessions = sessions.map((session, index) => {
        const studentCount = sessionStudentCounts[index] || 0;
        
        // Xác định giáo viên: nếu có giáo viên thay thế và ngày thay thế còn hiệu lực thì dùng giáo viên thay thế
        const isSubstitute = session.substituteTeacherId && 
                            session.substituteEndDate && 
                            new Date(session.substituteEndDate) >= session.sessionDate;
        const teacher = isSubstitute ? session.substituteTeacher : session.teacher;
        const teacherName = teacher?.user?.fullName || session.class.teacher?.user?.fullName || null;
        const originalTeacherName = session.teacher?.user?.fullName || session.class.teacher?.user?.fullName || null;
        
        return {
          id: session.id,
          topic: session.notes || `Buổi ${index + 1}`,
          name: session.notes || `Buổi ${index + 1}`,
          scheduledDate: session.sessionDate.toISOString().split('T')[0],
          sessionDate: session.sessionDate.toISOString().split('T')[0],
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          notes: session.notes,
          teacher: teacherName,
          teacherName: teacherName,
          substituteTeacher: session.substituteTeacher?.user?.fullName || null,
          originalTeacher: originalTeacherName,
          isSubstitute: isSubstitute,
          totalStudents: session.class.maxStudents || 0,
          studentCount: studentCount,
          attendanceCount: session._count.attendances || 0,
          absentCount: 0, // Will be calculated based on attendance
          notAttendedCount: studentCount - (session._count.attendances || 0),
          rating: 0, // Default rating since not available in schema
          roomName: session.room?.name || null,
        };
      });

      const totalPages = Math.ceil(total / take);

      return {
        success: true,
        data: transformedSessions,
        meta: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages,
        },
        message: 'Lấy danh sách buổi học thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách buổi học',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Xóa nhiều buổi học
  async deleteSessions(classId: string, sessionIds: string[]) {
    try {
      // Validate input
      if (
        !sessionIds ||
        !Array.isArray(sessionIds) ||
        sessionIds.length === 0
      ) {
        throw new HttpException(
          {
            success: false,
            message: 'Vui lòng chọn ít nhất 1 buổi học để xóa',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate class exists
      const classData = await this.prisma.class.findUnique({
        where: { id: classId },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      if (!classData) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Get sessions to delete
      const sessionsToDelete = await this.prisma.classSession.findMany({
        where: {
          id: { in: sessionIds },
          classId: classId,
        },
        select: {
          id: true,
          status: true,
          sessionDate: true,
          notes: true,
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });

      if (sessionsToDelete.length === 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy buổi học nào để xóa',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if any session has already ended or has attendances
      const invalidSessions = sessionsToDelete.filter(
        (session) => session.status === 'end' || session._count.attendances > 0,
      );

      if (invalidSessions.length > 0) {
        const invalidSessionNames = invalidSessions
          .map((s) => s.notes || 'Không có tên')
          .join(', ');
        throw new HttpException(
          {
            success: false,
            message: `Không thể xóa ${invalidSessions.length} buổi học đã kết thúc hoặc đã có điểm danh`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete sessions
      const deletedResult = await this.prisma.classSession.deleteMany({
        where: {
          id: { in: sessionIds },
          classId: classId,
        },
      });

      return {
        success: true,
        data: {
          deletedCount: deletedResult.count,
          requestedCount: sessionIds.length,
          classId: classId,
          className: classData.name,
        },
        message: `Đã xóa ${deletedResult.count} buổi học thành công`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa buổi học',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Xóa lớp học (soft delete bằng cách đổi status)
  async updateClassSchedules(id: string, body: any) {
    try {
      // Validate UUID
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Tìm lớp học và kiểm tra status
      const classData = await this.prisma.class.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          name: true,
        },
      });

      if (!classData) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Chỉ cho phép cập nhật khi lớp không ở trạng thái active
      if (classData.status === 'active') {
        throw new HttpException(
          {
            success: false,
            message:
              'Không thể cập nhật lịch học cho lớp đang hoạt động. Vui lòng chuyển lớp sang trạng thái khác trước.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Không cho phép cập nhật lịch nếu lớp đã có buổi học
      const existingSessions = await this.prisma.classSession.count({
        where: { classId: id },
      });
      if (existingSessions > 0) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp đã có buổi học, không thể cập nhật lịch học. Để thay đổi lịch học vui lòng xóa toàn bộ lịch học.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate schedule data
      // Nếu lớp là draft, cho phép xóa hết lịch học (set null)
      // Nếu không phải draft, bắt buộc phải có lịch học
      const isDraft = classData.status === ClassStatus.DRAFT;
      const hasSchedules =
        body.schedules &&
        Array.isArray(body.schedules) &&
        body.schedules.length > 0;

      if (!hasSchedules && !isDraft) {
        throw new HttpException(
          {
            success: false,
            message:
              'Dữ liệu lịch học không hợp lệ. Lớp không phải draft phải có lịch học.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Prepare update data
      let updateData: any = {};

      if (hasSchedules) {
        // Transform schedules to proper format
        const schedules = body.schedules.map((schedule: any) => ({
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        }));

        updateData.recurringSchedule = {
          schedules: schedules,
        };
      } else if (isDraft) {
        // Nếu là draft và không có schedules, set null
        updateData.recurringSchedule = null;
      }

      // Update class-level schedule
      const updatedClass = await this.prisma.class.update({
        where: { id },
        data: updateData,
        include: {
          subject: true,
          room: true,
          grade: true,
          feeStructure: true,
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Update teacher assignment if teacherId is provided
      if (body.teacherId) {
        // Check if teacher exists
        const teacher = await this.prisma.teacher.findUnique({
          where: { id: body.teacherId },
        });

        if (!teacher) {
          throw new HttpException(
            {
              success: false,
              message: 'Giáo viên không tồn tại',
            },
            HttpStatus.NOT_FOUND,
          );
        }

        // Update class with new teacher
        await this.prisma.class.update({
          where: { id },
          data: {
            teacherId: body.teacherId,
          },
        });
      }

      // Tạo message phù hợp
      let message = 'Cập nhật lịch học thành công';
      if (!hasSchedules && isDraft) {
        message =
          'Đã xóa lịch học. Lớp cần có lịch học trước khi chuyển sang trạng thái sẵn sàng (ready)';
      } else if (hasSchedules) {
        message = 'Cập nhật lịch học thành công';
      }

      return {
        success: true,
        message,
        data: updatedClass,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật lịch học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Xóa lớp học (soft delete bằng cách đổi status)
  async delete(id: string) {
    try {
      // Validate UUID
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check class exists
      const existingClass = await this.prisma.class.findUnique({
        where: { id },
        include: {
          enrollments: {
            where: {
              status: {
                in: ['not_been_updated', 'studying'],
              },
            },
          },
        },
      });

      if (!existingClass) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if there are active enrollments
      if (
        existingClass.enrollments.length > 0 &&
        existingClass.status === 'active'
      ) {
        throw new HttpException(
          {
            success: false,
            message: 'Không thể xóa lớp học có học sinh đang học',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if(existingClass.status === 'completed') {
        throw new HttpException(
          {
            success: false,
            message: 'Không thể xóa lớp học đã hoàn thành',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Soft delete by updating status
      await this.prisma.class.update({
        where: { id },
        data: { status: 'deleted' },
      });

      return {
        success: true,
        message: 'Xóa lớp học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Clone lớp học
  async cloneClass(id: string, cloneData: any) {
    try {
      // Validate UUID
      if (!this.isValidUUID(id)) {
        throw new HttpException(
          {
            success: false,
            message: 'ID lớp học không hợp lệ',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get source class with all relations
      const sourceClass = await this.prisma.class.findUnique({
        where: { id },
        include: {
          subject: true,
          grade: true,
          room: true,
          teacher: {
            include: {
              user: true,
            },
          },
        },
      });

      // Get enrollments separately if needed
      const enrollments = cloneData.cloneStudents
        ? await this.prisma.enrollment.findMany({
            where: {
              classId: id,
              status: {
                in: ['active', 'studying'],
              },
            },
            include: {
              student: true,
            },
          })
        : [];

      // // Get lessons separately if needed
      // const lessons = cloneData.cloneCurriculum
      //     ? await this.prisma.classLesson.findMany({
      //         where: { classId: id },
      //         include: {
      //             materials: true
      //         }
      //     })
      //     : [];

      if (!sourceClass) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học gốc',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check duplicate name
      const duplicateCheck = await this.checkDuplicateClassName(
        cloneData.name,
        sourceClass.academicYear,
      );

      if (duplicateCheck.isDuplicate) {
        throw new HttpException(
          {
            success: false,
            message: `Tên lớp "${cloneData.name}" đã tồn tại trong năm học ${sourceClass.academicYear}`,
            suggestedName: duplicateCheck.suggestedName,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate new code
      const newCode = generateQNCode('class');

      // Prepare new class data
      const newClassData: any = {
        classCode: newCode,
        name: cloneData.name,
        subjectId: sourceClass.subjectId,
        gradeId: sourceClass.gradeId,
        academicYear: sourceClass.academicYear,
        maxStudents: sourceClass.maxStudents,
        description: sourceClass.description,
        status: 'draft', // Always create as draft
        recurringSchedule: cloneData.cloneSchedule
          ? sourceClass.recurringSchedule
          : null,
        roomId: cloneData.cloneRoom ? sourceClass.roomId : null,
        teacherId: cloneData.cloneTeacher ? sourceClass.teacherId : null,
      };

      // Create new class
      const newClass = await this.prisma.class.create({
        data: newClassData,
        include: {
          subject: true,
          grade: true,
          room: true,
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Clone curriculum (lessons & materials)
      // if (cloneData.cloneCurriculum && lessons && lessons.length > 0) {
      //     for (const lesson of lessons) {
      //         const newLesson = await this.prisma.classLesson.create({
      //             data: {
      //                 title: lesson.title,
      //                 description: lesson.description,
      //                 lessonNumber: lesson.lessonNumber,
      //                 duration: lesson.duration,
      //                 objectives: lesson.objectives,
      //                 content: lesson.content,
      //                 classId: newClass.id
      //             }
      //         });

      //         // Clone materials for each lesson
      //         if (lesson.materials && lesson.materials.length > 0) {
      //             const materialData = lesson.materials.map((material: any) => ({
      //                 title: material.title,
      //                 type: material.type,
      //                 url: material.url,
      //                 description: material.description,
      //                 lessonId: newLesson.id
      //             }));

      //             // await this.prisma.classMaterial.createMany({
      //             //     data: materialData
      //             // });
      //         }
      //     }
      // }

      // Clone students (enrollments)
      if (cloneData.cloneStudents && enrollments && enrollments.length > 0) {
        const enrollmentData = enrollments.map((enrollment: any) => ({
          studentId: enrollment.studentId,
          classId: newClass.id,
          enrollmentDate: new Date(),
          status: 'active',
        }));

        await this.prisma.enrollment.createMany({
          data: enrollmentData,
        });
      }

      // Build response
      const responseData = {
        ...newClass,
        gradeName: newClass.grade?.name,
        gradeLevel: newClass.grade?.level,
        subjectName: newClass.subject?.name,
        roomName: newClass.room?.name,
        teacher: newClass.teacher
          ? {
              id: newClass.teacher.id,
              name: newClass.teacher.user?.fullName,
              email: newClass.teacher.user?.email,
              phone: newClass.teacher.user?.phone,
            }
          : null,
      };

      return {
        success: true,
        message: `Clone lớp học thành công! Lớp mới: ${newClass.name}`,
        data: responseData,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error('Error cloning class:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi clone lớp học',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Phân công giáo viên cho lớp
  async assignTeacher(classId: string, body: any) {
    try {
      // Validation
      if (!body.teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Thiếu thông tin bắt buộc: teacherId',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check class exists
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check teacher exists
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: body.teacherId },
      });

      if (!teacher) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy giáo viên',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if teacher is already assigned to this class
      if (classItem.teacherId === body.teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên đã được phân công cho lớp này',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra xem lớp đã có lịch học chưa
      // recurringSchedule có thể là: null, undefined, array rỗng [], hoặc object rỗng {}
      let hasSchedule = false;

      if (
        classItem.recurringSchedule !== null &&
        classItem.recurringSchedule !== undefined
      ) {
        if (Array.isArray(classItem.recurringSchedule)) {
          hasSchedule = classItem.recurringSchedule.length > 0;
        } else if (typeof classItem.recurringSchedule === 'object') {
          hasSchedule = Object.keys(classItem.recurringSchedule).length > 0;
        }
      }

      // Nếu chưa có lịch học thì không cho phép phán công giáo viên
      if (!hasSchedule) {
        throw new HttpException(
          {
            success: false,
            message: 'Vui lòng cập nhật lịch học trước khi phân công giáo viên',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Kiểm tra trùng lịch học với các lớp đã được phân công cho giáo viên
      const scheduleConflict = await this.checkTeacherScheduleConflict(
        body.teacherId,
        classId,
        classItem.recurringSchedule,
        classItem.roomId,
      );

      if (scheduleConflict.hasConflict) {
        throw new HttpException(
          {
            success: false,
            message: scheduleConflict.message,
            conflictDetails: scheduleConflict.conflictDetails,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Xác định status mới - nếu đã có lịch học và đang ở draft thì chuyển sang ready
      let newStatus = classItem.status;
      let successMessage = 'Phân công giáo viên thành công';

      if (classItem.status === ClassStatus.DRAFT) {
        newStatus = ClassStatus.READY;
        successMessage =
          'Phân công giáo viên thành công. Lớp đã sẵn sàng khai giảng';
      }

      // Update class with new teacher and status
      const updatedClass = await this.prisma.class.update({
        where: { id: classId },
        data: {
          teacherId: body.teacherId,
          status: newStatus,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // Gửi email thông báo cho giáo viên qua queue
      try {
        await this.emailNotificationService.sendClassAssignTeacherEmail(
          classId,
          body.teacherId,
        );
        console.log(
          `📧 Email phân công lớp đã được queue cho giáo viên ${body.teacherId} và lớp ${classId}`,
        );
      } catch (emailError) {
        // Log lỗi email nhưng không làm fail toàn bộ operation
        console.error('Failed to queue email notification:', emailError);
      }

      return {
        success: true,
        message: successMessage,
        data: updatedClass,
        metadata: {
          hasSchedule,
          statusChanged: classItem.status !== newStatus,
          oldStatus: classItem.status,
          newStatus: newStatus,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi phân công giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Xóa phân công giáo viên
  async removeTeacher(classId: string, teacherId: string) {
    try {
      // Check class exists
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if teacher is assigned to this class
      if (classItem.teacherId !== teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên không được phân công cho lớp này',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Gửi email hủy lớp cho giáo viên trước khi xóa
      try {
        await this.emailNotificationService.sendClassRemoveTeacherEmail(
          classId,
          teacherId,
          'Lớp học đã được hủy phân công',
        );
        console.log(
          `📧 Email hủy phân công lớp đã được queue cho giáo viên ${teacherId}`,
        );
      } catch (emailError) {
        console.error(
          'Failed to queue cancellation email to teacher:',
          emailError,
        );
      }

      // Remove teacher assignment and chuyển status về draft
      const updatedClass = await this.prisma.class.update({
        where: { id: classId },
        data: {
          teacherId: null,
          status: ClassStatus.DRAFT,
        },
      });

      return {
        success: true,
        message:
          'Xóa phân công giáo viên thành công. Lớp đã chuyển về trạng thái nháp',
        data: updatedClass,
        metadata: {
          statusChanged: classItem.status !== ClassStatus.DRAFT,
          oldStatus: classItem.status,
          newStatus: ClassStatus.DRAFT,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa phân công giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy danh sách giáo viên của lớp
  async getTeachersByClass(classId: string) {
    try {
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const teachers = classItem.teacher
        ? [
            {
              teacherId: classItem.teacher.id,
              userId: classItem.teacher.userId,
              ...classItem.teacher.user,
            },
          ]
        : [];

      return {
        success: true,
        message: 'Lấy danh sách giáo viên thành công',
        data: teachers,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Chuyển giáo viên cho lớp học
  async transferTeacher(classId: string, body: any, requestedBy: string) {
    try {
      // Validation
      if (!body.replacementTeacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Thiếu thông tin bắt buộc: replacementTeacherId',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!body.reason || !body.reason.trim()) {
        throw new HttpException(
          {
            success: false,
            message: 'Vui lòng nhập lý do chuyển giáo viên',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check class exists
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          enrollments: {
            where: {
              status: {
                in: ['not_been_updated', 'studying'],
              },
            },
          },
          _count: {
            select: {
              sessions: true,
            },
          },
        },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if class has current teacher
      if (!classItem.teacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp học chưa có giáo viên được phân công',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if replacement teacher exists and is different
      if (classItem.teacherId === body.replacementTeacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên thay thế phải khác giáo viên hiện tại',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const replacementTeacher = await this.prisma.teacher.findUnique({
        where: { id: body.replacementTeacherId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              isActive: true,
            },
          },
        },
      });

      if (!replacementTeacher) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy giáo viên thay thế',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Check replacement teacher is active
      if (!replacementTeacher.user.isActive) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên thay thế đang không hoạt động',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if replacement teacher can teach the subject
      if (classItem.subjectId) {
        const classSubject = await this.prisma.subject.findUnique({
          where: { id: classItem.subjectId },
        });

        if (
          classSubject &&
          replacementTeacher.subjects &&
          Array.isArray(replacementTeacher.subjects) &&
          !replacementTeacher.subjects.includes(classSubject.name)
        ) {
          throw new HttpException(
            {
              success: false,
              message: `Giáo viên thay thế không thể dạy môn ${classSubject.name}`,
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Check if class has active students
      const activeStudentsCount = classItem.enrollments.length;
      if (activeStudentsCount === 0 && classItem.status !== 'draft') {
        // Warning but allow if class is in draft
      }

      // Check if there are pending/completed transfers for this class
      const pendingTransfer = await this.prisma.teacherClassTransfer.findFirst({
        where: {
          fromClassId: classId,
          status: 'pending',
        },
      });

      if (pendingTransfer) {
        throw new HttpException(
          {
            success: false,
            message: 'Lớp học đang có yêu cầu chuyển giáo viên đang chờ xử lý',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate substituteEndDate if provided
      if (body.substituteEndDate) {
        const substituteEndDate = new Date(body.substituteEndDate);
        if (body.effectiveDate) {
          const effectiveDate = new Date(body.effectiveDate);
          if (substituteEndDate <= effectiveDate) {
            throw new HttpException(
              {
                success: false,
                message: 'Ngày kết thúc giáo viên thay thế phải sau ngày bắt đầu có hiệu lực',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      const effectiveDate = body.effectiveDate
        ? new Date(body.effectiveDate)
        : new Date();
      const substituteEndDate = body.substituteEndDate
        ? new Date(body.substituteEndDate)
        : null;

      // Validate conflicts & compatibility before applying
      const conflictResult = await this.validateTransferConflict(classId, {
        replacementTeacherId: body.replacementTeacherId,
        effectiveDate: effectiveDate.toISOString().split('T')[0],
        substituteEndDate: substituteEndDate
          ? substituteEndDate.toISOString().split('T')[0]
          : undefined,
      });

      if (conflictResult?.data?.inactive) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên thay thế đang không hoạt động',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (conflictResult?.data?.incompatibleSubject) {
        throw new HttpException(
          {
            success: false,
            message:
              conflictResult?.data?.subjectMessage || 'Giáo viên thay thế không phù hợp môn học',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (conflictResult?.data?.hasConflict) {
        throw new HttpException(
          {
            success: false,
            message: 'Giáo viên thay thế đang có xung đột lịch trong khoảng áp dụng',
            data: conflictResult.data.conflicts,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Apply transfer immediately within transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const transfer = await tx.teacherClassTransfer.create({
          data: {
            teacherId: classItem.teacherId,
            fromClassId: classId,
            replacementTeacherId: body.replacementTeacherId,
            reason: body.reason.trim(),
            reasonDetail: body.reasonDetail?.trim() || null,
            requestedBy: requestedBy,
            status: 'approved',
            approvedBy: requestedBy,
            approvedAt: new Date(),
            effectiveDate: effectiveDate,
            substituteEndDate: substituteEndDate,
            notes: body.notes?.trim() || null,
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            replacementTeacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            fromClass: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (substituteEndDate) {
          await tx.classSession.updateMany({
            where: {
              classId: classId,
              sessionDate: {
                gte: effectiveDate,
                lte: substituteEndDate,
              },
            },
            data: {
              teacherId: body.replacementTeacherId,
              substituteTeacherId: classItem.teacherId,
              substituteEndDate: substituteEndDate,
            },
          });
        } else {
          await tx.classSession.updateMany({
            where: {
              classId: classId,
              sessionDate: {
                gte: effectiveDate,
              },
            },
            data: {
              teacherId: body.replacementTeacherId,
              substituteTeacherId: null,
              substituteEndDate: null,
            },
          });

          await tx.class.update({
            where: { id: classId },
            data: {
              teacherId: body.replacementTeacherId,
            },
          });
        }

        return transfer;
      });

      return {
        success: true,
        message: substituteEndDate
          ? 'Chuyển giáo viên tạm thời thành công'
          : 'Chuyển giáo viên thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi chuyển giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Validate conflict for teacher transfer
  async validateTransferConflict(
    classId: string,
    params: { replacementTeacherId: string; effectiveDate?: string; substituteEndDate?: string },
  ) {
    try {
      const { replacementTeacherId, effectiveDate, substituteEndDate } = params;

      // Verify class and teacher exist
      const [classItem, teacher] = await Promise.all([
        this.prisma.class.findUnique({ where: { id: classId }, include: { subject: true } }),
        this.prisma.teacher.findUnique({ where: { id: replacementTeacherId }, include: { user: true } }),
      ]);

      if (!classItem) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy lớp học' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (!teacher) {
        throw new HttpException(
          { success: false, message: 'Không tìm thấy giáo viên thay thế' },
          HttpStatus.NOT_FOUND,
        );
      }

      // Subject compatibility (reuse assign logic)
      let incompatibleSubject = false;
      let subjectMessage: string | null = null;
      if (classItem.subjectId && classItem.subject?.name && Array.isArray((teacher as any).subjects)) {
        const canTeach = (teacher as any).subjects.includes(classItem.subject.name);
        if (!canTeach) {
          incompatibleSubject = true;
          subjectMessage = `Giáo viên không thể dạy môn ${classItem.subject.name}`;
        }
      }

      // Active status check
      if (teacher.user && (teacher.user as any).isActive === false) {
        return {
          success: true,
          message: 'Giáo viên đang không hoạt động',
          data: { hasConflict: true, conflicts: [], incompatibleSubject, subjectMessage, inactive: true },
        };
      }

      // Determine date range
      const startDate = effectiveDate ? new Date(effectiveDate) : new Date();
      const endDate = substituteEndDate ? new Date(substituteEndDate) : null;

      // Fetch sessions of this class in range
      const classSessions = await this.prisma.classSession.findMany({
        where: {
          classId: classId,
          sessionDate: endDate
            ? { gte: startDate, lte: endDate }
            : { gte: startDate },
        },
        select: {
          id: true,
          sessionDate: true,
          startTime: true,
          endTime: true,
        },
        orderBy: { sessionDate: 'asc' },
      });

      if (classSessions.length === 0) {
        return {
          success: true,
          message: 'Không có buổi học trong khoảng thời gian áp dụng',
          data: { hasConflict: false, conflicts: [], incompatibleSubject, subjectMessage },
        };
      }

      // Check conflicts for replacement teacher on same dates with time overlap
      const conflicts: any[] = [];
      for (const s of classSessions) {
        const conflict = await this.prisma.classSession.findFirst({
          where: {
            sessionDate: s.sessionDate,
            teacherId: replacementTeacherId,
            OR: [
              { AND: [{ startTime: { lte: s.startTime } }, { endTime: { gt: s.startTime } }] },
              { AND: [{ startTime: { lt: s.endTime } }, { endTime: { gte: s.endTime } }] },
              { AND: [{ startTime: { gte: s.startTime } }, { endTime: { lte: s.endTime } }] },
            ],
          },
          select: { id: true, classId: true, startTime: true, endTime: true },
        });
        if (conflict) {
          conflicts.push({
            targetSessionId: s.id,
            date: s.sessionDate,
            targetStart: s.startTime,
            targetEnd: s.endTime,
            conflictSessionId: conflict.id,
            conflictClassId: conflict.classId,
            conflictStart: conflict.startTime,
            conflictEnd: conflict.endTime,
          });
        }
      }

      return {
        success: true,
        message: conflicts.length ? 'Phát hiện xung đột lịch' : 'Không có xung đột',
        data: { hasConflict: conflicts.length > 0, conflicts, incompatibleSubject, subjectMessage },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, message: 'Lỗi kiểm tra xung đột', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy danh sách transfer requests
  async getTransferRequests(params: any) {
    try {
      const {
        status,
        classId,
        teacherId,
        page = 1,
        limit = 10,
      } = params;

      const where: any = {};
      if (status) where.status = status;
      if (classId) where.fromClassId = classId;
      if (teacherId) where.teacherId = teacherId;

      const skip = (page - 1) * limit;

      const [transfers, total] = await Promise.all([
        this.prisma.teacherClassTransfer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            replacementTeacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            fromClass: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.teacherClassTransfer.count({ where }),
      ]);

      return {
        success: true,
        data: transfers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Lấy danh sách yêu cầu chuyển giáo viên thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách yêu cầu chuyển giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Duyệt yêu cầu chuyển giáo viên
  async approveTransfer(
    transferId: string,
    body: any,
    approvedBy: string,
  ) {
    try {
      // Find transfer request
      const transfer = await this.prisma.teacherClassTransfer.findUnique({
        where: { id: transferId },
        include: {
          fromClass: {
            select: {
              id: true,
              teacherId: true,
              name: true,
            },
          },
          teacher: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!transfer) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy yêu cầu chuyển giáo viên',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (transfer.status !== 'pending' && transfer.status !== 'auto_created') {
        throw new HttpException(
          {
            success: false,
            message: 'Yêu cầu này đã được xử lý',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ensure replacementTeacherId is set
      const replacementTeacherId =
        body.replacementTeacherId || transfer.replacementTeacherId;
      if (!replacementTeacherId) {
        throw new HttpException(
          {
            success: false,
            message: 'Chưa chọn giáo viên thay thế',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update substituteEndDate if provided in body
      const substituteEndDate = body.substituteEndDate
        ? new Date(body.substituteEndDate)
        : transfer.substituteEndDate;

      // Validate substituteEndDate if both dates exist
      if (substituteEndDate && transfer.effectiveDate) {
        if (substituteEndDate <= transfer.effectiveDate) {
          throw new HttpException(
            {
              success: false,
              message:
                'Ngày kết thúc giáo viên thay thế phải sau ngày bắt đầu có hiệu lực',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Update transfer status
        const updatedTransfer = await tx.teacherClassTransfer.update({
          where: { id: transferId },
          data: {
            status: 'approved',
            approvedBy: approvedBy,
            approvedAt: new Date(),
            replacementTeacherId: replacementTeacherId,
            substituteEndDate: substituteEndDate,
            notes: body.notes || transfer.notes,
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            replacementTeacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            fromClass: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Get effective date
        const effectiveDate = transfer.effectiveDate
          ? new Date(transfer.effectiveDate)
          : new Date();

        // Update ClassSessions
        if (substituteEndDate) {
          // Temporary transfer: Update sessions in the date range
          // Set teacherId to replacement, keep original teacher in substituteTeacherId
          await tx.classSession.updateMany({
            where: {
              classId: transfer.fromClassId,
              sessionDate: {
                gte: effectiveDate,
                lte: substituteEndDate,
              },
              status: {
                not: 'end', // Don't update completed sessions
              },
            },
            data: {
              teacherId: replacementTeacherId,
              substituteTeacherId: transfer.teacherId,
              substituteEndDate: substituteEndDate,
            },
          });
        } else {
          // Permanent transfer: Update all future sessions and class
          await tx.classSession.updateMany({
            where: {
              classId: transfer.fromClassId,
              sessionDate: {
                gte: effectiveDate,
              },
              status: {
                not: 'end',
              },
            },
            data: {
              teacherId: replacementTeacherId,
            },
          });

          // Update class teacher
          await tx.class.update({
            where: { id: transfer.fromClassId },
            data: {
              teacherId: replacementTeacherId,
            },
          });
        }

        return updatedTransfer;
      });

      return {
        success: true,
        message: 'Yêu cầu chuyển giáo viên đã được duyệt thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi duyệt yêu cầu chuyển giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Từ chối yêu cầu chuyển giáo viên
  async rejectTransfer(transferId: string, body: any, rejectedBy: string) {
    try {
      const transfer = await this.prisma.teacherClassTransfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy yêu cầu chuyển giáo viên',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (transfer.status !== 'pending' && transfer.status !== 'auto_created') {
        throw new HttpException(
          {
            success: false,
            message: 'Yêu cầu này đã được xử lý',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedTransfer = await this.prisma.teacherClassTransfer.update({
        where: { id: transferId },
        data: {
          status: 'rejected',
          approvedBy: rejectedBy,
          approvedAt: new Date(),
          notes: body.reason || body.notes || transfer.notes,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          replacementTeacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          fromClass: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Yêu cầu chuyển giáo viên đã bị từ chối',
        data: updatedTransfer,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi từ chối yêu cầu chuyển giáo viên',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy thống kê lớp học
  async getStats(classId: string) {
    try {
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          enrollments: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const totalStudents = classItem.enrollments.length;
      const activeStudents = classItem.enrollments.filter(
        (e) => e.status === 'not_been_updated' || e.status === 'studying',
      ).length;
      const completedStudents = classItem.enrollments.filter(
        (e) => e.status === 'graduated',
      ).length;
      const withdrawnStudents = classItem.enrollments.filter(
        (e) => e.status === 'stopped',
      ).length;

      return {
        success: true,
        message: 'Lấy thống kê thành công',
        data: {
          totalStudents,
          activeStudents,
          completedStudents,
          withdrawnStudents,
          maxStudents: classItem.maxStudents,
          availableSlots: classItem.maxStudents
            ? classItem.maxStudents - activeStudents
            : null,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thống kê',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy dashboard data đầy đủ
  async getDashboard(classId: string) {
    try {
      console.log(classId);
      // Validate class exists
      const classItem = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            select: {
              id: true,
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          enrollments: {
            where: {
              status: {
                in: ['not_been_updated', 'studying', 'graduated'],
              },
            },
            select: {
              id: true,
              status: true,
              student: {
                select: {
                  id: true,
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!classItem) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy lớp học',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // 1. Số giáo viên
      const teachersCount = classItem.teacher ? 1 : 0;

      // 2. Số học sinh
      const studentsCount = classItem.enrollments.length;

      // 3. Số buổi học đã diễn ra
      const completedSessions = await this.prisma.classSession.count({
        where: {
          classId: classId,
          status: 'end',
        },
      });

      // 4. Doanh thu từ học phí đã thanh toán (chỉ tính cho lớp này)
      const revenue = await this.prisma.payment.aggregate({
        where: {
          status: 'completed',
          feeRecordPayments: {
            some: {
              feeRecord: {
                classId: classId, // Chỉ tính fee records của lớp này
              },
            },
          },
        },
        _sum: {
          amount: true,
        },
      });

      // 5. Thống kê điểm danh
      const attendanceStats =
        await this.prisma.studentSessionAttendance.groupBy({
          by: ['status'],
          where: {
            session: {
              classId: classId,
            },
          },
          _count: {
            status: true,
          },
        });

      const attendance = {
        onTime:
          attendanceStats.find((a) => a.status === 'present')?._count.status ||
          0,
        late: 0, // Schema không có late status, để mặc định 0
        excusedAbsence:
          attendanceStats.find((a) => a.status === 'excused')?._count.status ||
          0,
        unexcusedAbsence:
          attendanceStats.find((a) => a.status === 'absent')?._count.status ||
          0,
        notMarked: 0, // Sẽ tính sau
      };

      // Tính số chưa điểm danh
      const totalPossibleAttendances = completedSessions * studentsCount;
      const totalMarkedAttendances =
        attendance.onTime +
        attendance.late +
        attendance.excusedAbsence +
        attendance.unexcusedAbsence;
      attendance.notMarked = totalPossibleAttendances - totalMarkedAttendances;

      // 6. Đánh giá trung bình (chưa có trong schema, để mặc định)
      const rating = 0;
      const reviews = 0;

      return {
        success: true,
        message: 'Lấy dashboard thành công',
        data: {
          teachers: teachersCount,
          students: studentsCount,
          lessons: completedSessions,
          revenue: revenue._sum.amount || 0,
          rating,
          reviews,
          attendance,
          homework: {
            assigned: 0,
            submitted: 0,
            notSubmitted: 0,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy dashboard',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Legacy methods (keep for backward compatibility)
  async getClassByTeacherId(query: any, teacherId: string) {
    const { status, page = 1, limit = 10, search } = query;

    const where: any = {
      teacherId: teacherId,
      status: { not: 'deleted' },
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total before pagination
    const total = await this.prisma.class.count({ where });

    const classes = await this.prisma.class.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        room: true,
        subject: true,
        grade: true,
        feeStructure: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to match frontend expectations
    const transformedClasses = classes.map((cls) => ({
      id: cls.id,
      code: cls.classCode,
      name: cls.name,
      subject: cls.subject?.name || '',
      students: cls._count.enrollments,
      schedule: DataTransformer.formatScheduleArray(cls.recurringSchedule),
      status: cls.status,
      startDate:
        cls.actualStartDate?.toISOString().split('T')[0] ||
        cls.expectedStartDate?.toISOString().split('T')[0] ||
        '',
      endDate: cls.actualEndDate?.toISOString().split('T')[0] || '',
      room: cls.room?.name || 'Chưa xác định',
      description: cls.description || '',
      teacherId: cls.teacherId,
      gradeName: cls.grade?.name || '',
      feeStructureName: cls.feeStructure?.name || '',
    }));

    return {
      data: transformedClasses,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      message: 'Lấy danh sách lớp học thành công ',
    };
  }

  async getClassDetail(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        room: true,
        subject: true,
        grade: true,
        feeStructure: true,
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!classItem) {
      return null;
    }

    return {
      id: classItem.id,
      code: classItem.classCode,
      name: classItem.name,
      subject: classItem.subject?.name || '',
      students: classItem._count.enrollments,
      schedule: classItem.recurringSchedule,
      status: classItem.status,
      startDate:
        classItem.actualStartDate?.toISOString().split('T')[0] ||
        classItem.expectedStartDate?.toISOString().split('T')[0] ||
        '',
      endDate: classItem.actualEndDate?.toISOString().split('T')[0] || '',
      room: classItem.room?.name || 'Chưa xác định',
      description: classItem.description || '',
      teacherId: classItem.teacherId,
      teacherName: classItem.teacher?.user?.fullName || '',
      gradeName: classItem.grade?.name || '',
      feeStructureName: classItem.feeStructure?.name || '',
    };
  }

  async createClass(body: any) {
    return this.prisma.class.create({ data: body });
  }

  // Helper method
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Kiểm tra xung đột lịch học giữa lớp mới và các lớp đã được phân công cho giáo viên
   * Conflict khi: cùng ngày và thời gian overlap (không cần kiểm tra roomId)
   */
  private async checkTeacherScheduleConflict(
    teacherId: string,
    newClassId: string,
    newClassSchedule: any,
    newClassRoomId: string | null,
  ): Promise<{ hasConflict: boolean; message: string; conflictDetails?: any[] }> {
    // Nếu lớp mới không có lịch học thì không cần kiểm tra
    if (!newClassSchedule) {
      return { hasConflict: false, message: '' };
    }

    // Lấy danh sách các lớp mà giáo viên đã được phân công (status: ready hoặc active)
    const assignedClasses = await this.prisma.class.findMany({
      where: {
        teacherId,
        status: { in: ['ready', 'active', 'suspended'] },
        id: { not: newClassId }, // Loại trừ lớp đang muốn phân công
      },
      select: {
        id: true,
        name: true,
        classCode: true,
        recurringSchedule: true,
        roomId: true,
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    if (assignedClasses.length === 0) {
      return { hasConflict: false, message: '' };
    }

    // Parse lịch học của lớp mới
    const newSchedules = this.parseRecurringSchedule(newClassSchedule, newClassRoomId);
    if (newSchedules.length === 0) {
      return { hasConflict: false, message: '' };
    }

    // Kiểm tra xung đột với từng lớp đã được phân công
    const conflicts: any[] = [];

    for (const assignedClass of assignedClasses) {
      if (!assignedClass.recurringSchedule) {
        continue;
      }

      const assignedSchedules = this.parseRecurringSchedule(assignedClass.recurringSchedule, assignedClass.roomId);

      // So sánh từng slot lịch học của lớp mới với từng slot của lớp đã được phân công
      for (const newSchedule of newSchedules) {
        for (const assignedSchedule of assignedSchedules) {
          // Kiểm tra cùng ngày trong tuần
          if (this.normalizeDayOfWeek(newSchedule.day) === this.normalizeDayOfWeek(assignedSchedule.day)) {
            // Kiểm tra overlap thời gian cứ trùng lịch là conflict
            if (this.isTimeOverlapping(newSchedule.startTime, newSchedule.endTime, assignedSchedule.startTime, assignedSchedule.endTime)) {
              conflicts.push({
                assignedClass: {
                  id: assignedClass.id,
                  name: assignedClass.name,
                  classCode: assignedClass.classCode,
                  subject: assignedClass.subject?.name || 'N/A',
                },
                conflictDay: this.getDayName(newSchedule.day),
                conflictTime: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                assignedTime: `${assignedSchedule.startTime} - ${assignedSchedule.endTime}`,
              });
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      // Tạo message chi tiết
      const conflictMessages = conflicts.map(
        (c) =>
          `Lớp "${c.assignedClass.name}" (${c.assignedClass.subject}) - ${c.conflictDay}: ${c.conflictTime}`,
      );
      const message = `Lịch học của lớp này trùng với các lớp giáo viên đã được phân công:\n${conflictMessages.join('\n')}`;

      return {
        hasConflict: true,
        message,
        conflictDetails: conflicts,
      };
    }

    return { hasConflict: false, message: '' };
  }

  /**
   * Parse recurringSchedule từ nhiều định dạng khác nhau
   * 
   * Hỗ trợ các format:
   * 1. Object có property schedules (format chính):
   *    { schedules: [{ day: "monday", startTime: "18:00", endTime: "20:00", roomId: "..." }, ...] }
   * 2. Array trực tiếp:
   *    [{ day: "monday", startTime: "18:00", endTime: "20:00", roomId: "..." }, ...]
   * 
   * roomId có thể có trong schedule item hoặc dùng classRoomId (roomId của class)
   */
  private parseRecurringSchedule(
    schedule: any,
    classRoomId: string | null = null,
  ): Array<{ day: string; startTime: string; endTime: string; roomId: string | null }> {
    if (!schedule) {
      return [];
    }

    // Trường hợp 1: Object có property schedules (format chính)
    // Format: { schedules: [{ day: "monday", startTime: "18:00", endTime: "20:00", roomId: "..." }, ...] }
    if (typeof schedule === 'object' && schedule.schedules && Array.isArray(schedule.schedules)) {
      return schedule.schedules.map((s: any) => ({
        day: s.day || s.dayOfWeek || '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        roomId: s.roomId || classRoomId || null, // Ưu tiên roomId trong schedule, nếu không có thì dùng classRoomId
      }));
    }

    // Trường hợp 2: Array trực tiếp (backward compatibility)
    // Format: [{ day: "monday", startTime: "18:00", endTime: "20:00", roomId: "..." }, ...]
    if (Array.isArray(schedule)) {
      return schedule.map((s: any) => ({
        day: s.day || s.dayOfWeek || '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        roomId: s.roomId || classRoomId || null, // Ưu tiên roomId trong schedule, nếu không có thì dùng classRoomId
      }));
    }

    return [];
  }

  /**
   * Chuẩn hóa dayOfWeek về cùng format (lowercase)
   */
  private normalizeDayOfWeek(day: string): string {
    if (!day) return '';
    return day.toLowerCase().trim();
  }

  /**
   * Kiểm tra hai khoảng thời gian có overlap (trùng) không
   * 
   * Công thức: start1 < end2 && end1 > start2
   * 
   * Giải thích:
   * - Hai khoảng thời gian overlap khi chúng có phần chung
   * - Điều kiện 1: start1 < end2 → Khoảng 1 bắt đầu trước khi khoảng 2 kết thúc
   * - Điều kiện 2: end1 > start2 → Khoảng 1 kết thúc sau khi khoảng 2 bắt đầu
   * - Cả hai điều kiện đều đúng → OVERLAP
   */
  private isTimeOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    // Convert time string (HH:mm) to minutes for comparison
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };

    const start1Min = toMinutes(start1);
    const end1Min = toMinutes(end1);
    const start2Min = toMinutes(start2);
    const end2Min = toMinutes(end2);

    // Overlap condition: start1 < end2 && end1 > start2
    // Hai khoảng overlap khi: khoảng 1 bắt đầu trước khi khoảng 2 kết thúc
    // VÀ khoảng 1 kết thúc sau khi khoảng 2 bắt đầu
    return start1Min < end2Min && end1Min > start2Min;
  }

  /**
   * Lấy tên ngày tiếng Việt
   */
  private getDayName(day: string): string {
    const dayNames: { [key: string]: string } = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật',
    };

    const normalizedDay = this.normalizeDayOfWeek(day);
    return dayNames[normalizedDay] || day;
  }
}
