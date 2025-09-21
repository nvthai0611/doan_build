import { PartialType } from '@nestjs/swagger';
import { CreateCenterUserDto } from './create-center-user.dto';

export class UpdateCenterUserDto extends PartialType(CreateCenterUserDto) {}
