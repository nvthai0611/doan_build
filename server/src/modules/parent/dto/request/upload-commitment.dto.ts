import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadCommitmentDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID('4', { message: 'Student ID không hợp lệ' })
  @IsNotEmpty({ message: 'Student ID không được để trống' })
  studentId: string;

  @ApiProperty({ 
    description: 'Danh sách ID các môn học (dạng JSON string array)',
    example: '["uuid1", "uuid2"]'
  })
  @IsString()
  @IsNotEmpty({ message: 'Danh sách môn học không được để trống' })
  subjectIds: string;

  @ApiProperty({ description: 'Ghi chú (tùy chọn)', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

