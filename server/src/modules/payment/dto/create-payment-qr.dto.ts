import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreatePaymentQRDto {
  @IsString()
  @IsUUID()
  feeRecordId: string;

  @IsNumber()
  @Min(1000, { message: 'Số tiền tối thiểu là 1,000 VNĐ' })
  amount: number;

  @IsOptional()
  @IsString()
  @IsUUID()
  parentId?: string;
}

export interface FeeRecordPaymentInfo {
  feeRecordId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  amount: number;
  remainingAmount: number;
}
