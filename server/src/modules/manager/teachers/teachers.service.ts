import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  async findAll() {
    try {
      const teachers = await this.prisma.teacher.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true,
              phone: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          classes: {
            include: {
              subject: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  description: true,
                }
              },
              room: {
                select: {
                  id: true,
                  name: true,
                  capacity: true,
                  equipment: true,
                  isActive: true,
                }
              },
              enrollments: {
                select: {
                  id: true,
                  status: true,
                  enrolledAt: true,
                  student: {
                    select: {
                      id: true,
                      studentCode: true,
                      grade: true,
                      user: {
                        select: {
                          fullName: true,
                          email: true,
                          phone: true,
                        }
                      }
                    }
                  }
                }
              },
              _count: {
                select: {
                  enrollments: true,
                  sessions: true,
                  assessments: true,
                }
              }
            }
          },
          contracts: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              salary: true,
              status: true,
              terms: true,
              createdAt: true,
            }
          },
          payrolls: {
            select: {
              id: true,
              periodStart: true,
              periodEnd: true,
              teachingHours: true,
              hourlyRate: true,
              bonuses: true,
              deductions: true,
              totalAmount: true,
              status: true,
            },
            orderBy: {
              periodStart: 'desc'
            },
            take: 5 // Lấy 5 bảng lương gần nhất
          },
          documents: {
            select: {
              id: true,
              docType: true,
              docUrl: true,
              uploadedAt: true,
            }
          },
          leaveRequests: {
            select: {
              id: true,
              requestType: true,
              startDate: true,
              endDate: true,
              reason: true,
              status: true,
              createdAt: true,
              approvedAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10 // Lấy 10 đơn nghỉ phép gần nhất
          },
          _count: {
            select: {
              classes: true,
              contracts: true,
              payrolls: true,
              documents: true,
              leaveRequests: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: teachers,
        total: teachers.length,
        message: 'Lấy danh sách giáo viên thành công'
      };
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Có lỗi xảy ra khi lấy danh sách giáo viên',
        error: error.message
      };
    }
  }

  async findOne(id: string) {
    try {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true,
              phone: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          classes: {
            include: {
              subject: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  description: true,
                }
              },
              room: {
                select: {
                  id: true,
                  name: true,
                  capacity: true,
                  equipment: true,
                  isActive: true,
                }
              },
              enrollments: {
                select: {
                  id: true,
                  status: true,
                  enrolledAt: true,
                  student: {
                    select: {
                      id: true,
                      studentCode: true,
                      grade: true,
                      user: {
                        select: {
                          fullName: true,
                          email: true,
                          phone: true,
                        }
                      }
                    }
                  }
                }
              },
              _count: {
                select: {
                  enrollments: true,
                  sessions: true,
                  assessments: true,
                }
              }
            }
          },
          contracts: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              salary: true,
              status: true,
              terms: true,
              createdAt: true,
            }
          },
          payrolls: {
            select: {
              id: true,
              periodStart: true,
              periodEnd: true,
              teachingHours: true,
              hourlyRate: true,
              bonuses: true,
              deductions: true,
              totalAmount: true,
              status: true,
            },
            orderBy: {
              periodStart: 'desc'
            }
          },
          documents: {
            select: {
              id: true,
              docType: true,
              docUrl: true,
              uploadedAt: true,
            }
          },
          leaveRequests: {
            select: {
              id: true,
              requestType: true,
              startDate: true,
              endDate: true,
              reason: true,
              status: true,
              createdAt: true,
              approvedAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              classes: true,
              contracts: true,
              payrolls: true,
              documents: true,
              leaveRequests: true,
            }
          }
        }
      });

      if (!teacher) {
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy giáo viên'
        };
      }

      return {
        success: true,
        data: teacher,
        message: 'Lấy thông tin giáo viên thành công'
      };
    } catch (error) {
      console.error('Error fetching teacher:', error);
      return {
        success: false,
        data: null,
        message: 'Có lỗi xảy ra khi lấy thông tin giáo viên',
        error: error.message
      };
    }
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  async remove(id: string) {
    return `This action removes a #${id} teacher`;
  }

  async getTeacherContracts(teacherId: string) {
    try {
      // Verify teacher exists
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new Error('Không tìm thấy giáo viên');
      }

      // Get all contracts for this teacher
      const contracts = await this.prisma.contractUpload.findMany({
        where: {
          teacherId: teacherId,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      return contracts;
    } catch (error) {
      throw error;
    }
  }

  async deleteTeacherContract(teacherId: string, contractId: string) {
    try {
      // Verify teacher exists
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new Error('Không tìm thấy giáo viên');
      }

      // Verify contract exists and belongs to this teacher
      const contract = await this.prisma.contractUpload.findFirst({
        where: {
          id: contractId,
          teacherId: teacherId,
        },
      });

      if (!contract) {
        throw new Error('Không tìm thấy hợp đồng hoặc hợp đồng không thuộc về giáo viên này');
      }

      // Delete the contract
      await this.prisma.contractUpload.delete({
        where: {
          id: contractId,
        },
      });

      return {
        success: true,
        message: 'Xóa hợp đồng thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
