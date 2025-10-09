# Hướng dẫn sử dụng tính năng Import Excel cho Giáo viên

## Tổng quan
Tính năng Import Excel cho phép bạn thêm nhiều giáo viên cùng lúc thông qua file Excel (.xlsx, .xls). **Hỗ trợ nhúng ảnh hợp đồng trực tiếp vào file Excel**.

## Cách sử dụng

### 1. Truy cập tính năng
- Vào trang **Danh sách giáo viên**
- Click vào menu **"..."** ở góc phải trên
- Chọn **"Tải lên"**

### 2. Tải template Excel
- Click **"Tải template Excel"** để tải file mẫu
- File template sẽ có định dạng chuẩn và dữ liệu mẫu

### 3. Điền dữ liệu
Mở file Excel và điền thông tin theo các cột sau:

| Cột | Tên | Bắt buộc | Mô tả | Ví dụ |
|-----|-----|----------|-------|-------|
| A | Tên | ✅ | Họ và tên đầy đủ | Nguyễn Văn A |
| B | Email | ✅ | Email duy nhất | nguyenvana@example.com |
| C | Tên đăng nhập | ✅ | Username duy nhất | nguyenvana |
| D | Số điện thoại | ✅ | Số điện thoại 10-11 số | 0123456789 |
| E | Giới tính | ✅ | MALE/FEMALE/OTHER | MALE |
| F | Ngày sinh | ✅ | Định dạng DD/MM/YYYY | 01/01/1990 |
| G | Nhóm quyền | ❌ | teacher/center_owner | teacher |
| H | Tên trường | ✅ | Tên trường học | THPT Nguyễn Huệ |
| I | Địa chỉ trường | ❌ | Địa chỉ trường học | 123 Nguyễn Huệ, Quận 1 |
| **J** | **Ảnh hợp đồng** | ✅ | **Nhúng ảnh trực tiếp vào ô này** | *[Hình ảnh]* |
| K | Ghi chú | ❌ | Ghi chú thêm | Giáo viên Toán |

### 4. Nhúng ảnh hợp đồng vào Excel

#### Cách nhúng ảnh trong Excel:

**Trên Microsoft Excel:**
1. Click vào ô J (cột ảnh hợp đồng) của dòng giáo viên
2. Vào tab **Insert** (Chèn)
3. Click **Pictures** (Hình ảnh) → **This Device** (Thiết bị này)
4. Chọn ảnh hợp đồng từ máy tính
5. **Quan trọng**: Sau khi chèn ảnh, **di chuyển và resize ảnh** sao cho:
   - Ảnh nằm **HOÀN TOÀN** bên trong ô J của dòng giáo viên tương ứng
   - Không chồng lên các ô khác
   - Có thể resize nhỏ lại để vừa ô

**Trên Google Sheets:**
1. Click vào ô J của dòng giáo viên
2. Vào menu **Insert** → **Image** → **Image in cell**
3. Chọn ảnh từ máy tính
4. Ảnh sẽ tự động nằm trong ô

**Trên LibreOffice Calc:**
1. Click vào ô J của dòng giáo viên  
2. Vào menu **Insert** → **Image**
3. Chọn ảnh từ máy tính
4. Resize và di chuyển ảnh vào trong ô J

#### Lưu ý quan trọng:
- ✅ Mỗi ảnh phải nằm **hoàn toàn** bên trong ô J của dòng tương ứng
- ✅ Không để ảnh chồng lên nhiều dòng
- ✅ Kích thước ảnh khuyến nghị: Tối đa 5MB
- ✅ Định dạng ảnh hỗ trợ: JPG, PNG, GIF
- ❌ Không paste ảnh vào nhiều ô cùng lúc
- ❌ Không để ảnh "float" bên ngoài các ô

### 5. Upload file
- Sau khi điền đầy đủ thông tin và nhúng ảnh
- Click **"Chọn file Excel"**
- Chọn file đã hoàn thành
- Click **"Import dữ liệu"**
- Hệ thống sẽ tự động:
  1. Đọc file Excel
  2. Extract ảnh từ các ô
  3. Upload ảnh lên Cloudinary
  4. Tạo tài khoản giáo viên

## Quy tắc validation

### Thông tin bắt buộc
- **Tên**: Không được để trống
- **Email**: Phải đúng định dạng email và duy nhất
- **Tên đăng nhập**: Tối thiểu 3 ký tự và duy nhất
- **Số điện thoại**: 10-11 chữ số
- **Giới tính**: Phải chọn MALE/FEMALE/OTHER
- **Ngày sinh**: Độ tuổi từ 18-65
- **Tên trường**: Tên trường học
- **Ảnh hợp đồng**: Phải nhúng ảnh vào ô J

