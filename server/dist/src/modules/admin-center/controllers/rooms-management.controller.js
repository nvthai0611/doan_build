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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsManagementController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_management_service_1 = require("../services/rooms-management.service");
const create_room_dto_1 = require("../dto/room/create-room.dto");
const update_room_dto_1 = require("../dto/room/update-room.dto");
let RoomsManagementController = class RoomsManagementController {
    constructor(roomsManagementService) {
        this.roomsManagementService = roomsManagementService;
    }
    async findAll() {
        const rooms = await this.roomsManagementService.findAll();
        return {
            success: true,
            message: 'Lấy danh sách phòng học thành công',
            data: rooms,
        };
    }
    async findOne(id) {
        const room = await this.roomsManagementService.findOne(id);
        return {
            success: true,
            message: 'Lấy thông tin phòng học thành công',
            data: room,
        };
    }
    async create(createRoomDto) {
        const room = await this.roomsManagementService.create(createRoomDto);
        return {
            success: true,
            message: 'Tạo phòng học thành công',
            data: room,
        };
    }
    async update(id, updateRoomDto) {
        const room = await this.roomsManagementService.update(id, updateRoomDto);
        return {
            success: true,
            message: 'Cập nhật phòng học thành công',
            data: room,
        };
    }
    async remove(id) {
        await this.roomsManagementService.remove(id);
        return {
            success: true,
            message: 'Xóa phòng học thành công',
        };
    }
};
exports.RoomsManagementController = RoomsManagementController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách phòng học' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoomsManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin một phòng học theo ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thông tin phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy phòng học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomsManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo phòng học mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tạo phòng học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomsManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin phòng học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cập nhật phòng học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy phòng học' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomsManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa phòng học' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID của phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xóa phòng học thành công' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy phòng học' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Phòng học đang được sử dụng' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomsManagementController.prototype, "remove", null);
exports.RoomsManagementController = RoomsManagementController = __decorate([
    (0, swagger_1.ApiTags)('Admin Center - Rooms Management'),
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [rooms_management_service_1.RoomsManagementService])
], RoomsManagementController);
//# sourceMappingURL=rooms-management.controller.js.map