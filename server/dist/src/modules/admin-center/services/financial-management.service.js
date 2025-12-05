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
exports.FinancialManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let FinancialManagementService = class FinancialManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSessionFeeStructures() {
        try {
            const feeStructures = await this.prisma.feeStructure.findMany({
                where: {
                    period: 'per_session'
                },
                include: {
                    grade: {
                        select: {
                            id: true,
                            name: true,
                            level: true
                        }
                    },
                    subject: {
                        select: {
                            id: true,
                            name: true,
                            code: true
                        }
                    }
                },
                orderBy: [
                    { grade: { level: 'asc' } },
                    { subject: { name: 'asc' } }
                ]
            });
            return {
                data: feeStructures,
                message: 'Lấy danh sách học phí theo buổi thành công'
            };
        }
        catch (error) {
            console.error('Error fetching session fee structures:', error);
            throw new common_1.BadRequestException('Lỗi khi lấy danh sách học phí');
        }
    }
    async getGrades() {
        try {
            const grades = await this.prisma.grade.findMany({
                where: { isActive: true },
                orderBy: { level: 'asc' }
            });
            return {
                data: grades,
                message: 'Lấy danh sách khối lớp thành công'
            };
        }
        catch (error) {
            console.error('Error fetching grades:', error);
            throw new common_1.BadRequestException('Lỗi khi lấy danh sách khối lớp');
        }
    }
    async getSubjects() {
        try {
            const subjects = await this.prisma.subject.findMany({
                orderBy: { name: 'asc' }
            });
            return {
                data: subjects,
                message: 'Lấy danh sách môn học thành công'
            };
        }
        catch (error) {
            console.error('Error fetching subjects:', error);
            throw new common_1.BadRequestException('Lỗi khi lấy danh sách môn học');
        }
    }
    async upsertSessionFee(gradeId, subjectId, amount) {
        try {
            const [grade, subject] = await Promise.all([
                this.prisma.grade.findUnique({ where: { id: gradeId } }),
                this.prisma.subject.findUnique({ where: { id: subjectId } })
            ]);
            if (!grade) {
                throw new common_1.NotFoundException('Khối lớp không tồn tại');
            }
            if (!subject) {
                throw new common_1.NotFoundException('Môn học không tồn tại');
            }
            const existingFee = await this.prisma.feeStructure.findFirst({
                where: {
                    gradeId,
                    subjectId,
                    period: 'per_session'
                }
            });
            if (existingFee) {
                const updatedFee = await this.prisma.feeStructure.update({
                    where: { id: existingFee.id },
                    data: {
                        amount: amount,
                        name: `Học phí ${subject.name} ${grade.name} theo buổi`
                    },
                    include: {
                        grade: {
                            select: {
                                id: true,
                                name: true,
                                level: true
                            }
                        },
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        }
                    }
                });
                return {
                    data: updatedFee,
                    message: 'Cập nhật học phí theo buổi thành công'
                };
            }
            else {
                const newFee = await this.prisma.feeStructure.create({
                    data: {
                        name: `Học phí ${subject.name} ${grade.name} theo buổi`,
                        amount: amount,
                        period: 'per_session',
                        description: `Học phí theo buổi cho môn ${subject.name} khối ${grade.name}`,
                        gradeId,
                        subjectId,
                        isActive: true
                    },
                    include: {
                        grade: {
                            select: {
                                id: true,
                                name: true,
                                level: true
                            }
                        },
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        }
                    }
                });
                return {
                    data: newFee,
                    message: 'Tạo học phí theo buổi thành công'
                };
            }
        }
        catch (error) {
            console.error('Error upserting session fee:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi lưu học phí theo buổi');
        }
    }
    async deleteSessionFee(feeStructureId) {
        try {
            const existingFee = await this.prisma.feeStructure.findUnique({
                where: { id: feeStructureId },
                include: {
                    feeRecords: true
                }
            });
            if (!existingFee) {
                throw new common_1.NotFoundException('Học phí không tồn tại');
            }
            if (existingFee.feeRecords.length > 0) {
                throw new common_1.BadRequestException('Không thể xóa học phí đang được sử dụng');
            }
            await this.prisma.feeStructure.delete({
                where: { id: feeStructureId }
            });
            return {
                message: 'Xóa học phí theo buổi thành công'
            };
        }
        catch (error) {
            console.error('Error deleting session fee:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi xóa học phí theo buổi');
        }
    }
    async getSessionFeeMatrix() {
        try {
            const [grades, subjects, feeStructures] = await Promise.all([
                this.prisma.grade.findMany({
                    where: { isActive: true },
                    orderBy: { level: 'asc' }
                }),
                this.prisma.subject.findMany({
                    orderBy: { name: 'asc' }
                }),
                this.prisma.feeStructure.findMany({
                    where: {
                        period: 'per_session',
                        isActive: true
                    }
                })
            ]);
            const matrix = grades.map(grade => {
                const gradeFees = feeStructures.filter(fee => fee.gradeId === grade.id);
                return {
                    grade: {
                        id: grade.id,
                        name: grade.name,
                        level: grade.level
                    },
                    subjects: subjects.map(subject => {
                        const fee = gradeFees.find(f => f.subjectId === subject.id);
                        return {
                            subject: {
                                id: subject.id,
                                name: subject.name,
                                code: subject.code
                            },
                            fee: fee ? {
                                id: fee.id,
                                amount: Number(fee.amount),
                                name: fee.name
                            } : null
                        };
                    })
                };
            });
            return {
                data: {
                    matrix,
                    grades,
                    subjects,
                    totalGrades: grades.length,
                    totalSubjects: subjects.length
                },
                message: 'Lấy ma trận học phí theo buổi thành công'
            };
        }
        catch (error) {
            console.error('Error fetching session fee matrix:', error);
            throw new common_1.BadRequestException('Lỗi khi lấy ma trận học phí');
        }
    }
    async bulkUpdateSessionFees(updates) {
        try {
            const results = [];
            for (const update of updates) {
                const result = await this.upsertSessionFee(update.gradeId, update.subjectId, update.amount);
                results.push(result.data);
            }
            return {
                data: results,
                message: `Cập nhật thành công ${results.length} học phí theo buổi`
            };
        }
        catch (error) {
            console.error('Error bulk updating session fees:', error);
            throw new common_1.BadRequestException('Lỗi khi cập nhật hàng loạt học phí');
        }
    }
};
exports.FinancialManagementService = FinancialManagementService;
exports.FinancialManagementService = FinancialManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialManagementService);
//# sourceMappingURL=financial-management.service.js.map