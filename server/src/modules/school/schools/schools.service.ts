import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

export class CreateSchoolDto {
    name: string;
    address?: string;
    phone?: string;
}

@Injectable()
export class SchoolsService {
    constructor(private prisma: PrismaService) {}
    
    async findAll(){
        const schools = await this.prisma.school.findMany();
        if(!schools){
            throw new NotFoundException('Không tìm thấy trường học');
        }
        return {
            data: schools,
            message: 'Lấy thông tin trường học thành công',
        }
    }

    async create(createSchoolDto: CreateSchoolDto){
        // Check if school with same name already exists
        const existingSchool = await this.prisma.school.findFirst({
            where: { 
                name: {
                    equals: createSchoolDto.name,
                    mode: 'insensitive' // Case insensitive
                }
            }
        });

        if (existingSchool) {
            // Return existing school instead of throwing error
            return {
                data: existingSchool,
                message: 'Trường học đã tồn tại',
                isExisting: true
            }
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
        }
    }
}
