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
          username: true,
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
    const includes: Record<string, any> = {
      center_owner: {
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
                        email: true
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
            feeRecordPayments: {
              include: {
                payment: true
              }
            },
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
            feeRecordPayments: {
              include: {
                payment: true
              }
            },
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
        return true;
      case 'teacher': {
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
      }
      case 'parent':
        if (student.parentId !== this.getCurrentParentId(currentUser)) {
          throw new ForbiddenException('You can only view your own children');
        }
        break;
      case 'student':
        if (student.userId !== currentUser.id) {
          throw new ForbiddenException('You can only view your own information');
        }
        break;
      default:
        throw new ForbiddenException('Insufficient permissions');
    }
  }

  private filterDataByRole(student: any, role: string) {
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
        return student;
      case 'teacher': {
        // Không trả về feeRecords cho teacher
        const { feeRecords: _, ...teacherData } = student;
        return teacherData;
      }
      case 'parent':
        return student;
      case 'student': {
        // Không trả về feeRecords cho student, chỉ trả về summary
        const { feeRecords, ...studentData } = student;
        return {
          ...studentData,
          financialSummary: {
            totalDue: feeRecords?.reduce((sum: number, fee: any) => sum + (fee.amount - fee.paidAmount), 0) || 0,
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