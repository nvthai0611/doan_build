import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateRoomDto } from '../dto/room/create-room.dto';
import { UpdateRoomDto } from '../dto/room/update-room.dto';

@Injectable()
export class RoomsManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả phòng học
   */
  async findAll() {
    try {
      const rooms = await this.prisma.room.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return rooms.map((room) => ({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment ? (room.equipment as string[]) : null,
        isActive: room.isActive,
        createdAt: room.createdAt,
      }));
    } catch (error) {
      throw new HttpException(
        `Lỗi khi lấy danh sách phòng học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thông tin một phòng học theo ID
   */
  async findOne(id: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id },
      });

      if (!room) {
        throw new HttpException('Không tìm thấy phòng học', HttpStatus.NOT_FOUND);
      }

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment ? (room.equipment as string[]) : null,
        isActive: room.isActive,
        createdAt: room.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi lấy thông tin phòng học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo phòng học mới
   */
  async create(createRoomDto: CreateRoomDto) {
    try {
      // Kiểm tra tên phòng đã tồn tại chưa
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          name: {
            equals: createRoomDto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existingRoom) {
        throw new HttpException(
          `Phòng học với tên "${createRoomDto.name}" đã tồn tại`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const room = await this.prisma.room.create({
        data: {
          name: createRoomDto.name,
          capacity: createRoomDto.capacity ?? null,
          equipment: createRoomDto.equipment ? createRoomDto.equipment : null,
          isActive: createRoomDto.isActive ?? true,
        },
      });

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment ? (room.equipment as string[]) : null,
        isActive: room.isActive,
        createdAt: room.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi tạo phòng học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật thông tin phòng học
   */
  async update(id: string, updateRoomDto: UpdateRoomDto) {
    try {
      // Kiểm tra phòng học có tồn tại không
      const existingRoom = await this.prisma.room.findUnique({
        where: { id },
      });

      if (!existingRoom) {
        throw new HttpException('Không tìm thấy phòng học', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra tên phòng đã tồn tại chưa (nếu thay đổi tên)
      if (updateRoomDto.name && updateRoomDto.name !== existingRoom.name) {
        const duplicateRoom = await this.prisma.room.findFirst({
          where: {
            name: {
              equals: updateRoomDto.name,
              mode: 'insensitive',
            },
            id: {
              not: id,
            },
          },
        });

        if (duplicateRoom) {
          throw new HttpException(
            `Phòng học với tên "${updateRoomDto.name}" đã tồn tại`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const room = await this.prisma.room.update({
        where: { id },
        data: {
          name: updateRoomDto.name,
          capacity: updateRoomDto.capacity !== undefined ? updateRoomDto.capacity : existingRoom.capacity,
          equipment: updateRoomDto.equipment !== undefined ? updateRoomDto.equipment : existingRoom.equipment,
          isActive: updateRoomDto.isActive !== undefined ? updateRoomDto.isActive : existingRoom.isActive,
        },
      });

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment ? (room.equipment as string[]) : null,
        isActive: room.isActive,
        createdAt: room.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi cập nhật phòng học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa phòng học
   */
  async remove(id: string) {
    try {
      const existingRoom = await this.prisma.room.findUnique({
        where: { id },
        include: {
          classes: true,
          sessions: true,
        },
      });

      if (!existingRoom) {
        throw new HttpException('Không tìm thấy phòng học', HttpStatus.NOT_FOUND);
      }

      // Kiểm tra phòng có đang được sử dụng không
      if (existingRoom.classes.length > 0 || existingRoom.sessions.length > 0) {
        throw new HttpException(
          'Không thể xóa phòng học đang được sử dụng trong lớp học hoặc buổi học',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.room.delete({
        where: { id },
      });

      return {
        message: 'Đã xóa phòng học thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Lỗi khi xóa phòng học: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

