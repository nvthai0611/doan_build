import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class FinancialManagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách cấu trúc học phí theo buổi
   */
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
    } catch (error) {
      console.error('Error fetching session fee structures:', error);
      throw new BadRequestException('Lỗi khi lấy danh sách học phí');
    }
  }

  /**
   * Lấy danh sách khối lớp
   */
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
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw new BadRequestException('Lỗi khi lấy danh sách khối lớp');
    }
  }

  /**
   * Lấy danh sách môn học
   */
  async getSubjects() {
    try {
      const subjects = await this.prisma.subject.findMany({
        orderBy: { name: 'asc' }
      });

      return {
        data: subjects,
        message: 'Lấy danh sách môn học thành công'
      };
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new BadRequestException('Lỗi khi lấy danh sách môn học');
    }
  }

  /**
   * Tạo hoặc cập nhật học phí theo buổi
   */
  async upsertSessionFee(gradeId: string, subjectId: string, amount: number) {
    try {
      // Kiểm tra grade và subject tồn tại
      const [grade, subject] = await Promise.all([
        this.prisma.grade.findUnique({ where: { id: gradeId } }),
        this.prisma.subject.findUnique({ where: { id: subjectId } })
      ]);

      if (!grade) {
        throw new NotFoundException('Khối lớp không tồn tại');
      }

      if (!subject) {
        throw new NotFoundException('Môn học không tồn tại');
      }

      // Tìm fee structure hiện tại
      const existingFee = await this.prisma.feeStructure.findFirst({
        where: {
          gradeId,
          subjectId,
          period: 'per_session'
        }
      });

      if (existingFee) {
        // Cập nhật học phí hiện tại
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
      } else {
        // Tạo học phí mới
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
    } catch (error) {
      console.error('Error upserting session fee:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi lưu học phí theo buổi');
    }
  }

  /**
   * Xóa học phí theo buổi
   */
  async deleteSessionFee(feeStructureId: string) {
    try {
      const existingFee = await this.prisma.feeStructure.findUnique({
        where: { id: feeStructureId },
        include: {
          feeRecords: true
        }
      });

      if (!existingFee) {
        throw new NotFoundException('Học phí không tồn tại');
      }

      // Kiểm tra xem có fee records nào đang sử dụng không
      if (existingFee.feeRecords.length > 0) {
        throw new BadRequestException('Không thể xóa học phí đang được sử dụng');
      }

      await this.prisma.feeStructure.delete({
        where: { id: feeStructureId }
      });

      return {
        message: 'Xóa học phí theo buổi thành công'
      };
    } catch (error) {
      console.error('Error deleting session fee:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi xóa học phí theo buổi');
    }
  }

  /**
   * Lấy ma trận học phí theo buổi (grade x subject)
   */
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

      // Tạo ma trận học phí
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
    } catch (error) {
      console.error('Error fetching session fee matrix:', error);
      throw new BadRequestException('Lỗi khi lấy ma trận học phí');
    }
  }

  /**
   * Cập nhật hàng loạt học phí theo buổi
   */
  async bulkUpdateSessionFees(updates: Array<{
    gradeId: string;
    subjectId: string;
    amount: number;
  }>) {
    try {
      const results = [];

      for (const update of updates) {
        const result = await this.upsertSessionFee(
          update.gradeId,
          update.subjectId,
          update.amount
        );
        results.push(result.data);
      }

      return {
        data: results,
        message: `Cập nhật thành công ${results.length} học phí theo buổi`
      };
    } catch (error) {
      console.error('Error bulk updating session fees:', error);
      throw new BadRequestException('Lỗi khi cập nhật hàng loạt học phí');
    }
  }
}