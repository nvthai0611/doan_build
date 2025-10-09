# Hướng dẫn sử dụng Cloudinary Service

## Tổng quan
Service để upload ảnh lên Cloudinary với cấu trúc folder:
```
QNEduManagementSystem/
├── teachers/       # Ảnh hợp đồng giáo viên
├── students/       # Ảnh học sinh
├── contracts/      # Các hợp đồng khác
├── certificates/   # Chứng chỉ
├── documents/      # Tài liệu
└── avatars/        # Ảnh đại diện
```

## Sử dụng từ Frontend

### 1. Upload ảnh đơn

```typescript
import { CloudinaryUploadService } from '@/services/common/cloudinary-upload.service';

// Upload ảnh giáo viên
const url = await CloudinaryUploadService.uploadImage(
  file,
  'teacher-contract.jpg',
  'teachers'  // subfolder
);

// Upload ảnh học sinh
const url = await CloudinaryUploadService.uploadImage(
  file,
  'student-avatar.jpg',
  'students'
);

// Upload chứng chỉ
const url = await CloudinaryUploadService.uploadImage(
  file,
  'certificate.pdf',
  'certificates'
);
```

### 2. Upload nhiều ảnh

```typescript
const files = [file1, file2, file3];
const filenames = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

const urls = await CloudinaryUploadService.uploadMultipleImages(
  files,
  filenames
);

console.log('Uploaded URLs:', urls);
```

## Sử dụng từ Backend

### 1. Inject CloudinaryService

```typescript
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';

@Injectable()
export class YourService {
  constructor(private cloudinaryService: CloudinaryService) {}
  
  async uploadImage(file: Express.Multer.File) {
    // Upload vào folder cụ thể
    const result = await this.cloudinaryService.uploadImage(
      file,
      'QNEduManagementSystem/students'
    );
    
    return result.secure_url;
  }
}
```

### 2. Controller với file upload

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  const result = await this.cloudinaryService.uploadImage(
    file,
    'QNEduManagementSystem/documents'
  );
  
  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}
```

## Cấu trúc Folder

### Folder paths mặc định:
- `QNEduManagementSystem/teachers` - Hợp đồng giáo viên
- `QNEduManagementSystem/students` - Ảnh học sinh  
- `QNEduManagementSystem/avatars` - Ảnh đại diện
- `QNEduManagementSystem/certificates` - Chứng chỉ
- `QNEduManagementSystem/documents` - Tài liệu khác

### Tùy chỉnh folder:

```typescript
// Tạo subfolder theo năm học
const folder = `QNEduManagementSystem/teachers/${academicYear}`;

// Tạo subfolder theo trung tâm
const folder = `QNEduManagementSystem/centers/${centerId}/teachers`;
```

## API Endpoints

### Upload single image
```
POST /api/v1/cloudinary/upload-single
Content-Type: multipart/form-data

Body: {
  file: <FILE>
}

Response: {
  success: true,
  data: {
    url: "https://res.cloudinary.com/...",
    publicId: "QNEduManagementSystem/teachers/abc123",
    width: 1920,
    height: 1080
  }
}
```

### Upload multiple images
```
POST /api/v1/cloudinary/upload-multiple
Content-Type: multipart/form-data

Body: {
  files: [<FILE1>, <FILE2>, ...]
}
```

## Ví dụ thực tế

### 1. Upload avatar học sinh

```typescript
// Frontend
const avatarUrl = await CloudinaryUploadService.uploadImage(
  avatarFile,
  `student-${studentId}.jpg`,
  'students/avatars'
);

// Update student record
await studentService.updateStudent(studentId, {
  avatar: avatarUrl
});
```

### 2. Upload nhiều ảnh chứng chỉ

```typescript
const certificates = [cert1, cert2, cert3];
const urls = await CloudinaryUploadService.uploadMultipleImages(
  certificates,
  undefined, // Auto generate names
  'certificates'
);
```

### 3. Upload trong form

```typescript
const handleSubmit = async (formData) => {
  if (formData.image) {
    const imageUrl = await CloudinaryUploadService.uploadImage(
      formData.image,
      `${formData.username}-contract.jpg`,
      'teachers'
    );
    
    formData.contractImage = imageUrl;
  }
  
  await teacherService.create(formData);
};
```

## Lưu ý

1. **File size**: Tối đa 10MB cho mỗi file
2. **Format**: JPG, PNG, GIF, PDF
3. **Folder structure**: Luôn bắt đầu với `QNEduManagementSystem/`
4. **Naming**: Sử dụng slug-case, không dấu, không khoảng trắng
5. **Cleanup**: Xóa ảnh cũ khi update bằng `publicId`

## Xóa ảnh

```typescript
// Backend only
await this.cloudinaryService.deleteImage(publicId);
```

Publicld format: `QNEduManagementSystem/teachers/contract-abc123`
