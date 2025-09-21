import { Injectable } from '@nestjs/common';
import { CreateCenterUserDto } from './dto/create-center-user.dto';
import { UpdateCenterUserDto } from './dto/update-center-user.dto';

@Injectable()
export class CenterUsersService {
  create(createCenterUserDto: CreateCenterUserDto) {
    return 'This action adds a new centerUser';
  }

  findAll() {
    return `This action returns all centerUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} centerUser`;
  }

  update(id: number, updateCenterUserDto: UpdateCenterUserDto) {
    return `This action updates a #${id} centerUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} centerUser`;
  }
}
