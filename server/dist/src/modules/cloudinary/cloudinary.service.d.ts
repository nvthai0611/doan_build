import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<any>;
    uploadDocument(file: Express.Multer.File, folder?: string): Promise<any>;
    uploadMultipleImages(files: Express.Multer.File[], folder?: string): Promise<any[]>;
    uploadMultipleDocuments(files: Express.Multer.File[], folder?: string): Promise<any[]>;
    deleteImage(publicId: string): Promise<any>;
    getImageUrl(publicId: string, options?: any): Promise<string>;
    getDownloadUrl(fileUrl: string, fileName: string): string;
    getDownloadUrlWithFormat(fileUrl: string, fileName: string, format?: string): string;
}
