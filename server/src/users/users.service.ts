import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Hash from 'src/utils/hasing';
import { PrismaService } from 'src/db/prisma.service';
const prisma = new PrismaClient({
  log: ['query'],
});
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  // async getUsers() {
  //   return [
  //     {
  //       id: 1,
  //       name: 'hải',
  //       age: 12,
  //     },
  //   ];
  // }

  // async getUser(id: number) {
  //   return [
  //     {
  //       id,
  //       name: 'hải',
  //     },
  //   ];
  // }
  create(createUserDto: CreateUserDto) {
    // Logic thêm dữ liệu vào bảng users
    createUserDto.create_at = new Date();
    createUserDto.update_at = new Date();
    createUserDto.password = Hash.make(createUserDto.password);
    return prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll({ page, limit, order, sort, filter }) {
    const skip = (page - 1) * limit;
    console.log(filter);

    const count = await prisma.user.count();
    const row = await prisma.user.findMany({
      skip: skip,
      take: limit,
      where: filter,
      select: {
        name: true,
        email: true,
        status: true,
        create_at: true,
      }, // chỉ lấy name, email, status
      orderBy: {
        [sort]: order,
      },
    });
    return {
      count,
      row,
    };
  }

  findOne(id: number) {
    return prisma.user.findFirst({
      where: {
        id: id,
      },
    });
  }

  update(id: number, body: UpdateUserDto) {
    return prisma.user.update({
      data: body,
      where: {
        id: id,
      },
    });
  }

  remove(id: number) {
    return prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email,
      },
    });
  }
}
