// Types for File Management

export interface Material {
  id: number;
  classId: string;
  className: string;
  title: string;
  fileName: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloads: number;
}

export interface TeacherClass {
  id: string;
  name: string;
  grade?: string;
  gradeLevel?: number;
  subject: string;
}

export interface UploadMaterialParams {
  classId: string;
  title: string;
  category: 'lesson' | 'exercise' | 'exam' | 'material' | 'reference';
  description?: string;
  file: File;
}

export interface GetMaterialsParams {
  classId?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface MaterialsResponse {
  data: Material[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalSize?: number; // Tổng dung lượng của tất cả tài liệu
    totalDownloads?: number; // Tổng lượt tải của tất cả tài liệu
    recentUploads?: number; // Số tài liệu upload trong 7 ngày qua
  };
}

