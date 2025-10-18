import { HttpException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../db/prisma.service";

@Injectable()
export class StudentSharedService {
    constructor(private prisma: PrismaService) {}

    async getStudentDetail(studentId: string, currentUser: any) {
        // Base query với include cơ bản
        const baseInclude = {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
              gender: true,
              birthDate: true,
              // Không include password, sensitive data
            }
          },
          school: true,
        };
  
        // Dynamic include dựa trên role
        const roleBasedInclude = this.getRoleBasedInclude(currentUser.role, currentUser);
        
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
          include: {
            ...baseInclude,
            ...roleBasedInclude,
          }
        });
  
        if (!student) {
          throw new HttpException('Student not found', 404);
        }
  
        // Check permission để xem student này
        await this.checkViewPermission(student, currentUser);
  
        // Filter sensitive data dựa trên role
        return this.filterDataByRole(student, currentUser.role);
    }
  
    private getRoleBasedInclude(role: string, currentUser: any) {
        const includes = {
          center_owner: {
            // Center owner thấy tất cả
            parent: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    phone: true,
                  }
                }
              }
            },
            enrollments: {
              include: {
                class: {
                  include: {
                    subject: true,
                    teacher: {
                      include: {
                        user: {
                          select: {
                            fullName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            feeRecords: {
              include: {
                feeStructure: true,
                payments: true,
              }
            },
            grades: {
              include: {
                assessment: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
            attendances: {
              include: {
                session: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
            leaveRequests: true,
          },
          
          teacher: {
            // Teacher chỉ thấy student trong class mình dạy
            enrollments: {
              where: {
                class: {
                  teacherId: this.getCurrentTeacherId(currentUser),
                }
              },
              include: {
                class: {
                  include: {
                    subject: true,
                  }
                }
              }
            },
            grades: {
              where: {
                assessment: {
                  class: {
                    teacherId: this.getCurrentTeacherId(currentUser),
                  }
                }
              },
              include: {
                assessment: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
            attendances: {
              where: {
                session: {
                  class: {
                    teacherId: this.getCurrentTeacherId(currentUser),
                  }
                }
              },
              include: {
                session: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
          },
          
          parent: {
            // Parent chỉ thấy con mình
            enrollments: {
              include: {
                class: {
                  include: {
                    subject: true,
                    teacher: {
                      include: {
                        user: {
                          select: {
                            fullName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            feeRecords: {
              include: {
                feeStructure: true,
                payments: true,
              }
            },
            grades: {
              include: {
                assessment: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
            attendances: {
              include: {
                session: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
          },
          
          student: {
            // Student thấy thông tin của chính mình
            enrollments: {
              include: {
                class: {
                  include: {
                    subject: true,
                    teacher: {
                      include: {
                        user: {
                          select: {
                            fullName: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            grades: {
              include: {
                assessment: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
            attendances: {
              include: {
                session: {
                  include: {
                    class: {
                      include: {
                        subject: true,
                      }
                    }
                  }
                }
              }
            },
          }
        };
  
        return includes[role] || {};
    }
  
    private async checkViewPermission(student: any, currentUser: any) {
        switch (currentUser.role) {
          case 'center_owner':
            // Center owner có thể xem tất cả
            return true;
            
          case 'teacher':
            // Teacher chỉ xem được student trong class mình dạy
            const enrollments = await this.prisma.enrollment.findMany({
              where: {
                studentId: student.id,
                class: {
                  teacherId: this.getCurrentTeacherId(currentUser)
                }
              }
            });
            
            if (enrollments.length === 0) {
              throw new ForbiddenException('You can only view students in your classes');
            }
            break;
            
          case 'parent':
            // Parent chỉ xem được con mình
            if (student.parentId !== this.getCurrentParentId(currentUser)) {
              throw new ForbiddenException('You can only view your own children');
            }
            break;
            
          case 'student':
            // Student chỉ xem được chính mình
            if (student.userId !== currentUser.id) {
              throw new ForbiddenException('You can only view your own information');
            }
            break;
            
          default:
            throw new ForbiddenException('Insufficient permissions');
        }
    }
  
    private filterDataByRole(student: any, role: string) {
        // Base data mà tất cả role đều thấy
        const baseData = {
          id: student.id,
          studentCode: student.studentCode,
          grade: student.grade,
          createdAt: student.createdAt,
          user: student.user,
          school: student.school,
        };
  
        switch (role) {
          case 'center_owner':
            // Center owner thấy tất cả
            return student;
            
          case 'teacher': {
            // Teacher không thấy financial info
            const { feeRecords: _, payments: __, ...teacherData } = student;
            return teacherData;
          }
            
          case 'parent':
            // Parent thấy hầu hết, trừ sensitive teacher info
            return student;
            
          case 'student': {
            // Student không thấy financial details
            const { feeRecords, payments: ___, ...studentData } = student;
            return {
              ...studentData,
              // Có thể thêm summary financial info
              financialSummary: {
                totalDue: feeRecords?.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0) || 0,
              }
            };
          }
            
          default:
            return baseData;
        }
    }
  
    private getCurrentTeacherId(user: any): string {
        return user.teacher?.id || user.teacherId;
    }
  
    private getCurrentParentId(user: any): string {
        return user.parent?.id || user.parentId;
    }
}