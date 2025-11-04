"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
let CloudinaryService = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file, folder) {
        return new Promise((resolve, reject) => {
            const originalName = file.originalname || 'upload';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const safeBaseName = baseName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-_]/g, '');
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder ? `QNEduManagementSystem/${folder}` : 'QNEduManagementSystem/default',
                resource_type: 'auto',
                use_filename: true,
                unique_filename: false,
                overwrite: false,
                public_id: safeBaseName,
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadDocument(file, folder) {
        return new Promise((resolve, reject) => {
            const originalName = file.originalname || 'document';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const safeBaseName = baseName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-_]/g, '');
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder ? `QNEduManagementSystem/${folder}` : 'QNEduManagementSystem/default',
                resource_type: 'auto',
                use_filename: true,
                unique_filename: false,
                overwrite: false,
                public_id: safeBaseName,
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadMultipleImages(files, folder) {
        const uploadPromises = files.map(file => this.uploadImage(file, folder));
        return Promise.all(uploadPromises);
    }
    async uploadMultipleDocuments(files, folder) {
        const uploadPromises = files.map(file => this.uploadDocument(file, folder));
        return Promise.all(uploadPromises);
    }
    async deleteImage(publicId) {
        return cloudinary_1.v2.uploader.destroy(publicId);
    }
    async getImageUrl(publicId, options) {
        return cloudinary_1.v2.url(publicId, options);
    }
    getDownloadUrl(fileUrl, fileName) {
        if (!fileUrl || !fileName) {
            throw new Error('fileUrl and fileName are required');
        }
        const downloadUrl = fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(fileName)}/`);
        return downloadUrl;
    }
    getDownloadUrlWithFormat(fileUrl, fileName, format) {
        if (!fileUrl || !fileName) {
            throw new Error('fileUrl and fileName are required');
        }
        const transformations = [`fl_attachment:${encodeURIComponent(fileName)}`];
        if (format) {
            transformations.push(`f_${format}`);
        }
        const downloadUrl = fileUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
        return downloadUrl;
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map