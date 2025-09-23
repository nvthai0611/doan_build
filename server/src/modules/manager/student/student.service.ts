import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../../../db/prisma.service';

@Injectable()
export class StudentService {
  
  constructor(private readonly prismaService: PrismaService) {}

  create(createStudentDto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  async findAll() {
    return `This action returns all student`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  async getAllStudentsWithInfo(): Promise<any> {
    const students = await this.prismaService.student.findMany({
      include: {
        user: true, 
        school: true, 
        parentLinks: {
          include: {
            parent: {
              include: {
                user: true, // thông tin user của phụ huynh
              },
            },
          },
        },
      },
    });
  
    // convert BigInt -> string cho các ID nếu cần (StudentParentLink.id)
    const formatted = students.map(student => ({
      ...student,
      parentLinks: student.parentLinks.map(link => ({
        ...link,
        id: link.id.toString(),
      })),
    }));
  
    console.log(formatted);
    return formatted;
  }
}
