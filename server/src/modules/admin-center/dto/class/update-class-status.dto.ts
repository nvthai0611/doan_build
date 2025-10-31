import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClassStatus } from '../../../../common/constants';

export class UpdateClassStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(ClassStatus, { message: 'Trạng thái không hợp lệ' })
  status: ClassStatus;
}

