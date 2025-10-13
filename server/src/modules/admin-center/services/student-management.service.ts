import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class StudentManagementService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createStudent() {
    // TODO: Implement create student logic
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
}
