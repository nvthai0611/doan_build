// import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  // @Length(3, 50, { message: 'Tên phải từ 3-50 ký tự' })
  name: string;

  // @Length(3, 100, { message: 'Email phải từ 3-100 ký tự' })
  // @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  // @Length(6, 100, { message: 'Password phải từ 6-100 ký tự' })
  password: string;

  create_at: Date;
  update_at: Date;
}
