# Fix Case Sensitivity Issues

## Vấn đề
Git trên Windows không phân biệt case-sensitive, nên khi đổi tên thư mục từ `Teacher` → `teacher`, Git có thể không phát hiện thay đổi.

## Giải pháp

### Cách 1: Sử dụng Git command (khuyến nghị)

```bash
# 1. Di chuyển thư mục tạm thời
git mv src/pages/Teacher src/pages/teacher-temp

# 2. Đổi tên về teacher (lowercase)
git mv src/pages/teacher-temp src/pages/teacher

# 3. Commit
git add -A
git commit -m "Fix: Rename Teacher directory to teacher (case-sensitive)"
git push
```

### Cách 2: Nếu cách 1 không hoạt động

```bash
# 1. Xóa file khỏi Git (không xóa file thực tế)
git rm -r --cached src/pages/Teacher

# 2. Đảm bảo thư mục teacher (lowercase) tồn tại
# (Nếu chưa có, tạo lại)

# 3. Add lại với case đúng
git add src/pages/teacher

# 4. Commit và push
git commit -m "Fix: Rename Teacher directory to teacher (case-sensitive)"
git push
```

### Cách 3: Sử dụng script

```bash
chmod +x fix-case-sensitivity.sh
./fix-case-sensitivity.sh
```

## Lưu ý
- Đảm bảo tất cả imports đã được sửa thành `teacher` (chữ thường)
- Sau khi commit và push, Vercel sẽ build lại với case đúng

