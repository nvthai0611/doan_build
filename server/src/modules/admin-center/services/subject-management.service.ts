import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma.service';
import { CreateSubjectDto } from 'src/modules/admin-center/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/modules/admin-center/dto/subject/update-subject.dto';

@Injectable()
export class SubjectManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const subjects = await this.prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    return subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      description: s.description ?? null,
    }));
  }

  async findOne(id: string) {
    const s = await this.prisma.subject.findUnique({ where: { id } });
    if (!s) throw new HttpException('Không tìm thấy môn học', HttpStatus.NOT_FOUND);
    return { id: s.id, code: s.code, name: s.name, description: s.description ?? null };
  }

  async create(dto: CreateSubjectDto) {
    const existCode = await this.prisma.subject.findUnique({ where: { code: dto.code } });
    if (existCode) throw new HttpException('Mã môn học đã tồn tại', HttpStatus.BAD_REQUEST);
    const subject = await this.prisma.subject.create({ data: { code: dto.code, name: dto.name, description: dto.description ?? null } });
    return { id: subject.id, code: subject.code, name: subject.name, description: subject.description ?? null };
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const current = await this.prisma.subject.findUnique({ where: { id } });
    if (!current) throw new HttpException('Không tìm thấy môn học', HttpStatus.NOT_FOUND);
    if (dto.code && dto.code !== current.code) {
      const duplicate = await this.prisma.subject.findUnique({ where: { code: dto.code } });
      if (duplicate) throw new HttpException('Mã môn học đã tồn tại', HttpStatus.BAD_REQUEST);
    }
    const s = await this.prisma.subject.update({ where: { id }, data: { code: dto.code ?? current.code, name: dto.name ?? current.name, description: dto.description !== undefined ? dto.description : current.description } });
    return { id: s.id, code: s.code, name: s.name, description: s.description ?? null };
  }

  async remove(id: string) {
    const current = await this.prisma.subject.findUnique({ where: { id }, include: { classes: true } });
    if (!current) throw new HttpException('Không tìm thấy môn học', HttpStatus.NOT_FOUND);
    if (current.classes && current.classes.length > 0) {
      throw new HttpException('Không thể xóa môn học đang được sử dụng trong lớp học', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.subject.delete({ where: { id } });
  }
}


