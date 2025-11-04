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
exports.SchoolsService = exports.CreateSchoolDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../db/prisma.service");
class CreateSchoolDto {
}
exports.CreateSchoolDto = CreateSchoolDto;
let SchoolsService = class SchoolsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const schools = await this.prisma.school.findMany();
        if (!schools) {
            throw new common_1.NotFoundException('Không tìm thấy trường học');
        }
        return {
            data: schools,
            message: 'Lấy thông tin trường học thành công',
        };
    }
    async create(createSchoolDto) {
        const existingSchool = await this.prisma.school.findFirst({
            where: {
                name: {
                    equals: createSchoolDto.name,
                    mode: 'insensitive'
                }
            }
        });
        if (existingSchool) {
            return {
                data: existingSchool,
                message: 'Trường học đã tồn tại',
                isExisting: true
            };
        }
        const school = await this.prisma.school.create({
            data: {
                name: createSchoolDto.name,
                address: createSchoolDto.address,
                phone: createSchoolDto.phone,
            }
        });
        return {
            data: school,
            message: 'Tạo trường học thành công',
            isExisting: false
        };
    }
};
exports.SchoolsService = SchoolsService;
exports.SchoolsService = SchoolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolsService);
//# sourceMappingURL=schools.service.js.map