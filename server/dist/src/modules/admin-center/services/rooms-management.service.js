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
exports.RoomsManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
let RoomsManagementService = class RoomsManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
                equipment: room.equipment ? room.equipment : null,
                isActive: room.isActive,
                createdAt: room.createdAt,
            }));
        }
        catch (error) {
            throw new common_1.HttpException(`Lỗi khi lấy danh sách phòng học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const room = await this.prisma.room.findUnique({
                where: { id },
            });
            if (!room) {
                throw new common_1.HttpException('Không tìm thấy phòng học', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                equipment: room.equipment ? room.equipment : null,
                isActive: room.isActive,
                createdAt: room.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi lấy thông tin phòng học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(createRoomDto) {
        try {
            const existingRoom = await this.prisma.room.findFirst({
                where: {
                    name: {
                        equals: createRoomDto.name,
                        mode: 'insensitive',
                    },
                },
            });
            if (existingRoom) {
                throw new common_1.HttpException(`Phòng học với tên "${createRoomDto.name}" đã tồn tại`, common_1.HttpStatus.BAD_REQUEST);
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
                equipment: room.equipment ? room.equipment : null,
                isActive: room.isActive,
                createdAt: room.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi tạo phòng học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateRoomDto) {
        try {
            const existingRoom = await this.prisma.room.findUnique({
                where: { id },
            });
            if (!existingRoom) {
                throw new common_1.HttpException('Không tìm thấy phòng học', common_1.HttpStatus.NOT_FOUND);
            }
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
                    throw new common_1.HttpException(`Phòng học với tên "${updateRoomDto.name}" đã tồn tại`, common_1.HttpStatus.BAD_REQUEST);
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
                equipment: room.equipment ? room.equipment : null,
                isActive: room.isActive,
                createdAt: room.createdAt,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi cập nhật phòng học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const existingRoom = await this.prisma.room.findUnique({
                where: { id },
                include: {
                    classes: true,
                    sessions: true,
                },
            });
            if (!existingRoom) {
                throw new common_1.HttpException('Không tìm thấy phòng học', common_1.HttpStatus.NOT_FOUND);
            }
            if (existingRoom.classes.length > 0 || existingRoom.sessions.length > 0) {
                throw new common_1.HttpException('Không thể xóa phòng học đang được sử dụng trong lớp học hoặc buổi học', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.room.delete({
                where: { id },
            });
            return {
                message: 'Đã xóa phòng học thành công',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Lỗi khi xóa phòng học: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RoomsManagementService = RoomsManagementService;
exports.RoomsManagementService = RoomsManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsManagementService);
//# sourceMappingURL=rooms-management.service.js.map