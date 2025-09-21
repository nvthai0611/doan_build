import { Injectable } from '@nestjs/common';
import { CreateStudentParentLinkDto } from './dto/create-student-parent-link.dto';
import { UpdateStudentParentLinkDto } from './dto/update-student-parent-link.dto';

@Injectable()
export class StudentParentLinksService {
  create(createStudentParentLinkDto: CreateStudentParentLinkDto) {
    return 'This action adds a new studentParentLink';
  }

  findAll() {
    return `This action returns all studentParentLinks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentParentLink`;
  }

  update(id: number, updateStudentParentLinkDto: UpdateStudentParentLinkDto) {
    return `This action updates a #${id} studentParentLink`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentParentLink`;
  }
}
