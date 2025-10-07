import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';

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
}
