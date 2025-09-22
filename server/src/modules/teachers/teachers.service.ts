import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class TeachersService {
  create(createTeacherDto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  findAll() {
    return `This action returns all teachers`;
  }

  async findOne(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      id: teacher.id,
      fullname: teacher.user?.fullName ?? null,
      email: teacher.user?.email ?? null,
      phone: teacher.user?.phone ?? null,
      role: teacher.user?.role ?? null,
      status: teacher.user?.isActive ?? null,
    };
  }

  update(id: string, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: string) {
    return `This action removes a #${id} teacher`;
  }
}
