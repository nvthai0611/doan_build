import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {                    
          folder: `QNEduManagementSystem/${folder}` || 'QNEduManagementSystem/default',
          resource_type: 'auto',
          use_filename: true,  // Giữ tên file gốc
          unique_filename: true,  // Thêm unique ID để tránh trùng
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Upload tài liệu (PDF, Word, Excel, PowerPoint, etc.)
   * Không có transformation, giữ nguyên file gốc
   */
  async uploadDocument(file: Express.Multer.File, folder?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `QNEduManagementSystem/${folder}` || 'QNEduManagementSystem/default',
          resource_type: 'auto', // Tự động detect: image, video, raw (documents)
          use_filename: true, // Giữ tên file gốc
          unique_filename: true, // Thêm unique ID để tránh trùng
          // KHÔNG có transformation cho documents
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder?: string): Promise<any[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload nhiều tài liệu cùng lúc
   */
  async uploadMultipleDocuments(files: Express.Multer.File[], folder?: string): Promise<any[]> {
    const uploadPromises = files.map(file => this.uploadDocument(file, folder));
    return Promise.all(uploadPromises);
  }
  
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async getImageUrl(publicId: string, options?: any): Promise<string> {
    return cloudinary.url(publicId, options);
  }

   /**
   * Tạo download URL với filename đúng (có extension)
   * Sử dụng fl_attachment flag của Cloudinary để force download với filename gốc
   * 
   * @param fileUrl - URL gốc từ Cloudinary (secure_url)
   * @param fileName - Tên file gốc muốn download (có extension: .pdf, .docx, v.v.)
   * @returns Download URL với filename được embed
   */
  getDownloadUrl(fileUrl: string, fileName: string): string {
    if (!fileUrl || !fileName) {
      throw new Error('fileUrl and fileName are required');
    }

    const downloadUrl = fileUrl.replace(
      '/upload/',
      `/upload/fl_attachment:${encodeURIComponent(fileName)}/`
    );

    return downloadUrl;
  }

  /**
   * Tạo download URL với filename đúng và format cụ thể
   * Hữu ích khi muốn convert format (ví dụ: ảnh PNG -> JPG)
   * 
   * @param fileUrl - URL gốc từ Cloudinary
   * @param fileName - Tên file muốn download
   * @param format - Format muốn convert (optional: jpg, png, pdf, v.v.)
   * @returns Download URL với filename và format
   */
  getDownloadUrlWithFormat(fileUrl: string, fileName: string, format?: string): string {
    if (!fileUrl || !fileName) {
      throw new Error('fileUrl and fileName are required');
    }

    const transformations = [`fl_attachment:${encodeURIComponent(fileName)}`];
    
    // Thêm format nếu cần
    if (format) {
      transformations.push(`f_${format}`);
    }

    const downloadUrl = fileUrl.replace(
      '/upload/',
      `/upload/${transformations.join(',')}/`
    );

    return downloadUrl;
  }
}