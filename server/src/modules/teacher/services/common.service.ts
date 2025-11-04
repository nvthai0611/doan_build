import { PrismaService } from "src/db/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách học sinh trong lớp thông qua classId và teacherId
   */
  async getListStudentOfClass(classId: string, teacherId: string) {
    try {
      const students = await this.prisma.enrollment.findMany({
        where: {
          classId: classId,
          status: 'studying', // Only students currently studying
          student: {
            user: {
              isActive: true, // User active
            },
          },
          class: {
            status: 'active', // Class active
            teacherId: teacherId, // Teacher assignment (quan hệ trực tiếp)
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
                  avatar: true,
                  gender: true,
                  birthDate: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                },
              },
              grades: {
                select: {
                  id: true,
                  score: true,
                  assessment: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      date: true,
                    },
                  },
                },
                orderBy: {
                  gradedAt: 'desc',
                },
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              academicYear: true,
              grade: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                },
              },
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
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
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      });

      return {
        success: true,
        data: students,
        message: `Lấy danh sách học sinh thành công - ${students.length} học sinh đang học`,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách học sinh: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách buổi học theo classId và năm học hiện tại
   */
  async getClassSessionsByAssignment(classId: string, academicYear?: string) {
    try {
      // Lấy thông tin class để verify
      const classInfo = await this.prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, academicYear: true }
      });

      if (!classInfo) {
        return {
          success: false,
          message: 'Không tìm thấy lớp học'
        };
      }

      const sessions = await this.prisma.classSession.findMany({
        where: {
          classId: classId,
          academicYear: academicYear || classInfo.academicYear
        },
        select: {
          id: true,
          sessionDate: true,
          startTime: true,
          endTime: true,
          status: true,
          room: { select: { name: true } }
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }]
      });

      return {
        success: true,
        data: sessions,
        message: `Lấy danh sách buổi học thành công (${sessions.length})`
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách buổi học: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết thông tin học sinh trong lớp
   */
  async getDetailStudentOfClass(studentId: string, classId?: string, teacherId?: string) {
    try {
      const whereCondition: any = {
        studentId: studentId,
        status: 'studying', // Only active studying enrollment
        student: {
          user: {
            isActive: true, // User active
          },
        },
        class: {
          status: 'active', // Class active
        },
      };

      if (classId) {
        whereCondition.classId = classId;
      }

      if (teacherId) {
        whereCondition.class.teacherId = teacherId;
      }

      const studentDetail = await this.prisma.enrollment.findFirst({
        where: whereCondition,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                  gender: true,
                  birthDate: true,
                  createdAt: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  phone: true,
                },
              },
              parent: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
              attendances: {
                include: {
                  session: {
                    select: {
                      id: true,
                      sessionDate: true,
                      startTime: true,
                      endTime: true,
                      status: true,
                    },
                  },
                },
                orderBy: {
                  recordedAt: 'desc',
                },
                take: 10, // Lấy 10 lần điểm danh gần nhất
              },
              grades: {
                include: {
                  assessment: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      maxScore: true,
                      date: true,
                    },
                  },
                },
                orderBy: {
                  gradedAt: 'desc',
                },
                take: 10, // Lấy 10 điểm gần nhất
              },
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              description: true,
              academicYear: true,
              expectedStartDate: true,
              actualStartDate: true,
              actualEndDate: true,
              grade: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                },
              },
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  description: true,
                },
              },
              teacher: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!studentDetail) {
        return {
          success: false,
          message: 'Không tìm thấy học sinh trong lớp này',
        };
      }

      return {
        success: true,
        data: studentDetail,
        message: 'Lấy thông tin chi tiết học sinh thành công',
      };
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy thông tin chi tiết học sinh: ${error.message}`,
      );
    }
  }

  /**
   * Lấy thống kê tổng quan về lớp học
   */
  async getClassStatistics(classId: string, teacherId: string) {
    try {
      const [totalStudents, attendanceStats, gradeStats] = await Promise.all([
        // Tổng số học sinh active
        this.prisma.enrollment.count({
          where: {
            classId: classId,
            status: 'studying',
            student: {
              user: {
                isActive: true,
              },
            },
            class: {
              status: 'active',
              teacherId: teacherId,
            },
          },
        }),
        // Thống kê điểm danh (chỉ học sinh active)
        this.prisma.studentSessionAttendance.groupBy({
          by: ['status'],
          where: {
            student: {
              user: {
                isActive: true,
              },
              enrollments: {
                some: {
                  classId: classId,
                  status: 'studying',
                  class: {
                    status: 'active',
                    teacherId: teacherId,
                  },
                },
              },
            },
          },
          _count: {
            status: true,
          },
        }),
        // Thống kê điểm số (chỉ học sinh active)
        this.prisma.studentAssessmentGrade.aggregate({
          where: {
            student: {
              user: {
                isActive: true,
              },
              enrollments: {
                some: {
                  classId: classId,
                  status: 'studying',
                  class: {
                    status: 'active',
                    teacherId: teacherId,
                  },
                },
              },
            },
          },
          _avg: {
            score: true,
          },
          _max: {
            score: true,
          },
          _min: {
            score: true,
          },
        }),
      ]);
      return {
        success: true,
        data: {
          totalStudents,
          attendanceStats,
          gradeStats,
        },
        message: `Lấy thống kê lớp học thành công - ${totalStudents} học sinh đang học`,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thống kê lớp học: ${error.message}`);
    }
  }

  async getTeacherInfo(teacherId: string) {
    try {
      if (!teacherId) {
        throw new Error('ID giáo viên không hợp lệ');
      }

      const teacher = await this.prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          classes: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Không tìm thấy giáo viên',
        };
      }

      return {
        success: true,
        data: teacher,
        message: 'Lấy thông tin giáo viên thành công',
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin giáo viên: ${error.message}`);
    }
  }
}
