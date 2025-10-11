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
      if (status?.trim()) {
        where.enrollments = {
          some: {
            status: status.trim() // active, completed, withdrawn, suspended
          }
        };
      }
      if(!status){
        where.enrollments = {
          some: {
            status: undefined
          }
        };
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
            status: enrollment.status, // enrollment status: active, completed, withdrawn, suspended
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
            finalGrade: enrollment.finalGrade,
            completionStatus: enrollment.completionStatus,
            class: enrollment.class,
            teacher: enrollment.teacherClassAssignment?.teacher || null
          })),
          // Remove password field
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
      return enrollmentCounts
    } catch (error) {
      console.error('Error fetching student counts by status:', error);
      throw new Error(`Error fetching student counts by status: ${error.message}`);
    }
  }
}
