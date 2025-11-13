import { Teacher } from "../../../pages/manager/Teacher-management/types/teacher"
import { apiClient, type ApiResponse } from "../../../utils/clientAxios"
import { ExcelParserService, type ParsedTeacherData } from "../../common/excel/excel-parser.service"

export interface CreateTeacherRequest {
  email: string
  fullName: string
  username: string
  phone?: string
  role: "teacher" | "admin" | "center_owner"
  contractEnd?: string
  subjects?: string[]
  salary?: number
  isActive?: boolean
  notes?: string
  // Thêm các field cho trường học và ảnh hợp đồng
  schoolName?: string
  schoolAddress?: string
  contractImage?: File | string // Accept both File and string (base64)
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  id: string
}

export interface QueryTeacherParams {
  search?: string
  role?: "teacher" | "admin" | "center_owner"
  status?: "active" | "inactive" | "all"
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  // Filter parameters
  gender?: string
  birthYear?: string
  salaryMin?: number
  salaryMax?: number
}

export interface TeacherResponse {
  data: Teacher[]
  message: string
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
  status: number
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value?: string
}

export interface ValidationWarning {
  row: number
  field: string
  message: string
  value?: string
}

export interface ImportResult {
  successCount: number
  errorCount: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export const centerOwnerTeacherService = {
  BASE_URL: "/admin-center/teachers",
  // Lấy danh sách giáo viên
  getTeachers: async (params?: QueryTeacherParams): Promise<ApiResponse<TeacherResponse>> => {
    const response = await apiClient.get<TeacherResponse>(`${centerOwnerTeacherService.BASE_URL}`, params);
    return response
  },

  // Lấy thông tin chi tiết giáo viên     
  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await apiClient.get<Teacher>(`${centerOwnerTeacherService.BASE_URL}/${id}`)
    return response.data
  },

  // Tạo giáo viên mới
  createTeacher: async (data: CreateTeacherRequest | FormData): Promise<Teacher> => {
    try {
      // Kiểm tra nếu là FormData (có file upload)
      const isFormData = data instanceof FormData
      const options = isFormData ? {
        contentType: "multipart/form-data"
      } : {}
      const response = await apiClient.post<Teacher>(`${centerOwnerTeacherService.BASE_URL}`, data, options)
      return response.data
    } catch (error: any) {
      console.error('Error creating teacher:', error)
      
      // Parse error message từ response
      let errorMessage = 'Có lỗi xảy ra khi tạo giáo viên'
      
      try {
        const errorData = error.response?.data || error.response || error
        
        // Xử lý message là array (format: [{ field: "error" }])
        if (Array.isArray(errorData.message)) {
          const messages = errorData.message
            .map((item: any) => {
              if (typeof item === 'string') {
                return item
              } else if (typeof item === 'object' && item !== null) {
                // Extract key-value pairs from object
                return Object.entries(item)
                  .map(([key, value]) => {
                    const fieldName = key === 'subjects' ? 'Chuyên môn' : key
                    return `${fieldName}: ${value}`
                  })
                  .join(', ')
              }
              return String(item)
            })
            .filter(Boolean)
            .join('; ')
          errorMessage = messages || errorMessage
        }
        // Xử lý message là string
        else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message
        }
        // Xử lý error object trực tiếp
        else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError)
      }
      
