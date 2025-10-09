import { PrismaService } from "src/db/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Lấy danh sách học sinh trong lớp thông qua teacher class assignment
     */
    async getListStudentOfClass(assignmentId: string) {
        try {
            const students = await this.prisma.enrollment.findMany({
                where: {
                    teacherClassAssignmentId: assignmentId,
                    status: 'active',  // Chỉ lấy enrollment active
                    completedAt: null,  // Chưa hoàn thành khóa học
                    student: {
                        user: {
                            isActive: true  // Chỉ lấy học sinh có user active
                        }
                    }
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
                                    birthDate: true
                                }
                            },
                            school: {
                                select: {
                                    id: true,
                                    name: true
                                }
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
                                            date: true
                                        }
                                    }
                                },
                                orderBy: {
                                    gradedAt: 'desc'
                                }
                            }
                        }
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            grade: true,
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
                        select: {
                            id: true,
                            semester: true,
                            academicYear: true,
                            teacher: {
            include: {
                                    user: {
                                        select: {
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
            });

            console.log(`📚 Found ${students.length} active students for assignment ${assignmentId}`);
            
            return {
                success: true,
                data: students,
                message: `Lấy danh sách học sinh thành công - ${students.length} học sinh đang học`
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách học sinh: ${error.message}`);
        }
    }

    /**
     * Lấy chi tiết thông tin học sinh trong lớp
     */
    async getDetailStudentOfClass(studentId: string, assignmentId?: string) {
        try {
            const whereCondition: any = {
                studentId: studentId,
                status: 'active',  // Chỉ lấy enrollment active
                completedAt: null,  // Chưa hoàn thành khóa học
                student: {
                    user: {
                        isActive: true  // Chỉ lấy học sinh có user active
                    }
                }
            };

            if (assignmentId) {
                whereCondition.teacherClassAssignmentId = assignmentId;
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
                                    createdAt: true
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
                            parent: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                            phone: true
                                        }
                                    }
                                }
                            },
                            attendances: {
                                include: {
                                    session: {
                                        select: {
                                            id: true,
                                            sessionDate: true,
                                            startTime: true,
                                            endTime: true,
                                            status: true
                                        }
                                    }
                                },
                                orderBy: {
                                    recordedAt: 'desc'
                                },
                                take: 10 // Lấy 10 lần điểm danh gần nhất
                            },
                            grades: {
                                include: {
                                    assessment: {
                                        select: {
                                            id: true,
                                            name: true,
                                            type: true,
                                            maxScore: true,
                                            date: true
                                        }
                                    }
                                },
                                orderBy: {
                                    gradedAt: 'desc'
                                },
                                take: 10 // Lấy 10 điểm gần nhất
                            }
                        }
                    },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            grade: true,
                            description: true,
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    description: true
                                }
                            }
                        }
                    },
                    teacherClassAssignment: {
                        select: {
                            id: true,
                            semester: true,
                            academicYear: true,
                            startDate: true,
                            endDate: true,
                            status: true,
                            teacher: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true,
                                            email: true,
                                            phone: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!studentDetail) {
                return {
                    success: false,
                    message: 'Không tìm thấy học sinh trong lớp này'
                };
            }

            return {
                success: true,
                data: studentDetail,
                message: 'Lấy thông tin chi tiết học sinh thành công'
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy thông tin chi tiết học sinh: ${error.message}`);
        }
    }

    // /**
    //  * Lấy thống kê tổng quan về lớp học
    //  */
    // async getClassStatistics(assignmentId: string) {
    //     try {
    //         const [totalStudents, attendanceStats, gradeStats] = await Promise.all([
    //             // Tổng số học sinh active
    //             this.prisma.enrollment.count({
    //                 where: {
    //                     teacherClassAssignmentId: assignmentId,
    //                     status: 'active',
    //                     completedAt: null,
    //                     student: {
    //                         user: {
    //                             isActive: true
    //                         }
    //                     }
    //                 }
    //             }),
    //             // Thống kê điểm danh (chỉ học sinh active)
    //             this.prisma.studentSessionAttendance.groupBy({
    //                 by: ['status'],
    //                 where: {
    //                     student: {
    //                         user: {
    //                             isActive: true
    //                         },
    //                         enrollments: {
    //                             some: {
    //                                 teacherClassAssignmentId: assignmentId,
    //                                 status: 'active',
    //                                 completedAt: null
    //                             }
    //                         }
    //                     }
    //                 },
    //                 _count: {
    //                     status: true
    //                 }
    //             }),
    //             // Thống kê điểm số (chỉ học sinh active)
    //             this.prisma.studentAssessmentGrade.aggregate({
    //                 where: {
    //                     student: {
    //                         user: {
    //                             isActive: true
    //                         },
    //                         enrollments: {
    //                             some: {
    //                                 teacherClassAssignmentId: assignmentId,
    //                                 status: 'active',
    //                                 completedAt: null
    //                             }
    //                         }
    //                     }
    //                 },
    //                 _avg: {
    //                     score: true
    //                 },
    //                 _max: {
    //                     score: true
    //                 },
    //                 _min: {
    //                     score: true
    //                 }
    //             })
    //         ]);

    //         console.log(`📊 Class statistics for assignment ${assignmentId}:`);
    //         console.log(`   - Total active students: ${totalStudents}`);
    //         console.log(`   - Attendance stats:`, attendanceStats);
    //         console.log(`   - Grade stats:`, gradeStats);
            
    //         return {
    //             success: true,
    //             data: {
    //                 totalStudents,
    //                 attendanceStats,
    //                 gradeStats
    //             },
    //             message: `Lấy thống kê lớp học thành công - ${totalStudents} học sinh đang học`
    //         };
    //     } catch (error) {
    //         throw new Error(`Lỗi khi lấy thống kê lớp học: ${error.message}`);
    //     }
    // }

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
              teacherClassAssignments: {
                include: {
                  class: {
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
