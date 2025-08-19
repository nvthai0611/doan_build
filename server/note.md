## Tạo project nest

npx nest new ten_project

## Tạo resource

nest generate resource ten_resource

## tải gói để đọc env

npm i @nestjs/config

## Tải middleware

nest g middleware ten\_...

- middleware sẽ dùng cho các tình huống phần quyền, xác thực, log các thứ......
- đăng kí middleware trong app.module.ts
  // console.log(req.baseUrl);
  // console.log('Auth middleWare');
  // const status = false;
  // if (!status) {
  // return res.status(401).json({
  // message: 'ko có quyền',
  // });
  // }

## Tải gói Cookie

npm i cookie-parser
npm i --save-dev @types/cookie-parser
=> vào file main.ts đăng kí cookie

## fix lỗi (thêm vào eslintrc.js)

'prettier/prettier': [
'error',
{
endOfLine: 'auto',
}
],

## cài 2 gói validation

npm i --save class-validator class-transformer

## cài cookie parser

npm i cookie-parser
npm i --save-dev @types/cookie-parser // cái này hỗ trợ typescript

## Cấu hình database

npm install prisma --save-dev
npx prisma init --datasource-provider postgresql

-> lúc này sẽ tạo ra 1 file prisma và trong file .env sẽ có 1 cái link, chỉ cần đổi tên là done

- vào file schema.prisma thêm model

-> chạy lệnh migrate === npx prisma migrate dev --name "init db"

- khi bạn thay đổi kiểu varchar hay gì đó thì reset lại
  npx prisma migrate reset

- sau đó chạy lại lệnh migrate

## Cài prisma client

## cài thuật toán băm m,ã hóa password

npm i bcrypt
npm i -D @types/bcrypt // hỗ trợ typescrypt

### Logic xác thực

## Authentication

- Lấy body: email, password
- tìm email có tồn tại trong users ko? ---> nếu ko thông báo lỗi
- Lấy được password hash từ dtb
  -- Vertify password hash với password từ body --> failed -> thông báo lỗi
- Lưu user_id hoặc email vào JWT (dùng thư viện)
- Trả về response token tương ứng

## Authorization

- Gửi request header: Authorization: Bearer token-can-gui
- Server đọc header Authorization và cắt ra token
- Kiểm tra token có nằm trong blacklist không? (Database, Redis (imamorydatabase -> dtb lưu ở ram))
- Verify token (Dùng thư viện jsonwedtoken) --> Trả về được thông tin trong token (user_id hoặc email)
- Dùng dữ liệu từ token để lấy thông tin trong database
- Trả về response

## Logout

- Gửi request chứa token lên server
- Verify token
- Thêm token vào blacklist
- Trả về response

## kiểm tra redis đã được lưu chưa

127.0.0.1:6379> KEYs \*