      // Throw error với message là string
      const errorToThrow = new Error(errorMessage)
      // Giữ nguyên error response để component có thể xử lý thêm
      ;(errorToThrow as any).response = error.response
      throw errorToThrow
    }
  },

  // Cập nhật thông tin giáo viên
  updateTeacher: async (id: string, data: Partial<CreateTeacherRequest>): Promise<Teacher> => {
    const response = await apiClient.patch<Teacher>(`${centerOwnerTeacherService.BASE_URL}/${id}`, data)
    return response.data
  },

  // Xóa giáo viên
  deleteTeacher: async (id: string): Promise<void> => {
    await apiClient.delete(`${centerOwnerTeacherService.BASE_URL}/${id}`)
  },

  // Toggle trạng thái giáo viên
  toggleTeacherStatus: async (id: string): Promise<Teacher> => {
        const response = await apiClient.patch<Teacher>(`${centerOwnerTeacherService.BASE_URL}/${id}/toggle-status`)
    return response.data
  },

  // Tải xuống template
  downloadTemplate: async (): Promise<Blob> => {
    try {
      return await ExcelParserService.generateTemplate();
    } catch (error) {
      console.error('Error generating template:', error)
      throw new Error('Không thể tạo template Excel')
    }
  },

  // Tải lên file Excel và import teachers
  uploadTeachers: async (file: File): Promise<ImportResult> => {
    try {
      // Parse Excel file và extract ảnh
      const teachers = await ExcelParserService.parseTeachersExcel(file);
      
      // Bước 1: Validate data cơ bản ở frontend
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      
      // Validate từng teacher
      teachers.forEach((teacher, index) => {
        const row = index + 2;
        
        // Validate required fields
        if (!teacher.name) {
          errors.push({ row, field: 'name', message: 'Tên là bắt buộc', value: '' });
        }
        if (!teacher.email) {
          errors.push({ row, field: 'email', message: 'Email là bắt buộc', value: '' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) {
          errors.push({ row, field: 'email', message: 'Email không hợp lệ', value: teacher.email });
        }
        if (!teacher.username) {
          errors.push({ row, field: 'username', message: 'Username là bắt buộc', value: '' });
        } else if (teacher.username.length < 3) {
          errors.push({ row, field: 'username', message: 'Username phải có ít nhất 3 ký tự', value: teacher.username });
        }
        if (!teacher.phone) {
          errors.push({ row, field: 'phone', message: 'Số điện thoại là bắt buộc', value: '' });
        } else if (!/^[0-9]{10,11}$/.test(teacher.phone.replace(/\s/g, ''))) {
          errors.push({ row, field: 'phone', message: 'Số điện thoại phải có 10-11 số', value: teacher.phone });
        }
        if (!teacher.gender) {
          errors.push({ row, field: 'gender', message: 'Giới tính là bắt buộc', value: '' });
        }
        if (!teacher.birthDate) {
          errors.push({ row, field: 'birthDate', message: 'Ngày sinh là bắt buộc', value: '' });
        }
        if (!teacher.schoolName) {
          errors.push({ row, field: 'schoolName', message: 'Tên trường là bắt buộc', value: '' });
        }
        
        // Warning cho ảnh
        if (!teacher.contractImageBlob && !(teacher as any).contractImageUrl) {
          warnings.push({
            row,
            field: 'contractImage',
            message: 'Không có ảnh hợp đồng. Bạn có thể upload ảnh sau.',
            value: ''
          });
        }
      });
      
      // Nếu có lỗi validation, trả về ngay KHÔNG upload ảnh
      if (errors.length > 0) {
        console.log('❌ Frontend validation failed, not uploading images');
        return {
          successCount: 0,
          errorCount: errors.length,
          errors,
          warnings
        };
      }
      
      // Bước 2: Validate trên backend (check duplicate, etc)
      console.log('✓ Frontend validation passed, checking backend...');
      
      const tempData = teachers.map(teacher => ({
        name: teacher.name,
        email: teacher.email,
        username: teacher.username,
        phone: teacher.phone,
        gender: teacher.gender,
        birthDate: teacher.birthDate,
        role: teacher.role,
        schoolName: teacher.schoolName,
        schoolAddress: teacher.schoolAddress,
        notes: teacher.notes,
      }));
      
      const validateResponse = await apiClient.post(`${centerOwnerTeacherService.BASE_URL}/bulk-import-validate`, {
        teachers: tempData
      });
      
      // Nếu backend trả về lỗi, DỪNG và KHÔNG upload ảnh
      const backendData = validateResponse.data as any;
      if (backendData?.errorCount > 0) {
        console.log('❌ Backend validation failed, not uploading images');
        return {
          successCount: backendData.successCount || 0,
          errorCount: backendData.errorCount || 0,
          errors: backendData.errors || [],
          warnings: [...(backendData.warnings || []), ...warnings]
        };
      }
      
      // Bước 3: Backend validation OK → Upload ảnh lên Cloudinary
      console.log('✓ Data valid, uploading images to Cloudinary...');
      const { CloudinaryUploadService } = await import('../../common/cloudinary/cloudinary-upload.service');
      
      const teachersDataWithImages = await Promise.all(teachers.map(async (teacher, index) => {
        let contractImageUrl = (teacher as any).contractImageUrl || '';
        
        // Chỉ upload nếu có imageBlob
        if (teacher.contractImageBlob) {
          try {
            contractImageUrl = await CloudinaryUploadService.uploadImage(
              teacher.contractImageBlob,
              undefined,
              'teachers'
            );
            console.log(`  ✓ Uploaded image for ${teacher.name}`);
          } catch (error) {
            console.error(`  ✗ Error uploading image for ${teacher.name}:`, error);
            warnings.push({
              row: index + 2,
              field: 'contractImage',
              message: 'Không thể upload ảnh hợp đồng lên Cloudinary',
              value: ''
            });
          }
        }
        
        return {
          name: teacher.name,
          email: teacher.email,
          username: teacher.username,
          phone: teacher.phone,
          gender: teacher.gender,
          birthDate: teacher.birthDate,
          role: teacher.role,
          schoolName: teacher.schoolName,
          schoolAddress: teacher.schoolAddress,
          contractImage: contractImageUrl,
          notes: teacher.notes,
        };
      }));

      // Bước 4: Gửi data + URL ảnh lên backend để tạo teachers
      console.log('✓ Images uploaded, creating teachers...');
      const response = await apiClient.post(`${centerOwnerTeacherService.BASE_URL}/bulk-import`, {
        teachers: teachersDataWithImages
      });
      
      return response.data as ImportResult
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Handle different types of errors
      if (error.status === 0) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      } else if (error.response?.message) {
        throw new Error(error.response.message)
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('Có lỗi xảy ra khi upload file')
      }
    }
  },

  // Tải xuống tất cả dữ liệu
  downloadAllTeachers: async (): Promise<Blob> => {
    const response = await apiClient.get(`${centerOwnerTeacherService.BASE_URL}/export`, undefined, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    return response.data as Blob
  },

  getTeacherSchedule: async (teacherId: string, year?: number, month?: number) => {
    const params: any = {}
    if (year) params.year = year.toString()
    if (month) params.month = month.toString()
      const response = await apiClient.get(`${centerOwnerTeacherService.BASE_URL}/${teacherId}/schedule`, params)
    
    return response
  },
  
  updateAttendance: async (sessionId: string, studentId: string, status: "present" | "absent" | "late") => {
    const response = await apiClient.patch(`${centerOwnerTeacherService.BASE_URL}/${sessionId}/attendance`, {
      studentId,
      status,
    })
    return response
  },

  createSession: async (sessionData: any) => {
    const response = await apiClient.post(`${centerOwnerTeacherService.BASE_URL}`, sessionData)
    return response
  },
}
