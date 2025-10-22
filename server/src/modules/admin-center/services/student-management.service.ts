import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { generateQNCode } from 'src/utils/function.util';
import hash from 'src/utils/hasing.util';
import { checkId } from 'src/utils/validate.util';

interface CreateStudentDto {
  fullName: string;
  username: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  grade?: string;
  parentId?: string;
  schoolId: string;
  password?: string;
}

interface UpdateStudentDto {
  fullName?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  address?: string;
  grade?: string;
  schoolId?: string;
}

export interface StudentResponse {
  data: any;
  message: string;
}

const STUDENT_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatar: true,
  isActive: true,
  gender: true,
  birthDate: true,
  createdAt: true,
  updatedAt: true
};

const PARENT_INCLUDE = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true
    }
  }
};

const SCHOOL_SELECT = {
  id: true,
  name: true,
  address: true,
  phone: true
};

@Injectable()
export class StudentManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private formatStudentResponse(student: any) {
    return {
      id: student.id,
      studentCode: student.studentCode,
      address: student.address,
      grade: student.grade,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: student.user,
      parent: student.parent
        ? {
            id: student.parent.id,
            user: student.parent.user
          }
        : null,
      school: student.school
    };
  }

  async createStudent(createStudentData: CreateStudentDto): Promise<StudentResponse> {
    try {
      // Validate school exists
      if (!checkId(createStudentData.schoolId)) {
        throw new HttpException(
          'Invalid school ID',
          HttpStatus.BAD_REQUEST
        );
      }

      const school = await this.prisma.school.findUnique({
        where: { id: createStudentData.schoolId }
      });

      if (!school) {
        throw new HttpException(
          'Trường học không tồn tại',
          HttpStatus.NOT_FOUND
        );
      }

      // Check if username already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { username: createStudentData.username }
      });

      if (existingUser) {
        throw new HttpException(
          'Username đã được sử dụng',
          HttpStatus.CONFLICT
        );
      }

      // Validate parent if provided
      if (createStudentData.parentId) {
        if (!checkId(createStudentData.parentId)) {
          throw new HttpException(
            'Invalid parent ID',
            HttpStatus.BAD_REQUEST
          );
        }

        const parent = await this.prisma.parent.findUnique({
          where: { id: createStudentData.parentId }
        });

        if (!parent) {
          throw new HttpException(
            'Phụ huynh không tồn tại',
            HttpStatus.NOT_FOUND
          );
        }
      }

      // Generate student code
      const studentCount = await this.prisma.student.count();
      let studentCode = generateQNCode('student');

      //checkcode tồn tại chưa
      while( true){
        const existingStudentWithCode = await this.prisma.student.findFirst({
          where: { studentCode: studentCode }
        });

        if(!existingStudentWithCode){
          break;
        }
        studentCode = generateQNCode('student');
      }

      const defaultPassword = createStudentData.password || '123456';

      // Create user and student in transaction
      const newStudent = await this.prisma.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            email: `${createStudentData.username}@qne.edu.vn`,
            username: createStudentData.username,
            fullName: createStudentData.fullName,
            phone: createStudentData.phone,
            gender: createStudentData.gender || 'OTHER',
            birthDate: createStudentData.birthDate
              ? new Date(createStudentData.birthDate)
              : null,
            password: hash.make(defaultPassword),
            isActive: true,
            role: 'student'
          }
        });

        return prisma.student.create({
          data: {
            userId: newUser.id,
            studentCode,
            address: createStudentData.address,
            grade: createStudentData.grade,
            parentId: createStudentData.parentId,
            schoolId: createStudentData.schoolId
          },
          include: {
            user: { select: STUDENT_USER_SELECT },
            parent: { include: PARENT_INCLUDE },
            school: { select: SCHOOL_SELECT }
          }
        });
      });

      return {
        data: this.formatStudentResponse(newStudent),
        message: 'Tạo tài khoản học viên thành công'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error creating student:', error);
      throw new HttpException(
        'Error creating student',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findParentByEmail(email: string): Promise<StudentResponse> {
    try {
      if (!email?.trim()) {
        throw new HttpException(
          'Email không được để trống',
          HttpStatus.BAD_REQUEST
        );
      }

      const parent = await this.prisma.parent.findFirst({
        where: {
          user: {
            email: email.trim().toLowerCase()
          }
        },
        include: {
          user: { select: STUDENT_USER_SELECT },
          students: {
            select: {
              id: true,
              studentCode: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!parent) {
        return {
          data: null,
          message: 'Không tìm thấy phụ huynh với email này'
        };
      }

      return {
        data: {
          id: parent.id,
          user: parent.user,
          students: parent.students,
          createdAt: parent.createdAt,
          updatedAt: parent.updatedAt
        },
        message: 'Tìm thấy thông tin phụ huynh'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error finding parent by email:', error);
      throw new HttpException(
        'Error finding parent',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllStudents(
    status?: string,
    search?: string,
    birthMonth?: string,
    birthYear?: string,
    gender?: string,
    accountStatus?: string,
    customerConnection?: string,
    course?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<StudentResponse> {
    try {
      const validPage = Math.max(1, Number(page) || 1);
      const validLimit = Math.max(1, Math.min(100, Number(limit) || 10));
      const offset = (validPage - 1) * validLimit;

      const where: any = {};

      // Handle enrollment status filter
      if (status?.trim() && status !== 'all') {
        where.enrollments = {
          some: {
            status: status.trim()
          }
        };
      }

      // Handle course/subject filter
      if (course?.trim() && course !== 'Tất cả khóa học' && course !== 'all') {
        where.enrollments = {
          some: {
            ...where.enrollments?.some,
            class: {
              subjectId: course.trim()
            }
          }
        };
      }

      // Handle birth month filter
      if (birthMonth?.trim() && birthMonth !== 'all') {
        const monthNum = parseInt(birthMonth);
        if (monthNum >= 1 && monthNum <= 12) {
          where.user = {
            ...where.user,
            AND: [
              ...(where.user?.AND || []),
              {
                birthDate: {
                  not: null
                }
              },
              {
                birthDate: {
                  gte: new Date(2000, monthNum - 1, 1),
                  lt: new Date(2000, monthNum, 1)
                }
              }
            ]
          };
        }
      }

      // Handle birth year filter
      if (birthYear?.trim() && birthYear !== 'all') {
        const yearNum = parseInt(birthYear);
        if (yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
          where.user = {
            ...where.user,
            AND: [
              ...(where.user?.AND || []),
              {
                birthDate: {
                  gte: new Date(yearNum, 0, 1),
                  lt: new Date(yearNum + 1, 0, 1)
                }
              }
            ]
          };
        }
      }

      // Handle gender filter
      if (gender?.trim() && gender !== 'all') {
        where.user = {
          ...where.user,
          gender: gender.trim()
        };
      }

      // Handle account status filter
      if (accountStatus?.trim() && accountStatus !== 'all') {
        const isActive = accountStatus === 'active';
        where.user = {
          ...where.user,
          isActive
        };
      }

      // Handle customer connection filter
      if (customerConnection?.trim() && customerConnection !== 'all') {
        where.parentId =
          customerConnection === 'with_parent'
            ? { not: null }
            : null;
      }

      // Handle search filter
      if (search?.trim()) {
        const searchTerm = search.trim();
        where.OR = [
          {
            user: {
              fullName: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          // đa sua o day
          {
            AND: [
              {
                user: {
                  email: {
                    not: null
                  }
                }
              },
              {
                user: {
                  email: {
                    contains: searchTerm,
                    mode: 'insensitive'
                  }
                }
              }
            ]
          },
          {
            user: {
              phone: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            studentCode: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ];
      }

      const [students, totalCount] = await Promise.all([
        this.prisma.student.findMany({
          where,
          include: {
            user: { select: STUDENT_USER_SELECT },
            parent: { include: PARENT_INCLUDE },
            school: { select: SCHOOL_SELECT },
            enrollments: {
              include: {
                class: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        code: true
                      }
                    },
                    teacher: {
                      select: {
                        id: true,
                        user: {
                          select: {
                            id: true,
                            fullName: true,
                            email: true
                          }
                        }
                      }
                    }
                  }
                }
              },
              orderBy: {
                enrolledAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: validLimit
        }),
        this.prisma.student.count({ where })
      ]);

      const formattedStudents = students.map((student) => {
        const formattedStudent = this.formatStudentResponse(student);
        return {
          ...formattedStudent,
          enrollments: student.enrollments?.map((enrollment: any) => ({
            id: enrollment.id,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
            finalGrade: enrollment.finalGrade,
            completionStatus: enrollment.completionStatus,
            class: enrollment.class,
            teacher: enrollment.class.teacher || null
          })) || []
        };
      });

      const totalPages = Math.ceil(totalCount / validLimit);

      return {
        data: {
          students: formattedStudents,
          pagination: {
            currentPage: validPage,
            totalPages,
            totalCount,
            limit: validLimit,
            hasNextPage: validPage < totalPages,
            hasPrevPage: validPage > 1
          }
        },
        message: 'Students retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new HttpException(
        'Error fetching students',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCountByStatus(): Promise<StudentResponse> {
    try {
      const enrollmentCounts = await this.prisma.enrollment.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const total = enrollmentCounts.reduce(
        (sum, item) => (sum += item._count.status),
        0
      );

      return {
        data: {
          total,
          counts: enrollmentCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {})
        },
        message: 'Student counts by status retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching student counts by status:', error);
      throw new HttpException(
        'Error fetching student counts',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async toggleStudentStatus(
    studentId: string,
    currentUserId?: string
  ): Promise<StudentResponse> {
    if (!checkId(studentId)) {
      throw new HttpException(
        'Invalid student ID',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              isActive: true
            }
          }
        }
      });

      if (!existingStudent) {
        throw new HttpException(
          'Student not found',
          HttpStatus.NOT_FOUND
        );
      }

      const newStatus = !existingStudent.user.isActive;

      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          user: {
            update: {
              isActive: newStatus,
              updatedAt: new Date()
            }
          },
          updatedAt: new Date()
        },
        include: {
          user: { select: STUDENT_USER_SELECT },
          parent: { include: PARENT_INCLUDE },
          school: { select: SCHOOL_SELECT }
        }
      });

      return {
        data: {
          ...this.formatStudentResponse(updatedStudent),
          previousStatus: existingStudent.user.isActive,
          newStatus
        },
        message: `Student account has been ${
          newStatus ? 'activated' : 'deactivated'
        } successfully`
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error toggling student status:', error);
      throw new HttpException(
        'Error updating student status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStudentStatus(
    studentId: string,
    isActive: boolean,
    currentUserId?: string
  ): Promise<StudentResponse> {
    if (!checkId(studentId)) {
      throw new HttpException(
        'Invalid student ID',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              isActive: true
            }
          }
        }
      });

      if (!existingStudent) {
        throw new HttpException(
          'Student not found',
          HttpStatus.NOT_FOUND
        );
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          user: {
            update: {
              isActive,
              updatedAt: new Date()
            }
          },
          updatedAt: new Date()
        },
        include: {
          user: { select: STUDENT_USER_SELECT },
          parent: { include: PARENT_INCLUDE },
          school: { select: SCHOOL_SELECT }
        }
      });

      return {
        data: {
          ...this.formatStudentResponse(updatedStudent),
          previousStatus: existingStudent.user.isActive,
          newStatus: isActive
        },
        message: `Student account has been ${
          isActive ? 'activated' : 'deactivated'
        } successfully`
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error updating student status:', error);
      throw new HttpException(
        'Error updating student status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStudent(
    studentId: string,
    updateStudentData: UpdateStudentDto
  ): Promise<StudentResponse> {
    if (!checkId(studentId)) {
      throw new HttpException(
        'Invalid student ID',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });

      if (!existingStudent) {
        throw new HttpException(
          'Học viên không tồn tại',
          HttpStatus.NOT_FOUND
        );
      }

      // Validate schoolId if provided
      if (updateStudentData.schoolId) {
        if (!checkId(updateStudentData.schoolId)) {
          throw new HttpException(
            'Invalid school ID',
            HttpStatus.BAD_REQUEST
          );
        }

        const school = await this.prisma.school.findUnique({
          where: { id: updateStudentData.schoolId }
        });

        if (!school) {
          throw new HttpException(
            'Trường học không tồn tại',
            HttpStatus.NOT_FOUND
          );
        }
      }

      const userUpdateData: any = {};
      if (updateStudentData.fullName !== undefined) {
        userUpdateData.fullName = updateStudentData.fullName;
      }
      if (updateStudentData.phone !== undefined) {
        userUpdateData.phone = updateStudentData.phone;
      }
      if (updateStudentData.gender !== undefined) {
        userUpdateData.gender = updateStudentData.gender;
      }
      if (updateStudentData.birthDate !== undefined) {
        userUpdateData.birthDate = updateStudentData.birthDate
          ? new Date(updateStudentData.birthDate)
          : null;
      }

      const studentUpdateData: any = {};
      if (updateStudentData.address !== undefined) {
        studentUpdateData.address = updateStudentData.address;
      }
      if (updateStudentData.grade !== undefined) {
        studentUpdateData.grade = updateStudentData.grade;
      }
      if (updateStudentData.schoolId !== undefined) {
        studentUpdateData.schoolId = updateStudentData.schoolId;
      }

      if (Object.keys(userUpdateData).length > 0) {
        userUpdateData.updatedAt = new Date();
        await this.prisma.user.update({
          where: { id: existingStudent.userId },
          data: userUpdateData
        });
      }

      if (Object.keys(studentUpdateData).length > 0) {
        studentUpdateData.updatedAt = new Date();
        await this.prisma.student.update({
          where: { id: studentId },
          data: studentUpdateData
        });
      }

      const updatedStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: { select: STUDENT_USER_SELECT },
          parent: { include: PARENT_INCLUDE },
          school: { select: SCHOOL_SELECT }
        }
      });

      return {
        data: this.formatStudentResponse(updatedStudent),
        message: 'Cập nhật thông tin học viên thành công'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error updating student:', error);
      throw new HttpException(
        'Error updating student',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateStudentParent(
    studentId: string,
    parentId: string | null
  ): Promise<StudentResponse> {
    if (!checkId(studentId)) {
      throw new HttpException(
        'Invalid student ID',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      });

      if (!existingStudent) {
        throw new HttpException(
          'Học viên không tồn tại',
          HttpStatus.NOT_FOUND
        );
      }

      // Validate parent if provided
      if (parentId) {
        if (!checkId(parentId)) {
          throw new HttpException(
            'Invalid parent ID',
            HttpStatus.BAD_REQUEST
          );
        }

        const parent = await this.prisma.parent.findUnique({
          where: { id: parentId },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        });

        if (!parent) {
          throw new HttpException(
            'Phụ huynh không tồn tại',
            HttpStatus.NOT_FOUND
          );
        }

        if (!parent.user) {
          throw new HttpException(
            'Tài khoản phụ huynh không hợp lệ',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          parentId,
          updatedAt: new Date()
        },
        include: {
          user: { select: STUDENT_USER_SELECT },
          parent: { include: PARENT_INCLUDE },
          school: { select: SCHOOL_SELECT }
        }
      });

      return {
        data: this.formatStudentResponse(updatedStudent),
        message: parentId
          ? 'Liên kết phụ huynh thành công'
          : 'Hủy liên kết phụ huynh thành công'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error updating student parent:', error);
      throw new HttpException(
        'Error updating student parent',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
