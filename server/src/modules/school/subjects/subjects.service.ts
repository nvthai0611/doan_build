import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        try {
            const subjects = await this.prisma.subject.findMany({
                orderBy: { name: 'asc' }
            });

            return {
                success: true,
                message: 'Lấy danh sách môn học thành công',
                data: subjects
            };
        } catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách môn học',
                error: error.message
            };
        }
    }

    async findOne(id: string) {
        try {
            const subject = await this.prisma.subject.findUnique({
                where: { id }
            });

            if (!subject) {
                return {
                    success: false,
                    message: 'Không tìm thấy môn học'
                };
            }

            return {
                success: true,
                message: 'Lấy thông tin môn học thành công',
                data: subject
            };
        } catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra',
                error: error.message
            };
        }
    }
}
