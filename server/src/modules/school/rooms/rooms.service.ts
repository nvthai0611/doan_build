import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        try {
            const rooms = await this.prisma.room.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });

            return {
                success: true,
                message: 'Lấy danh sách phòng học thành công',
                data: rooms
            };
        } catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách phòng học',
                error: error.message
            };
        }
    }

    async findOne(id: string) {
        try {
            const room = await this.prisma.room.findUnique({
                where: { id }
            });

            if (!room) {
                return {
                    success: false,
                    message: 'Không tìm thấy phòng học'
                };
            }

            return {
                success: true,
                message: 'Lấy thông tin phòng học thành công',
                data: room
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
