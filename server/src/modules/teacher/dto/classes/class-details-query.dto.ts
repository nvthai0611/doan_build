import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClassDetailsQueryDto {
  @ApiProperty({ 
    description: 'ID của lớp học',
    required: true
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsString({ message: 'Class ID must be a string' })
  classId: string;
}