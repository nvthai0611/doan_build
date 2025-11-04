import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinClassByCodeDto {
  @ApiProperty({ description: 'Class code hoặc link lớp học', example: '1ABC hoặc /classes/53d71ee9-2df8-4f92-af3f-75490f022a43' })
  @IsString()
  @IsNotEmpty({ message: 'Mã lớp hoặc link không được để trống' })
  codeOrLink: string;
}

export class RequestJoinClassDto {
  @ApiProperty({ description: 'Class ID' })
  @IsUUID('4', { message: 'Class ID không hợp lệ' })
  @IsNotEmpty({ message: 'Class ID không được để trống' })
  classId: string;

  @ApiProperty({ description: 'Student ID - con của parent' })
  @IsUUID('4', { message: 'Student ID không hợp lệ' })
  @IsNotEmpty({ message: 'Student ID không được để trống' })
  studentId: string;

  @ApiProperty({ description: 'Contract Upload ID (ID của hợp đồng đã upload trước) - BẮT BUỘC' })
  @IsUUID('4', { message: 'Contract Upload ID không hợp lệ' })
  @IsNotEmpty({ message: 'Contract Upload ID không được để trống' })
  contractUploadId: string;

  @ApiProperty({ description: 'Mật khẩu lớp học (nếu có)', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Lời nhắn gửi (tùy chọn)', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'URL ảnh cam kết học tập (DEPRECATED - dùng contractUploadId)', required: false })
  @IsOptional()
  @IsString()
  commitmentImageUrl?: string;
}

