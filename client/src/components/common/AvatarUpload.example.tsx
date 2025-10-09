import React, { useState } from 'react';
import { CloudinaryUploadService } from '../../services/common/cloudinary/cloudinary-upload.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadSuccess: (url: string) => void;
  folder?: string; // Subfolder: 'avatars', 'teachers/avatars', etc.
}

export default function AvatarUpload({ 
  currentAvatar, 
  onUploadSuccess,
  folder = 'avatars' 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ được upload file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // Preview locally first
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Upload to Cloudinary
      const url = await CloudinaryUploadService.uploadImage(
        file,
        undefined, // Cloudinary tự đặt tên
        folder
      );

      // Success
      setPreviewUrl(url);
      onUploadSuccess(url);
      toast.success('Cập nhật ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể upload ảnh. Vui lòng thử lại.');
      setPreviewUrl(currentAvatar); // Revert to old avatar
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <Avatar className="w-32 h-32">
        <AvatarImage src={previewUrl} alt="Avatar" />
        <AvatarFallback>
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            'User'
          )}
        </AvatarFallback>
      </Avatar>

      {/* Upload Button */}
      <label htmlFor="avatar-upload">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Chọn ảnh
            </>
          )}
        </Button>
      </label>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <p className="text-sm text-gray-500">
        JPG, PNG, GIF. Tối đa 5MB.
      </p>
    </div>
  );
}

// ============================================
// CÁCH SỬ DỤNG
// ============================================

// Example 1: Upload avatar trong Profile page
// function ProfilePage() {
//   const handleAvatarUpload = async (url: string) => {
//     // Update user in database
//     await userService.updateProfile({ avatar: url });
//   };

//   return (
//     <AvatarUpload
//       currentAvatar={user.avatar}
//       onUploadSuccess={handleAvatarUpload}
//       folder="avatars"
//     />
//   );
// }

// Example 2: Upload avatar giáo viên
// function TeacherProfile() {
//   const handleAvatarUpload = async (url: string) => {
//     await teacherService.updateAvatar(teacherId, url);
//   };

//   return (
//     <AvatarUpload
//       currentAvatar={teacher.avatar}
//       onUploadSuccess={handleAvatarUpload}
//       folder="teachers/avatars"
//     />
//   );
// }

// Example 3: Upload avatar học sinh
// function StudentProfile() {
//   const handleAvatarUpload = async (url: string) => {
//     await studentService.updateAvatar(studentId, url);
//   };

//   return (
//     <AvatarUpload
//       currentAvatar={student.avatar}
//       onUploadSuccess={handleAvatarUpload}
//       folder="students/avatars"
//     />
//   );
// }
