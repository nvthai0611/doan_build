import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import hash from 'src/utils/hasing.util';

@Injectable()
export class StudentManagementService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createStudent(createStudentData: {
    fullName: string;
    username: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    parentId?: string;
    schoolId: string; // Required field
    password?: string;
  }) {
    try {
      // Check if user with username already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { username: createStudentData.username }
      });

      if (existingUser) {
        throw new Error('Username đã được sử dụng');
      }

      // Validate parent if parentId is provided
      if (createStudentData.parentId) {
        const parent = await this.prisma.parent.findUnique({
          where: { id: createStudentData.parentId }
        });
        if (!parent) {
          throw new Error('Phụ huynh không tồn tại');
        }
      }

      // Generate student code
      const studentCount = await this.prisma.student.count();
      const studentCode = `ST${(studentCount + 1).toString().padStart(6, '0')}`;

      // Default password if not provided
      const defaultPassword = createStudentData.password || '123456';

      // Create user first
      const newUser = await this.prisma.user.create({
        data: {
          email: `${createStudentData.username}@qne.edu.vn`, // Generate email from username
          username: createStudentData.username,
          fullName: createStudentData.fullName,
          phone: createStudentData.phone,
          gender: createStudentData.gender || 'OTHER',
          birthDate: createStudentData.birthDate ? new Date(createStudentData.birthDate) : null,
          password: hash.make(defaultPassword) , // In production, hash this password
          isActive: true,
          role: 'student'
        }
      });

      // Validate schoolId exists
      if (createStudentData.schoolId) {
        const school = await this.prisma.school.findUnique({
          where: { id: createStudentData.schoolId }
        });
        if (!school) {
          throw new Error('Trường học không tồn tại');
        }
      }

      // Create student
      const newStudent = await this.prisma.student.create({
        data: {
          userId: newUser.id,
          studentCode: studentCode,
          address: createStudentData.address,
          grade: createStudentData.grade,
          parentId: createStudentData.parentId,
          schoolId: createStudentData.schoolId
        },
        include: {
          user: {
            select: {
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
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          }
        }
      });

      return {
        data: {
          id: newStudent.id,
          studentCode: newStudent.studentCode,
          address: newStudent.address,
          grade: newStudent.grade,
          createdAt: newStudent.createdAt,
          updatedAt: newStudent.updatedAt,
          user: newStudent.user,
          parent: newStudent.parent ? {
            id: newStudent.parent.id,
            user: newStudent.parent.user
          } : null,
          school: newStudent.school
        },
        message: 'Tạo tài khoản học viên thành công'
      };

    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error(`Error creating student: ${error.message}`);
    }
  }

  async findParentByEmail(email: string) {
    try {
      if (!email || !email.trim()) {
        throw new Error('Email không được để trống');
      }

      const parent = await this.prisma.parent.findFirst({
        where: {
          user: {
            email: email.trim().toLowerCase()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
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
      console.error('Error finding parent by email:', error);
      throw new Error(`Error finding parent: ${error.message}`);
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
    limit: number = 10,
  ) {
  
  
  try {
    // Validate and sanitize input parameters
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const offset = (validPage - 1) * validLimit;

    const where: any = {};

    // Handle enrollment status filter
    if (status?.trim() && status !== "all") {
      where.enrollments = {
        some: {
          status: status.trim()
        }
      };
    }

    // Handle course/subject filter  
    if (course?.trim() && course !== "Tất cả khóa học" && course !== "all") {
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
    if (birthMonth?.trim() && birthMonth !== "all") {
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
    if (birthYear?.trim() && birthYear !== "all") {
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
    if (gender?.trim() && gender !== "all") {
      where.user = {
        ...where.user,
        gender: gender.trim()
      };
    }

    // Handle account status filter (isActive)
    if (accountStatus?.trim() && accountStatus !== "all") {
      const isActive = accountStatus === "active";
      where.user = {
        ...where.user,
        isActive: isActive
      };
    }

    // Handle customer connection filter (has parent)
    if (customerConnection?.trim() && customerConnection !== "all") {
      if (customerConnection === "with_parent") {
        where.parentId = {
          not: null
        };
      } else if (customerConnection === "without_parent") {
        where.parentId = null;
      }
    }

    // Handle search filter (must be last to not interfere with user filters)
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
        {
          user: {
            email: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
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


    // Execute queries in parallel
    const [students, totalCount] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          user: {
            select: {
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
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          },
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
                  }
                }
              },
              teacherClassAssignment: {
                include: {
                  teacher: {
                    include: {
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

    // Format response
    const formattedStudents = students.map((student) => {
      return {
        id: student.id,
        studentCode: student.studentCode,
        address: student.address,
        grade: student.grade,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        user: student.user,
        parent: student.parent ? {
          id: student.parent.id,
          user: student.parent.user
        } : null,
        school: student.school,
        enrollments: student.enrollments.map((enrollment: any) => ({
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          finalGrade: enrollment.finalGrade,
          completionStatus: enrollment.completionStatus,
          class: enrollment.class,
          teacher: enrollment.teacherClassAssignment?.teacher || null
        })),
        password: undefined
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
    throw new Error(`Error fetching students: ${error.message}`);
  }
}

  async getCountByStatus() {
    try {
      // Aggregate counts by enrollment status
      const enrollmentCounts = await this.prisma.enrollment.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const total = enrollmentCounts.reduce((sum, item) => sum += item._count.status, 0)
      return {
        data: {
          total,
          counts: enrollmentCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {})
        },
        message: 'Student counts by status retrieved successfully'
      }
    } catch (error) {
      console.error('Error fetching student counts by status:', error);
      throw new Error(`Error fetching student counts by status: ${error.message}`);
    }
  }

  async toggleStudentStatus(studentId: string, currentUserId?: string) {
    try {
      // Validate student exists
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
        throw new Error('Student not found');
      }

      // Toggle the isActive status
      const newStatus = !existingStudent.user.isActive;

      // Update the user's isActive status
      const updatedUser = await this.prisma.user.update({
        where: { id: existingStudent.user.id },
        data: {
          isActive: newStatus,
          updatedAt: new Date()
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          gender: true,
          birthDate: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Get updated student data
      const updatedStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
              isActive: true,
              gender: true,
              birthDate: true,
              createdAt: true,
              updatedAt: true
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          }
        }
      });

      return {
        data: {
          id: updatedStudent.id,
          studentCode: updatedStudent.studentCode,
          address: updatedStudent.address,
          grade: updatedStudent.grade,
          createdAt: updatedStudent.createdAt,
          updatedAt: updatedStudent.updatedAt,
          user: updatedStudent.user,
          parent: updatedStudent.parent ? {
            id: updatedStudent.parent.id,
            user: updatedStudent.parent.user
          } : null,
          school: updatedStudent.school,
          previousStatus: existingStudent.user.isActive,
          newStatus: newStatus
        },
        message: `Student account has been ${newStatus ? 'activated' : 'deactivated'} successfully`
      };

    } catch (error) {
      console.error('Error toggling student status:', error);
      throw new Error(`Error updating student status: ${error.message}`);
    }
  }

  async updateStudentStatus(studentId: string, isActive: boolean, currentUserId?: string) {
    try {
      // Validate student exists
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
        throw new Error('Student not found');
      }

      // Update the user's isActive status
      const updatedUser = await this.prisma.user.update({
        where: { id: existingStudent.user.id },
        data: {
          isActive: isActive,
          updatedAt: new Date()
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          isActive: true,
          gender: true,
          birthDate: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Get updated student data
      const updatedStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
              isActive: true,
              gender: true,
              birthDate: true,
              createdAt: true,
              updatedAt: true
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          }
        }
      });

      return {
        data: {
          id: updatedStudent.id,
          studentCode: updatedStudent.studentCode,
          address: updatedStudent.address,
          grade: updatedStudent.grade,
          createdAt: updatedStudent.createdAt,
          updatedAt: updatedStudent.updatedAt,
          user: updatedStudent.user,
          parent: updatedStudent.parent ? {
            id: updatedStudent.parent.id,
            user: updatedStudent.parent.user
          } : null,
          school: updatedStudent.school,
          previousStatus: existingStudent.user.isActive,
          newStatus: isActive
        },
        message: `Student account has been ${isActive ? 'activated' : 'deactivated'} successfully`
      };

    } catch (error) {
      console.error('Error updating student status:', error);
      throw new Error(`Error updating student status: ${error.message}`);
    }
  }

  async updateStudent(studentId: string, updateStudentData: {
    fullName?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    schoolId?: string;
  }) {
    try {
      // Validate student exists
      const existingStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true
        }
      });

      if (!existingStudent) {
        throw new Error('Học viên không tồn tại');
      }

      // Validate schoolId if provided
      if (updateStudentData.schoolId) {
        const school = await this.prisma.school.findUnique({
          where: { id: updateStudentData.schoolId }
        });
        if (!school) {
          throw new Error('Trường học không tồn tại');
        }
      }

      // Prepare user update data
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
        userUpdateData.birthDate = updateStudentData.birthDate ? new Date(updateStudentData.birthDate) : null;
      }

      // Prepare student update data
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

      // Update user data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await this.prisma.user.update({
          where: { id: existingStudent.userId },
          data: {
            ...userUpdateData,
            updatedAt: new Date()
          }
        });
      }

      // Update student data if there are changes
      if (Object.keys(studentUpdateData).length > 0) {
        await this.prisma.student.update({
          where: { id: studentId },
          data: {
            ...studentUpdateData,
            updatedAt: new Date()
          }
        });
      }

      // Get updated student data
      const updatedStudent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: {
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
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          }
        }
      });

      return {
        data: {
          id: updatedStudent.id,
          studentCode: updatedStudent.studentCode,
          address: updatedStudent.address,
          grade: updatedStudent.grade,
          createdAt: updatedStudent.createdAt,
          updatedAt: updatedStudent.updatedAt,
          user: updatedStudent.user,
          parent: updatedStudent.parent ? {
            id: updatedStudent.parent.id,
            user: updatedStudent.parent.user
          } : null,
          school: updatedStudent.school
        },
        message: 'Cập nhật thông tin học viên thành công'
      };

    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error(`Error updating student: ${error.message}`);
    }
  }

  async updateStudentParent(studentId: string, parentId: string | null) {
    try {
      // Validate student exists
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
        throw new Error('Học viên không tồn tại');
      }

      // Validate parent if parentId is provided
      if (parentId) {
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
          throw new Error('Phụ huynh không tồn tại');
        }

        // Check if parent is active
        if (!parent.user) {
          throw new Error('Tài khoản phụ huynh không hợp lệ');
        }
      }

      // Update student's parent
      const updatedStudent = await this.prisma.student.update({
        where: { id: studentId },
        data: {
          parentId: parentId,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
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
            }
          },
          parent: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true
            }
          }
        }
      });

      return {
        data: {
          id: updatedStudent.id,
          studentCode: updatedStudent.studentCode,
          address: updatedStudent.address,
          grade: updatedStudent.grade,
          createdAt: updatedStudent.createdAt,
          updatedAt: updatedStudent.updatedAt,
          user: updatedStudent.user,
          parent: updatedStudent.parent ? {
            id: updatedStudent.parent.id,
            user: updatedStudent.parent.user
          } : null,
          school: updatedStudent.school
        },
        message: parentId 
          ? 'Liên kết phụ huynh thành công' 
          : 'Hủy liên kết phụ huynh thành công'
      };

    } catch (error) {
      console.error('Error updating student parent:', error);
      throw new Error(`Error updating student parent: ${error.message}`);
    }
  }

  
}
