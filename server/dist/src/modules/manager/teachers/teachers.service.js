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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let TeachersService = class TeachersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTeacherDto) {
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
                            baseSalary: true,
                            teachingHours: true,
                            hourlyRate: true,
                            bonuses: true,
                            deductions: true,
                            totalAmount: true,
                            status: true,
                            paidAt: true,
                        },
                        orderBy: {
                            periodStart: 'desc'
                        },
                        take: 5
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
                        take: 10
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
        }
        catch (error) {
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
    async findOne(id) {
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
                            baseSalary: true,
                            teachingHours: true,
                            hourlyRate: true,
                            bonuses: true,
                            deductions: true,
                            totalAmount: true,
                            status: true,
                            paidAt: true,
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
        }
        catch (error) {
            console.error('Error fetching teacher:', error);
            return {
                success: false,
                data: null,
                message: 'Có lỗi xảy ra khi lấy thông tin giáo viên',
                error: error.message
            };
        }
    }
    async update(id, updateTeacherDto) {
        return `This action updates a #${id} teacher`;
    }
    async remove(id) {
        return `This action removes a #${id} teacher`;
    }
    async getTeacherContracts(teacherId) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
            });
            if (!teacher) {
                throw new Error('Không tìm thấy giáo viên');
            }
            const contracts = await this.prisma.contractUpload.findMany({
                where: {
                    teacherId: teacherId,
                },
                orderBy: {
                    uploadedAt: 'desc',
                },
            });
            return contracts;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteTeacherContract(teacherId, contractId) {
        try {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: teacherId },
            });
            if (!teacher) {
                throw new Error('Không tìm thấy giáo viên');
            }
            const contract = await this.prisma.contractUpload.findFirst({
                where: {
                    id: contractId,
                    teacherId: teacherId,
                },
            });
            if (!contract) {
                throw new Error('Không tìm thấy hợp đồng hoặc hợp đồng không thuộc về giáo viên này');
            }
            await this.prisma.contractUpload.delete({
                where: {
                    id: contractId,
                },
            });
            return {
                success: true,
                message: 'Xóa hợp đồng thành công',
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map