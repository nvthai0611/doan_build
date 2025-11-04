# Cloudinary FAQ - Câu hỏi thường gặp

## ❓ Tên file có bị trùng không?

**Không!** Cloudinary tự động thêm unique ID.

### Ví dụ:
```
Upload: contract.jpg
→ Cloudinary: QNEduManagementSystem/teachers/contract_abc123xyz.jpg

Upload: contract.jpg (lần 2)
→ Cloudinary: QNEduManagementSystem/teachers/contract_def456uvw.jpg
```

**Kết luận**: Upload file tên gì cũng được, Cloudinary đảm bảo unique!

---

## ❓ Có thể upload file bất kỳ không?

**Có!** Cloudinary chấp nhận nhiều loại file:

### Images:
- JPG, JPEG, PNG, GIF, BMP, TIFF
- SVG, WEBP, ICO

### Documents:
- PDF, DOC, DOCX
- XLS, XLSX
- PPT, PPTX

### Videos:
- MP4, AVI, MOV
- (cần cấu hình thêm)

---

## ❓ Làm sao đổi tên file khi upload?

### Cách 1: Để Cloudinary tự động (Khuyên dùng)
```typescript
await CloudinaryUploadService.uploadImage(
  file,
  undefined,  // ← Cloudinary tự generate
  'teachers'
);
```

### Cách 2: Đặt tên custom
```typescript
await CloudinaryUploadService.uploadImage(
  file,
  'my-custom-name.jpg',  // ← Tên tùy chọn
  'teachers'
);
```

**Lưu ý**: Dù đặt tên gì, Cloudinary vẫn thêm unique suffix!

---

## ❓ Upload nhiều file cùng lúc?

```typescript
const files = [file1, file2, file3, file4];

const urls = await CloudinaryUploadService.uploadMultipleImages(
  files,
  undefined,  // Auto generate names
  'teachers'
);

console.log('All URLs:', urls);
```

---

## ❓ File size giới hạn bao nhiêu?

### Mặc định:
- **Images**: 10MB
- **Videos**: 100MB (nếu enable)
- **Documents**: 10MB

### Có thể tăng:
- Upgrade Cloudinary plan
- Hoặc config trong code

---

## ❓ Ảnh có bị nén không?

**Có!** Cloudinary tự động optimize:

```javascript
transformation: [
  { width: 1000, height: 1000, crop: 'limit' },  // Resize nếu quá lớn
  { quality: 'auto' },  // Tự động chọn quality tốt nhất
  { fetch_format: 'auto' }  // Tự động chọn format (WebP, etc)
]
```

### Ví dụ:
- Upload: 5MB JPG (3000x4000px)
- Cloudinary: 500KB WebP (1000x1333px) ← Nhẹ hơn, đẹp hơn!

---

## ❓ Xóa ảnh cũ khi update?

```typescript
// Backend only
const publicId = 'QNEduManagementSystem/teachers/old-image_abc123';
await cloudinaryService.deleteImage(publicId);
```

**Best practice**: Lưu `publicId` vào database để xóa sau!

---

## ❓ Cấu trúc folder tối ưu?

```
QNEduManagementSystem/
├── teachers/
│   ├── contracts/          ← Hợp đồng
│   ├── certificates/       ← Chứng chỉ
│   └── avatars/            ← Ảnh đại diện
├── students/
│   ├── avatars/
│   ├── documents/
│   └── certificates/
├── classes/
│   ├── materials/          ← Tài liệu học
│   └── photos/             ← Ảnh hoạt động
└── system/
    ├── banners/
    └── logos/
```

---

## ❓ URL ảnh có hết hạn không?

**KHÔNG!** URL từ Cloudinary **vĩnh viễn** (miễn Cloudinary còn).

### Ví dụ URL:
```
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/QNEduManagementSystem/teachers/contract_abc123.jpg
```

Lưu URL này vào database và dùng mãi mãi!

---

## ❓ Có thể resize ảnh khi lấy về không?

**Có!** Thêm transform vào URL:

### Original:
```
https://res.cloudinary.com/.../image/upload/v123/photo.jpg
```

### Resize 300x300:
```
https://res.cloudinary.com/.../image/upload/w_300,h_300,c_fill/v123/photo.jpg
```

### Thumbnail 100x100:
```
https://res.cloudinary.com/.../image/upload/w_100,h_100,c_thumb/v123/photo.jpg
```

### Blur:
```
https://res.cloudinary.com/.../image/upload/e_blur:300/v123/photo.jpg
```

**Tuyệt vời!** Không cần upload nhiều size!

---

## ❓ Bảo mật upload như thế nào?

### Backend validation:
```typescript
// Check file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// Check file size
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}
```

### Cloudinary auto-scan:
- Virus scan (premium)
- Content moderation (premium)

---

## ❓ Có thể dùng từ client trực tiếp không?

**Không khuyên!** Nên upload qua backend:

### ❌ Client → Cloudinary (Không an toàn)
```typescript
// Expose API keys = Nguy hiểm!
```

### ✅ Client → Backend → Cloudinary (An toàn)
```typescript
// Backend kiểm tra auth, validate file, etc
const url = await CloudinaryUploadService.uploadImage(...);
```

---

## 💡 Tips & Tricks

### 1. Lazy loading images:
```typescript
<img 
  src={cloudinaryUrl} 
  loading="lazy"  // ← Chỉ load khi scroll đến
  alt="..."
/>
```

### 2. Responsive images:
```typescript
// Small screen: 300px
const smallUrl = `${baseUrl}/w_300/photo.jpg`;

// Large screen: 1000px
const largeUrl = `${baseUrl}/w_1000/photo.jpg`;
```

### 3. Watermark:
```typescript
// Thêm logo lên ảnh
const watermarkedUrl = `${baseUrl}/l_logo,g_south_east,x_10,y_10/photo.jpg`;
```

---

**Còn câu hỏi?** Check: https://cloudinary.com/documentation
