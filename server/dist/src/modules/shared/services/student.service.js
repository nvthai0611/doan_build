"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSharedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let StudentSharedService = class StudentSharedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentDetail(studentId, currentUser) {
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
        const roleBasedInclude = this.getRoleBasedInclude(currentUser.role, currentUser);
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                ...baseInclude,
                ...roleBasedInclude,
            }
        });
        if (!student) {
            throw new common_1.HttpException('Student not found', 404);
        }
        await this.checkViewPermission(student, currentUser);
        return this.filterDataByRole(student, currentUser.role);
    }
    getRoleBasedInclude(role, currentUser) {
        const includes = {
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
    async checkViewPermission(student, currentUser) {
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
                    throw new common_1.ForbiddenException('You can only view students in your classes');
                }
                break;
            }
            case 'parent':
                if (student.parentId !== this.getCurrentParentId(currentUser)) {
                    throw new common_1.ForbiddenException('You can only view your own children');
                }
                break;
            case 'student':
                if (student.userId !== currentUser.id) {
                    throw new common_1.ForbiddenException('You can only view your own information');
                }
                break;
            default:
                throw new common_1.ForbiddenException('Insufficient permissions');
        }
    }
    filterDataByRole(student, role) {
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
                const { feeRecords: _, ...teacherData } = student;
                return teacherData;
            }
            case 'parent':
                return student;
            case 'student': {
                const { feeRecords, ...studentData } = student;
                return {
                    ...studentData,
                    financialSummary: {
                        totalDue: feeRecords?.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0) || 0,
                    }
                };
            }
            default:
                return baseData;
        }
    }
    getCurrentTeacherId(user) {
        return user.teacher?.id || user.teacherId;
    }
    getCurrentParentId(user) {
        return user.parent?.id || user.parentId;
    }
};
exports.StudentSharedService = StudentSharedService;
exports.StudentSharedService = StudentSharedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentSharedService);
//# sourceMappingURL=student.service.js.map