### Quy tắc khác
- **Giới tính**: Chỉ chấp nhận "MALE", "FEMALE", "OTHER"
- **Nhóm quyền**: Chỉ chấp nhận "teacher", "center_owner" (mặc định: teacher)
- **Ngày sinh**: Định dạng DD/MM/YYYY hoặc YYYY-MM-DD
- **Email và Username**: Phải duy nhất trong hệ thống
- **Ảnh hợp đồng**: 
  - Phải nằm trong ô J
  - Tối đa 5MB mỗi ảnh
  - Format: JPG, PNG, GIF

## Xử lý lỗi

### Các loại lỗi thường gặp
1. **Lỗi validation**: Dữ liệu không đúng định dạng
2. **Lỗi duplicate**: Email hoặc username đã tồn tại
3. **Lỗi file**: File không đúng định dạng hoặc quá lớn
4. **Lỗi ảnh**: 
   - Không tìm thấy ảnh trong ô J
   - Ảnh quá lớn (> 5MB)
   - Ảnh không đúng định dạng
5. **Lỗi upload Cloudinary**: Không thể upload ảnh lên server

### Cách khắc phục
1. Kiểm tra lại dữ liệu trong file Excel
2. Đảm bảo email và username là duy nhất
3. Kiểm tra ảnh đã nhúng đúng vào ô J
4. Kiểm tra kích thước ảnh (tối đa 5MB)
5. Kiểm tra định dạng ảnh (JPG/PNG/GIF)
6. Upload lại file sau khi sửa

## Kết quả import

### Thành công
- Hiển thị số lượng giáo viên được thêm thành công
- Ảnh hợp đồng được upload lên Cloudinary tự động
- URL ảnh được lưu vào database
- Danh sách giáo viên sẽ được cập nhật tự động

### Có lỗi
- Hiển thị danh sách lỗi chi tiết theo từng dòng
- Các giáo viên hợp lệ vẫn được thêm vào hệ thống
- Các dòng có lỗi sẽ bị bỏ qua
- Lỗi upload ảnh sẽ được ghi log nhưng không block việc tạo giáo viên

### Cảnh báo
- Hiển thị các cảnh báo về thông tin thiếu
- Không ảnh hưởng đến quá trình import

## Ví dụ thực tế

### Ví dụ 1: Import file Excel với ảnh nhúng

```
File: teachers.xlsx

Row 1 (Header): Tên | Email | Username | Phone | Gender | BirthDate | Role | School | Address | [Ảnh] | Notes
Row 2: Nguyễn Văn A | nva@email.com | nva | 0123456789 | MALE | 01/01/1990 | teacher | THPT A | 123 ABC | [Ảnh nhúng trong ô J2] | Giáo viên Toán
Row 3: Trần Thị B | ttb@email.com | ttb | 0987654321 | FEMALE | 15/05/1992 | teacher | THPT B | 456 DEF | [Ảnh nhúng trong ô J3] | Giáo viên Văn
```

### Ví dụ 2: Import không có ảnh (không bắt buộc)
- Có thể bỏ qua cột J nếu không có ảnh hợp đồng
- Hệ thống vẫn tạo giáo viên nhưng không có contract image

## Lưu ý quan trọng

1. **Backup dữ liệu**: Luôn backup dữ liệu trước khi import
2. **Kiểm tra kỹ**: Xem lại dữ liệu và ảnh trước khi upload
3. **File size**: Tối đa 10MB cho file Excel (không tính ảnh)
4. **Số lượng**: Khuyến nghị không quá 100 giáo viên mỗi lần import
5. **Mật khẩu**: Tất cả tài khoản sẽ có mật khẩu mặc định "123456"
6. **Ảnh hợp đồng**: 
   - Phải nhúng đúng ô
   - Tự động upload lên Cloudinary
   - URL được lưu trong database
7. **Thời gian xử lý**: Tùy thuộc vào số lượng ảnh và kích thước file

## Khắc phục sự cố

### Ảnh không được upload
- **Nguyên nhân**: Ảnh không nằm đúng ô J
- **Giải pháp**: Di chuyển ảnh vào ô J và đảm bảo ảnh nằm hoàn toàn trong ô

### File Excel bị lỗi
- **Nguyên nhân**: File quá lớn hoặc format không đúng
- **Giải pháp**: Chỉ sử dụng .xlsx, giảm kích thước ảnh

### Upload chậm
- **Nguyên nhân**: Nhiều ảnh lớn cần upload lên Cloudinary
- **Giải pháp**: Giảm số lượng giáo viên mỗi lần import hoặc giảm kích thước ảnh

## Hỗ trợ

Nếu gặp vấn đề khi sử dụng tính năng:
1. Kiểm tra định dạng file (.xlsx, .xls)
2. Kiểm tra ảnh đã nhúng đúng ô
3. Xem lại các quy tắc validation
4. Kiểm tra kết nối internet (cho upload Cloudinary)
5. Liên hệ admin để được hỗ trợ

---

**Chúc bạn sử dụng tính năng thành công!** 🎉