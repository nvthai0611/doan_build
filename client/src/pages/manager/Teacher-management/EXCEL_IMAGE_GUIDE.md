# Hướng dẫn thêm ảnh vào Excel đúng cách

## ⚠️ Vấn đề thường gặp
Khi copy/paste ảnh trực tiếp vào Excel, ảnh sẽ "float" (nổi) và không được nhúng vào file → Hệ thống không đọc được ảnh.

## ✅ Giải pháp

### Cách 1: Sử dụng Google Sheets (Khuyên dùng)

1. Mở Google Sheets
2. Tạo file Excel với các cột như template
3. Click vào ô J2 (cột Ảnh hợp đồng)
4. Vào menu **Insert** → **Image** → **Image in cell**
5. Chọn ảnh từ máy tính
6. Ảnh sẽ tự động nằm TRONG ô
7. **File** → **Download** → **Microsoft Excel (.xlsx)**

### Cách 2: Microsoft Excel (Phức tạp hơn)

**Bước 1:** Insert ảnh vào sheet
- Tab **Insert** → **Pictures** → **This Device**
- Chọn ảnh hợp đồng

**Bước 2:** Anchor ảnh vào cell
- Right-click vào ảnh
- Chọn **Size and Properties** (hoặc Format Picture)
- Tab **Properties**
- Chọn **Move and size with cells** (QUAN TRỌNG!)
- Di chuyển ảnh vào ô J2 đúng dòng dữ liệu

**Bước 3:** Save file
- **File** → **Save As** → chọn **.xlsx** format

### Cách 3: LibreOffice Calc

1. Insert → Image → From File
2. Chọn ảnh
3. Right-click → Anchor → To Cell
4. Di chuyển ảnh vào ô J (cột ảnh)
5. Save as .xlsx

---

## 🔧 Kiểm tra ảnh đã nhúng đúng chưa

Sau khi thêm ảnh:
1. Save file Excel
2. Upload lên hệ thống
3. Xem Console (F12) → Phải thấy: `Found X images in Excel` (X > 0)
4. Nếu thấy `Found 0 images` → Ảnh chưa nhúng đúng

---

## 💡 Giải pháp thay thế

Nếu vẫn gặp khó khăn, có thể:
- Bỏ qua cột ảnh trong Excel
- Upload ảnh riêng sau khi tạo giáo viên
- Hoặc sử dụng link ảnh từ Cloudinary

---

**Khuyến nghị:** Sử dụng **Google Sheets** vì đơn giản và chắc chắn ảnh được nhúng đúng!
